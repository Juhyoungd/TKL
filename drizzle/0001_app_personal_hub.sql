ALTER TABLE `profiles` ADD `avatar_url` text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE `profiles` ADD `activity_regions` text DEFAULT '[]' NOT NULL;
--> statement-breakpoint
ALTER TABLE `profiles` ADD `keywords` text DEFAULT '[]' NOT NULL;
--> statement-breakpoint
ALTER TABLE `profiles` ADD `push_enabled` integer DEFAULT false NOT NULL;
--> statement-breakpoint
CREATE TABLE `saved_posts` (
	`user_id` text NOT NULL,
	`post_id` text NOT NULL,
	`created_at` text NOT NULL,
	PRIMARY KEY(`user_id`, `post_id`)
);
--> statement-breakpoint
CREATE INDEX `idx_saved_posts_user_created` ON `saved_posts` (`user_id`,`created_at`);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`kind` text NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`post_id` text,
	`read_at` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_notifications_user_created` ON `notifications` (`user_id`,`created_at`);
--> statement-breakpoint
CREATE TABLE `push_subscriptions` (
	`endpoint` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`p256dh` text NOT NULL,
	`auth` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_push_subscriptions_user` ON `push_subscriptions` (`user_id`);
--> statement-breakpoint
CREATE TABLE `chat_rooms` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text NOT NULL,
	`offer_id` text NOT NULL,
	`requester_id` text NOT NULL,
	`partner_id` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_chat_rooms_requester` ON `chat_rooms` (`requester_id`,`updated_at`);
--> statement-breakpoint
CREATE INDEX `idx_chat_rooms_partner` ON `chat_rooms` (`partner_id`,`updated_at`);
--> statement-breakpoint
CREATE TABLE `chat_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`room_id` text NOT NULL,
	`sender_id` text NOT NULL,
	`body` text NOT NULL,
	`read_at` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_chat_messages_room_created` ON `chat_messages` (`room_id`,`created_at`);
--> statement-breakpoint
PRAGMA optimize;
