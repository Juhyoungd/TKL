ALTER TABLE `profiles` ADD `auth_provider` text DEFAULT 'chatgpt' NOT NULL;
--> statement-breakpoint
ALTER TABLE `profiles` ADD `account_status` text DEFAULT 'active' NOT NULL;
--> statement-breakpoint
ALTER TABLE `profiles` ADD `phone_verified_at` text;
--> statement-breakpoint
ALTER TABLE `offers` ADD `rejection_reason` text;
--> statement-breakpoint
ALTER TABLE `support_tickets` ADD `answer` text;
--> statement-breakpoint
ALTER TABLE `support_tickets` ADD `updated_at` text;
--> statement-breakpoint
ALTER TABLE `chat_messages` ADD `attachment_url` text;
--> statement-breakpoint
CREATE TABLE `social_accounts` (
	`provider` text NOT NULL,
	`provider_user_id` text NOT NULL,
	`user_id` text NOT NULL,
	`email` text,
	`created_at` text NOT NULL,
	PRIMARY KEY(`provider`, `provider_user_id`)
);
--> statement-breakpoint
CREATE INDEX `idx_social_accounts_user` ON `social_accounts` (`user_id`);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text NOT NULL,
	`offer_id` text NOT NULL,
	`requester_id` text NOT NULL,
	`partner_id` text NOT NULL,
	`agreed_price` integer NOT NULL,
	`status` text DEFAULT 'in_progress' NOT NULL,
	`cancel_reason` text,
	`completed_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_transactions_requester_status` ON `transactions` (`requester_id`,`status`);
--> statement-breakpoint
CREATE INDEX `idx_transactions_partner_status` ON `transactions` (`partner_id`,`status`);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`transaction_id` text NOT NULL,
	`author_id` text NOT NULL,
	`target_user_id` text NOT NULL,
	`rating` integer NOT NULL,
	`body` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_reviews_target_created` ON `reviews` (`target_user_id`,`created_at`);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` text PRIMARY KEY NOT NULL,
	`reporter_id` text NOT NULL,
	`target_type` text NOT NULL,
	`target_id` text NOT NULL,
	`reason` text NOT NULL,
	`status` text DEFAULT 'received' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_reports_status_created` ON `reports` (`status`,`created_at`);
--> statement-breakpoint
CREATE TABLE `user_blocks` (
	`blocker_id` text NOT NULL,
	`blocked_id` text NOT NULL,
	`created_at` text NOT NULL,
	PRIMARY KEY(`blocker_id`, `blocked_id`)
);
--> statement-breakpoint
CREATE TABLE `announcements` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`published_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_announcements_status_published` ON `announcements` (`status`,`published_at`);
--> statement-breakpoint
PRAGMA optimize;
