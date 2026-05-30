CREATE TABLE `google_auth_tokens` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`google_sub` text NOT NULL,
	`email` text,
	`name` text,
	`picture` text,
	`access_token` text,
	`refresh_token` text,
	`scope` text,
	`token_type` text,
	`expiry_date` integer,
	`id_token` text,
	`last_login_at` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `google_auth_tokens_google_sub_idx` ON `google_auth_tokens` (`google_sub`);--> statement-breakpoint
CREATE TABLE `inbound_emails` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`idempotency_key` text NOT NULL,
	`provider` text NOT NULL,
	`account` text,
	`mailbox` text,
	`uid` text,
	`message_id` text,
	`sender` text,
	`subject` text,
	`unsubscribe_link` text,
	`payload_json` text NOT NULL,
	`received_at` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `inbound_emails_idempotency_key_idx` ON `inbound_emails` (`idempotency_key`);