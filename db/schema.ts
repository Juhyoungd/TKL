import { index, integer, primaryKey, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const profiles = sqliteTable("profiles", {
  userId: text("user_id").primaryKey(),
  email: text("email").notNull(),
  nickname: text("nickname").notNull(),
  authProvider: text("auth_provider", { enum: ["chatgpt", "google", "naver", "guest"] }).notNull().default("chatgpt"),
  accountStatus: text("account_status", { enum: ["active", "suspended", "withdrawn"] }).notNull().default("active"),
  phoneVerifiedAt: text("phone_verified_at"),
  avatarUrl: text("avatar_url").notNull().default(""),
  regionDong: text("region_dong").notNull().default("지역 미설정"),
  activityRegions: text("activity_regions").notNull().default("[]"),
  categories: text("categories").notNull().default("[]"),
  keywords: text("keywords").notNull().default("[]"),
  pushEnabled: integer("push_enabled", { mode: "boolean" }).notNull().default(false),
  trustScore: real("trust_score").notNull().default(36.5),
  completedCount: integer("completed_count").notNull().default(0),
  termsAcceptedAt: text("terms_accepted_at").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const posts = sqliteTable("posts", {
  id: text("id").primaryKey(),
  authorId: text("author_id").notNull(),
  authorName: text("author_name").notNull(),
  type: text("type", { enum: ["buy", "urgent"] }).notNull(),
  category: text("category").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  desiredPrice: integer("desired_price").notNull(),
  regionDong: text("region_dong").notNull(),
  deadline: text("deadline"),
  status: text("status", { enum: ["open", "reserved", "closed"] }).notNull().default("open"),
  viewCount: integer("view_count").notNull().default(0),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [
  index("idx_posts_type_created").on(table.type, table.createdAt),
  index("idx_posts_region_status").on(table.regionDong, table.status),
  index("idx_posts_author").on(table.authorId),
  index("idx_posts_category").on(table.category),
]);

export const offers = sqliteTable("offers", {
  id: text("id").primaryKey(),
  postId: text("post_id").notNull(),
  proposerId: text("proposer_id").notNull(),
  proposerName: text("proposer_name").notNull(),
  proposedPrice: integer("proposed_price").notNull(),
  message: text("message").notNull(),
  rejectionReason: text("rejection_reason"),
  status: text("status", { enum: ["pending", "accepted", "canceled", "rejected"] }).notNull().default("pending"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [
  index("idx_offers_post_status").on(table.postId, table.status),
  index("idx_offers_proposer").on(table.proposerId),
]);

export const supportTickets = sqliteTable("support_tickets", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  status: text("status", { enum: ["received", "in_progress", "resolved"] }).notNull().default("received"),
  answer: text("answer"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at"),
}, (table) => [index("idx_support_user_created").on(table.userId, table.createdAt)]);

export const savedPosts = sqliteTable("saved_posts", {
  userId: text("user_id").notNull(),
  postId: text("post_id").notNull(),
  createdAt: text("created_at").notNull(),
}, (table) => [
  primaryKey({ columns: [table.userId, table.postId] }),
  index("idx_saved_posts_user_created").on(table.userId, table.createdAt),
]);

export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  kind: text("kind", { enum: ["offer", "trade", "chat", "keyword", "system"] }).notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  postId: text("post_id"),
  readAt: text("read_at"),
  createdAt: text("created_at").notNull(),
}, (table) => [index("idx_notifications_user_created").on(table.userId, table.createdAt)]);

export const pushSubscriptions = sqliteTable("push_subscriptions", {
  endpoint: text("endpoint").primaryKey(),
  userId: text("user_id").notNull(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [index("idx_push_subscriptions_user").on(table.userId)]);

export const chatRooms = sqliteTable("chat_rooms", {
  id: text("id").primaryKey(),
  postId: text("post_id").notNull(),
  offerId: text("offer_id").notNull(),
  requesterId: text("requester_id").notNull(),
  partnerId: text("partner_id").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [
  index("idx_chat_rooms_requester").on(table.requesterId, table.updatedAt),
  index("idx_chat_rooms_partner").on(table.partnerId, table.updatedAt),
]);

export const chatMessages = sqliteTable("chat_messages", {
  id: text("id").primaryKey(),
  roomId: text("room_id").notNull(),
  senderId: text("sender_id").notNull(),
  body: text("body").notNull(),
  attachmentUrl: text("attachment_url"),
  readAt: text("read_at"),
  createdAt: text("created_at").notNull(),
}, (table) => [index("idx_chat_messages_room_created").on(table.roomId, table.createdAt)]);

export const socialAccounts = sqliteTable("social_accounts", {
  provider: text("provider", { enum: ["chatgpt", "google", "naver"] }).notNull(),
  providerUserId: text("provider_user_id").notNull(),
  userId: text("user_id").notNull(),
  email: text("email"),
  createdAt: text("created_at").notNull(),
}, (table) => [
  primaryKey({ columns: [table.provider, table.providerUserId] }),
  index("idx_social_accounts_user").on(table.userId),
]);

export const transactions = sqliteTable("transactions", {
  id: text("id").primaryKey(),
  postId: text("post_id").notNull(),
  offerId: text("offer_id").notNull(),
  requesterId: text("requester_id").notNull(),
  partnerId: text("partner_id").notNull(),
  agreedPrice: integer("agreed_price").notNull(),
  status: text("status", { enum: ["in_progress", "completed", "canceled"] }).notNull().default("in_progress"),
  cancelReason: text("cancel_reason"),
  completedAt: text("completed_at"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [
  index("idx_transactions_requester_status").on(table.requesterId, table.status),
  index("idx_transactions_partner_status").on(table.partnerId, table.status),
]);

export const reviews = sqliteTable("reviews", {
  id: text("id").primaryKey(),
  transactionId: text("transaction_id").notNull(),
  authorId: text("author_id").notNull(),
  targetUserId: text("target_user_id").notNull(),
  rating: integer("rating").notNull(),
  body: text("body").notNull(),
  createdAt: text("created_at").notNull(),
}, (table) => [index("idx_reviews_target_created").on(table.targetUserId, table.createdAt)]);

export const reports = sqliteTable("reports", {
  id: text("id").primaryKey(),
  reporterId: text("reporter_id").notNull(),
  targetType: text("target_type", { enum: ["user", "post", "chat"] }).notNull(),
  targetId: text("target_id").notNull(),
  reason: text("reason").notNull(),
  status: text("status", { enum: ["received", "reviewing", "resolved", "dismissed"] }).notNull().default("received"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [index("idx_reports_status_created").on(table.status, table.createdAt)]);

export const userBlocks = sqliteTable("user_blocks", {
  blockerId: text("blocker_id").notNull(),
  blockedId: text("blocked_id").notNull(),
  createdAt: text("created_at").notNull(),
}, (table) => [primaryKey({ columns: [table.blockerId, table.blockedId] })]);

export const announcements = sqliteTable("announcements", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  status: text("status", { enum: ["draft", "published", "archived"] }).notNull().default("draft"),
  publishedAt: text("published_at"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [index("idx_announcements_status_published").on(table.status, table.publishedAt)]);
