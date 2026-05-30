import type { ParsedMail } from 'mailparser';

import type { InboundEmailPayload } from '../types';

function headersToRecord(parsed: ParsedMail): Record<string, string | string[] | undefined> {
  const out: Record<string, string | string[] | undefined> = {};

  for (const [key, value] of parsed.headers) {
    if (typeof value === 'string') {
      out[key] = value;
      continue;
    }

    if (Array.isArray(value)) {
      out[key] = value.map((item) => (typeof item === 'string' ? item : String(item)));
      continue;
    }

    out[key] = String(value);
  }

  return out;
}

export function normalizeImapMessage(input: { account: string; mailbox: string; uid: number; parsed: ParsedMail }): InboundEmailPayload {
  const { account, mailbox, uid, parsed } = input;

  return {
    provider: 'imap',
    account,
    mailbox,
    uid,
    messageId: parsed.messageId ?? undefined,
    from: parsed.from?.text ?? undefined,
    sender: parsed.from?.text ?? undefined,
    subject: parsed.subject ?? undefined,
    date: parsed.date?.toISOString(),
    headers: headersToRecord(parsed),
    text: parsed.text ?? undefined,
    html: typeof parsed.html === 'string' ? parsed.html : undefined,
    listUnsubscribe: parsed.headers.get('list-unsubscribe') as string | undefined,
  };
}
