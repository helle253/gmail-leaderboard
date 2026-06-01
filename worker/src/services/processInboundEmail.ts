import { insertInboundEmail } from '../db/repos/inboundEmailsRepo';
import type { InboundEmailPayload } from '../types';
import { findUnsubscribeLink } from '../utils/findUnsubscribeLink';

function extractSenderEmail(sender: string): string {
  const angleMatch = sender.match(/<([^<>\s]+@[^<>\s]+)>/);
  if (angleMatch?.[1]) return angleMatch[1].trim().toLowerCase();

  const plainMatch = sender.match(/\b[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+\b/);
  if (plainMatch?.[0]) return plainMatch[0].trim().toLowerCase();

  return sender;
}

export async function processInboundEmail(payload: InboundEmailPayload): Promise<void> {
  const rawSender = payload.sender ?? payload.from ?? '(unknown sender)';
  const sender = extractSenderEmail(rawSender);
  const subject = payload.subject ?? '(no subject)';
  const unsubscribeLink = findUnsubscribeLink(payload);

  await insertInboundEmail({
    payload,
    sender,
    subject,
    unsubscribeLink,
  });

  console.log('Inbound email received');
  console.log(`provider: ${payload.provider ?? 'imap'}`);
  console.log(`account: ${payload.account ?? '(none)'}`);
  console.log(`mailbox: ${payload.mailbox ?? '(none)'}`);
  console.log(`uid: ${payload.uid ?? '(none)'}`);
  console.log(`messageId: ${payload.messageId ?? '(none)'}`);
  console.log(`sender: ${sender}`);
  console.log(`subject: ${subject}`);
  console.log(`unsubscribe: ${unsubscribeLink ?? 'none found'}`);
}
