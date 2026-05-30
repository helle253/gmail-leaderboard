export type InboundEmailPayload = {
  provider?: 'imap' | 'gmail' | 'outlook' | 'yahoo' | 'custom';
  account?: string;
  mailbox?: string;
  uid?: number | string;
  messageId?: string;
  from?: string;
  sender?: string;
  subject?: string;
  date?: string;
  headers?: Record<string, string | string[] | undefined>;
  text?: string;
  html?: string;
  listUnsubscribe?: string;
  unsubscribeLink?: string;
};

