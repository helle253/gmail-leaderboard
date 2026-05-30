import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const googleAuthTokens = sqliteTable(
  'google_auth_tokens',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    googleSub: text('google_sub').notNull(),
    email: text('email'),
    name: text('name'),
    picture: text('picture'),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    scope: text('scope'),
    tokenType: text('token_type'),
    expiryDate: integer('expiry_date', { mode: 'number' }),
    idToken: text('id_token'),
    lastLoginAt: integer('last_login_at', { mode: 'number' }).notNull(),
    createdAt: integer('created_at', { mode: 'number' })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'number' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [uniqueIndex('google_auth_tokens_google_sub_idx').on(table.googleSub)],
);

export const inboundEmails = sqliteTable(
  'inbound_emails',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    idempotencyKey: text('idempotency_key').notNull(),
    provider: text('provider').notNull(),
    account: text('account'),
    mailbox: text('mailbox'),
    uid: text('uid'),
    messageId: text('message_id'),
    sender: text('sender'),
    subject: text('subject'),
    unsubscribeLink: text('unsubscribe_link'),
    payloadJson: text('payload_json').notNull(),
    receivedAt: integer('received_at', { mode: 'number' }).notNull(),
    createdAt: integer('created_at', { mode: 'number' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [uniqueIndex('inbound_emails_idempotency_key_idx').on(table.idempotencyKey)],
);
