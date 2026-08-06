CREATE TABLE `offers` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text NOT NULL,
	`proposer_id` text NOT NULL,
	`proposer_name` text NOT NULL,
	`proposed_price` integer NOT NULL,
	`message` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_offers_post_status` ON `offers` (`post_id`,`status`);--> statement-breakpoint
CREATE INDEX `idx_offers_proposer` ON `offers` (`proposer_id`);--> statement-breakpoint
CREATE TABLE `posts` (
	`id` text PRIMARY KEY NOT NULL,
	`author_id` text NOT NULL,
	`author_name` text NOT NULL,
	`type` text NOT NULL,
	`category` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`desired_price` integer NOT NULL,
	`region_dong` text NOT NULL,
	`deadline` text,
	`status` text DEFAULT 'open' NOT NULL,
	`view_count` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_posts_type_created` ON `posts` (`type`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_posts_region_status` ON `posts` (`region_dong`,`status`);--> statement-breakpoint
CREATE INDEX `idx_posts_author` ON `posts` (`author_id`);--> statement-breakpoint
CREATE INDEX `idx_posts_category` ON `posts` (`category`);--> statement-breakpoint
CREATE TABLE `profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`nickname` text NOT NULL,
	`region_dong` text DEFAULT '지역 미설정' NOT NULL,
	`categories` text DEFAULT '[]' NOT NULL,
	`trust_score` real DEFAULT 36.5 NOT NULL,
	`completed_count` integer DEFAULT 0 NOT NULL,
	`terms_accepted_at` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `support_tickets` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`email` text NOT NULL,
	`subject` text NOT NULL,
	`body` text NOT NULL,
	`status` text DEFAULT 'received' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_support_user_created` ON `support_tickets` (`user_id`,`created_at`);
--> statement-breakpoint
PRAGMA optimize;
