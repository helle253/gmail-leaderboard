import { insertInboundEmail } from '../db/repos/inboundEmailsRepo';
import type { InboundEmailPayload } from '../types';
import { findUnsubscribeLink } from '../utils/findUnsubscribeLink';

export async function processInboundEmail(payload: InboundEmailPayload): Promise<void> {
  const sender = payload.sender ?? payload.from ?? '(unknown sender)';
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
