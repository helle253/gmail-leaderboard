import type { InboundEmailPayload } from '../../types';
import { db } from '../client';
import { inboundEmails } from '../schema';

type InsertInboundEmailInput = {
  payload: InboundEmailPayload;
  sender: string;
  subject: string;
  unsubscribeLink: string | null;
};

function buildIdempotencyKey(payload: InboundEmailPayload): string {
  const provider = payload.provider ?? 'imap';
  const account = payload.account ?? '';
  const mailbox = payload.mailbox ?? '';
  const uid = payload.uid == null ? '' : String(payload.uid);
  const messageId = payload.messageId ?? '';

  return [provider, account, mailbox, uid, messageId].join('|');
}

export async function insertInboundEmail(input: InsertInboundEmailInput): Promise<void> {
  const { payload, sender, subject, unsubscribeLink } = input;

  await db
    .insert(inboundEmails)
    .values({
      idempotencyKey: buildIdempotencyKey(payload),
      provider: payload.provider ?? 'imap',
      account: payload.account,
      mailbox: payload.mailbox,
      uid: payload.uid == null ? null : String(payload.uid),
      messageId: payload.messageId,
      sender,
      subject,
      unsubscribeLink,
      payloadJson: JSON.stringify(payload),
      receivedAt: Math.floor(Date.now() / 1000),
    })
    .onConflictDoNothing();
}
