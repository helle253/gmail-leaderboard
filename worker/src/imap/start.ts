import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';

import { getValidGoogleAccessToken } from '../services/googleAuth';
import { processInboundEmail } from '../services/processInboundEmail';
import { normalizeImapMessage } from './normalize';

type ImapConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  mailbox: string;
};

function readImapConfig(): Omit<ImapConfig, 'user'> {
  const host = process.env.IMAP_HOST;

  if (!host) throw new Error('Missing IMAP config: IMAP_HOST is required');

  return {
    host,
    port: Number(process.env.IMAP_PORT ?? 993),
    secure: process.env.IMAP_SECURE !== 'false',
    mailbox: process.env.IMAP_MAILBOX ?? 'INBOX',
  };
}

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

async function ingestUnseen(client: ImapFlow, config: ImapConfig): Promise<void> {
  const unseenUids = await client.search({ seen: false });

  if (!Array.isArray(unseenUids)) return;

  for (const uid of unseenUids) {
    const message = await client.fetchOne(uid, { uid: true, source: true });

    if (!message || !('source' in message) || !message.source) continue;

    const parsed = await simpleParser(message.source);
    const payload = normalizeImapMessage({
      account: config.user,
      mailbox: config.mailbox,
      uid,
      parsed,
    });

    await processInboundEmail(payload);
  }
}

export async function startImapLoop(): Promise<void> {
  const baseConfig = readImapConfig();

  while (true) {
    let googleAuth: Awaited<ReturnType<typeof getValidGoogleAccessToken>>;

    try {
      googleAuth = await getValidGoogleAccessToken();
    } catch (error) {
      console.warn('[imap] waiting for Google auth session (sign in from client)...');
      console.warn(error);
      await sleep(5000);
      continue;
    }

    const imapUser = googleAuth.email;

    if (!imapUser) throw new Error('Missing IMAP user. Set IMAP_USER or ensure Google profile includes email.');

    const config = { ...baseConfig, user: imapUser };

    const imapConfig = {
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: imapUser,
        accessToken: googleAuth.accessToken,
      },
      logger: false as const,
    };
    const client = new ImapFlow(imapConfig);

    try {
      await client.connect();
      await client.mailboxOpen(config.mailbox);

      console.log(`[imap] connected to ${config.host}:${config.port} mailbox=${config.mailbox} user=${imapUser}`);

      let ingestChain: Promise<void> = Promise.resolve();
      const runIngest = (): void => {
        ingestChain = ingestChain.then(() => ingestUnseen(client, config)).catch((error) => console.error('[imap] ingest error:', error));
      };

      runIngest();
      client.on('exists', () => runIngest());

      await new Promise<void>((resolve, reject) => {
        client.on('close', resolve);
        client.on('error', reject);
      });
    } catch (error) {
      console.error('[imap] connection error:', error);
    } finally {
      try {
        await client.logout();
      } catch {
        // noop
      }
    }

    console.log('[imap] reconnecting in 5s...');
    await sleep(5000);
  }
}
