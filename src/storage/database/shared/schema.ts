import { pgTable, serial, varchar, timestamp, boolean, integer, jsonb, text, numeric, index } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

// System table - DO NOT DELETE
export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

// ==================== Users & Authentication ====================

export const users = pgTable(
	"users",
	{
		id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
		email: varchar("email", { length: 255 }).notNull().unique(),
		passwordHash: varchar("password_hash", { length: 255 }).notNull(),
		name: varchar("name", { length: 100 }),
		role: varchar("role", { length: 20 }).notNull().default("client"), // 'admin', 'client', 'operator'
		status: varchar("status", { length: 20 }).notNull().default("active"), // 'active', 'inactive', 'suspended', 'deleted'
		lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index("users_email_idx").on(table.email),
		index("users_role_idx").on(table.role),
		index("users_status_idx").on(table.status),
	]
);

export const userSessions = pgTable(
	"user_sessions",
	{
		id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
		userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
		tokenHash: varchar("token_hash", { length: 255 }).notNull(),
		expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
		ipAddress: varchar("ip_address", { length: 50 }),
		deviceInfo: varchar("device_info", { length: 255 }),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index("user_sessions_user_id_idx").on(table.userId),
		index("user_sessions_token_hash_idx").on(table.tokenHash),
		index("user_sessions_expires_at_idx").on(table.expiresAt),
	]
);

export const subscriptions = pgTable(
	"subscriptions",
	{
		id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
		userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
		planId: varchar("plan_id", { length: 50 }).notNull(), // 'free', 'basic', 'pro', 'enterprise'
		status: varchar("status", { length: 20 }).notNull().default("active"), // 'active', 'expired', 'cancelled', 'pending'
		startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
		expiresAt: timestamp("expires_at", { withTimezone: true }),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index("subscriptions_user_id_idx").on(table.userId),
		index("subscriptions_status_idx").on(table.status),
	]
);

export const auditLogs = pgTable(
	"audit_logs",
	{
		id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
		userId: varchar("user_id", { length: 36 }).references(() => users.id, { onDelete: "set null" }),
		action: varchar("action", { length: 100 }).notNull(),
		resourceType: varchar("resource_type", { length: 50 }),
		resourceId: varchar("resource_id", { length: 36 }),
		details: jsonb("details"),
		ipAddress: varchar("ip_address", { length: 50 }),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index("audit_logs_user_id_idx").on(table.userId),
		index("audit_logs_action_idx").on(table.action),
		index("audit_logs_created_at_idx").on(table.createdAt),
	]
);

// ==================== E-commerce Platforms ====================

export const platforms = pgTable(
	"platforms",
	{
		id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
		platformCode: varchar("platform_code", { length: 20 }).notNull(), // 'shopee', 'lazada', 'tiktok', 'amazon'
		platformName: varchar("platform_name", { length: 50 }).notNull(),
		partnerId: varchar("partner_id", { length: 50 }),
		partnerKey: text("partner_key"),
		shopId: varchar("shop_id", { length: 50 }).notNull(),
		shopName: varchar("shop_name", { length: 100 }),
		region: varchar("region", { length: 10 }).notNull(), // 'SG', 'MY', 'TH', 'ID', 'VN', 'PH', 'BR'
		currency: varchar("currency", { length: 10 }),
		accessToken: text("access_token"),
		refreshToken: text("refresh_token"),
		tokenExpiresAt: timestamp("token_expires_at", { withTimezone: true }),
		refreshExpiresAt: timestamp("refresh_expires_at", { withTimezone: true }),
		authStatus: varchar("auth_status", { length: 20 }).notNull().default("pending"),
		authorizedAt: timestamp("authorized_at", { withTimezone: true }),
		lastAuthError: text("last_auth_error"),
		shopStatus: varchar("shop_status", { length: 20 }),
		lastProductSync: timestamp("last_product_sync", { withTimezone: true }),
		lastOrderSync: timestamp("last_order_sync", { withTimezone: true }),
		lastInventorySync: timestamp("last_inventory_sync", { withTimezone: true }),
		syncEnabled: boolean("sync_enabled").default(true),
		autoPublishEnabled: boolean("auto_publish_enabled").default(false),
		autoOrderPullEnabled: boolean("auto_order_pull_enabled").default(true),
		extraConfig: jsonb("extra_config"),
		notes: text("notes"),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index("platforms_platform_code_idx").on(table.platformCode),
		index("platforms_shop_id_idx").on(table.shopId),
		index("platforms_region_idx").on(table.region),
		index("platforms_auth_status_idx").on(table.authStatus),
	]
);

export const shops = pgTable(
	"shops",
	{
		id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
		shopName: varchar("shop_name", { length: 100 }).notNull(),
		ownerId: varchar("owner_id", { length: 36 }),
		platformId: varchar("platform_id", { length: 36 }).references(() => platforms.id, { onDelete: "cascade" }),
		localCurrency: varchar("local_currency", { length: 10 }),
		defaultWarehouse: varchar("default_warehouse", { length: 50 }),
		status: varchar("status", { length: 20 }).notNull().default("active"),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index("shops_owner_id_idx").on(table.ownerId),
		index("shops_platform_id_idx").on(table.platformId),
		index("shops_status_idx").on(table.status),
	]
);

// ==================== AI Task System ====================

export const aiTasks = pgTable(
	"ai_tasks",
	{
		id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
		agentType: varchar("agent_type", { length: 50 }).notNull(),
		action: varchar("action", { length: 100 }).notNull(),
		status: varchar("status", { length: 20 }).notNull().default("pending"),
		inputParams: jsonb("input_params"),
		resultSummary: jsonb("result_summary"),
		errorMessage: text("error_message"),
		tokensUsed: integer("tokens_used").default(0),
		cost: numeric("cost", { precision: 10, scale: 4 }).default("0"),
		durationMs: integer("duration_ms").default(0),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		completedAt: timestamp("completed_at", { withTimezone: true }),
	},
	(table) => [
		index("ai_tasks_agent_type_idx").on(table.agentType),
		index("ai_tasks_status_idx").on(table.status),
		index("ai_tasks_created_at_idx").on(table.createdAt),
	]
);

export const aiTaskOutputs = pgTable(
	"ai_task_outputs",
	{
		id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
		taskId: varchar("task_id", { length: 36 }).notNull().references(() => aiTasks.id, { onDelete: "cascade" }),
		outputType: varchar("output_type", { length: 50 }).notNull(),
		storageKey: text("storage_key"),
		content: jsonb("content"),
		fileSize: integer("file_size"),
		mimeType: varchar("mime_type", { length: 100 }),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index("ai_task_outputs_task_id_idx").on(table.taskId),
		index("ai_task_outputs_output_type_idx").on(table.outputType),
	]
);

// ==================== Selection Sessions ====================

export const selectionSessions = pgTable(
	"selection_sessions",
	{
		id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
		market: varchar("market", { length: 50 }),
		platform: varchar("platform", { length: 50 }),
		category: varchar("category", { length: 100 }),
		budget: varchar("budget", { length: 50 }),
		coreAppeal: varchar("core_appeal", { length: 100 }),
		directions: jsonb("directions"),
		selectedDirectionIds: jsonb("selected_direction_ids"),
		hotProducts: jsonb("hot_products"),
		selectedProductIds: jsonb("selected_product_ids"),
		productProfitParams: jsonb("product_profit_params"),
		feasibilityResults: jsonb("feasibility_results"),
		competitors: jsonb("competitors"),
		reportStorageKey: text("report_storage_key"),
		reportContent: text("report_content"),
		currentStep: integer("current_step").default(0),
		status: varchar("status", { length: 20 }).notNull().default("draft"),
		dataSources: jsonb("data_sources"),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index("selection_sessions_status_idx").on(table.status),
		index("selection_sessions_created_at_idx").on(table.createdAt),
	]
);

// ==================== Generated Media ====================

export const generatedImages = pgTable(
	"generated_images",
	{
		id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
		taskId: varchar("task_id", { length: 36 }).references(() => aiTasks.id, { onDelete: "set null" }),
		originalUrl: text("original_url"),
		storageKey: text("storage_key"),
		imageType: varchar("image_type", { length: 50 }),
		prompt: text("prompt"),
		params: jsonb("params"),
		width: integer("width"),
		height: integer("height"),
		productId: varchar("product_id", { length: 36 }),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index("generated_images_task_id_idx").on(table.taskId),
		index("generated_images_image_type_idx").on(table.imageType),
		index("generated_images_created_at_idx").on(table.createdAt),
	]
);

export const generatedVideos = pgTable(
	"generated_videos",
	{
		id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
		taskId: varchar("task_id", { length: 36 }).references(() => aiTasks.id, { onDelete: "set null" }),
		originalUrl: text("original_url"),
		storageKey: text("storage_key"),
		videoType: varchar("video_type", { length: 50 }),
		prompt: text("prompt"),
		params: jsonb("params"),
		duration: numeric("duration", { precision: 10, scale: 2 }),
		productId: varchar("product_id", { length: 36 }),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index("generated_videos_task_id_idx").on(table.taskId),
		index("generated_videos_video_type_idx").on(table.videoType),
		index("generated_videos_created_at_idx").on(table.createdAt),
	]
);

// ==================== Listing Drafts ====================

export const listingDrafts = pgTable(
	"listing_drafts",
	{
		id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
		productId: varchar("product_id", { length: 36 }),
		taskId: varchar("task_id", { length: 36 }).references(() => aiTasks.id, { onDelete: "set null" }),
		title: varchar("title", { length: 255 }),
		description: text("description"),
		bulletPoints: jsonb("bullet_points"),
		keywords: jsonb("keywords"),
		language: varchar("language", { length: 10 }),
		categoryId: varchar("category_id", { length: 50 }),
		price: numeric("price", { precision: 10, scale: 2 }),
		status: varchar("status", { length: 20 }).notNull().default("draft"),
		publishedAt: timestamp("published_at", { withTimezone: true }),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index("listing_drafts_product_id_idx").on(table.productId),
		index("listing_drafts_status_idx").on(table.status),
	]
);

// ==================== Chat Histories ====================

export const chatHistories = pgTable(
	"chat_histories",
	{
		id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
		sessionId: varchar("session_id", { length: 36 }),
		role: varchar("role", { length: 20 }).notNull(), // 'user', 'assistant', 'system'
		content: text("content").notNull(),
		tokens: integer("tokens").default(0),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index("chat_histories_session_id_idx").on(table.sessionId),
		index("chat_histories_created_at_idx").on(table.createdAt),
	]
);

// ==================== ERP Core Tables ====================

export const products = pgTable(
	"products",
	{
		id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
		sku: varchar("sku", { length: 50 }).notNull().unique(),
		name: varchar("name", { length: 255 }).notNull(),
		description: text("description"),
		category: varchar("category", { length: 100 }),
		sourceUrl: text("source_url"),
		sourcePlatform: varchar("source_platform", { length: 50 }), // '1688', 'taobao', 'tmall', 'jd'
		costPrice: numeric("cost_price", { precision: 10, scale: 2 }),
		salePrice: numeric("sale_price", { precision: 10, scale: 2 }),
		marketPrice: numeric("market_price", { precision: 10, scale: 2 }),
		weight: numeric("weight", { precision: 10, scale: 2 }),
		dimensions: varchar("dimensions", { length: 50 }), // 'L*W*H cm'
		supplierId: varchar("supplier_id", { length: 36 }).references(() => suppliers.id, { onDelete: "set null" }),
		images: jsonb("images"),
		videos: jsonb("videos"),
		listingStatus: varchar("listing_status", { length: 20 }).notNull().default("draft"), // 'draft', 'selected', 'processing', 'ready', 'published', 'archived'
		publishedShopId: varchar("published_shop_id", { length: 36 }).references(() => shops.id, { onDelete: "set null" }),
		publishedProductId: varchar("published_product_id", { length: 50 }), // Platform product ID
		publishedAt: timestamp("published_at", { withTimezone: true }),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index("products_sku_idx").on(table.sku),
		index("products_category_idx").on(table.category),
		index("products_supplier_id_idx").on(table.supplierId),
		index("products_listing_status_idx").on(table.listingStatus),
	]
);

export const suppliers = pgTable(
	"suppliers",
	{
		id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
		name: varchar("name", { length: 100 }).notNull(),
		platform: varchar("platform", { length: 50 }).notNull(), // '1688', 'alibaba', 'custom'
		url: text("url"),
		contact: varchar("contact", { length: 100 }),
		phone: varchar("phone", { length: 50 }),
		address: text("address"),
		moq: integer("moq").default(1),
		leadTime: integer("lead_time").default(7), // days
		qualityRating: numeric("quality_rating", { precision: 3, scale: 2 }).default("0"),
		responseRating: numeric("response_rating", { precision: 3, scale: 2 }).default("0"),
		status: varchar("status", { length: 20 }).notNull().default("active"),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index("suppliers_platform_idx").on(table.platform),
		index("suppliers_status_idx").on(table.status),
	]
);

export const orders = pgTable(
	"orders",
	{
		id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
		orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
		platformOrderId: varchar("platform_order_id", { length: 50 }),
		shopId: varchar("shop_id", { length: 36 }).references(() => shops.id, { onDelete: "cascade" }),
		productId: varchar("product_id", { length: 36 }).references(() => products.id, { onDelete: "cascade" }),
		sku: varchar("sku", { length: 50 }),
		quantity: integer("quantity").notNull().default(1),
		unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
		totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
		currency: varchar("currency", { length: 10 }),
		status: varchar("status", { length: 20 }).notNull().default("pending"), // 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded'
		customerName: varchar("customer_name", { length: 100 }),
		customerPhone: varchar("customer_phone", { length: 50 }),
		shippingAddress: text("shipping_address"),
		trackingNumber: varchar("tracking_number", { length: 100 }),
		logisticsCompany: varchar("logistics_company", { length: 50 }),
		notes: text("notes"),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index("orders_order_number_idx").on(table.orderNumber),
		index("orders_shop_id_idx").on(table.shopId),
		index("orders_product_id_idx").on(table.productId),
		index("orders_status_idx").on(table.status),
	]
);

export const inventory = pgTable(
	"inventory",
	{
		id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
		productId: varchar("product_id", { length: 36 }).notNull().references(() => products.id, { onDelete: "cascade" }),
		sku: varchar("sku", { length: 50 }),
		warehouse: varchar("warehouse", { length: 50 }),
		quantity: integer("quantity").notNull().default(0),
		reservedQty: integer("reserved_qty").default(0),
		availableQty: integer("available_qty").default(0),
		reorderPoint: integer("reorder_point").default(10),
		status: varchar("status", { length: 20 }).notNull().default("normal"), // 'normal', 'low', 'critical', 'out_of_stock'
		lastRestockedAt: timestamp("last_restocked_at", { withTimezone: true }),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index("inventory_product_id_idx").on(table.productId),
		index("inventory_sku_idx").on(table.sku),
		index("inventory_status_idx").on(table.status),
	]
);

export const adCampaigns = pgTable(
	"ad_campaigns",
	{
		id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
		name: varchar("name", { length: 100 }).notNull(),
		shopId: varchar("shop_id", { length: 36 }).references(() => shops.id, { onDelete: "cascade" }),
		productId: varchar("product_id", { length: 36 }).references(() => products.id, { onDelete: "set null" }),
		platform: varchar("platform", { length: 50 }).notNull(),
		campaignId: varchar("campaign_id", { length: 50 }), // Platform campaign ID
		budget: numeric("budget", { precision: 10, scale: 2 }).notNull(),
		dailyBudget: numeric("daily_budget", { precision: 10, scale: 2 }),
		spent: numeric("spent", { precision: 10, scale: 2 }).default("0"),
		impressions: integer("impressions").default(0),
		clicks: integer("clicks").default(0),
		orders: integer("orders").default(0),
		roas: numeric("roas", { precision: 10, scale: 2 }).default("0"),
		status: varchar("status", { length: 20 }).notNull().default("pending"), // 'pending', 'active', 'paused', 'ended', 'error'
		startDate: timestamp("start_date", { withTimezone: true }),
		endDate: timestamp("end_date", { withTimezone: true }),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index("ad_campaigns_shop_id_idx").on(table.shopId),
		index("ad_campaigns_product_id_idx").on(table.productId),
		index("ad_campaigns_status_idx").on(table.status),
	]
);

// ==================== Type Exports ====================

export type User = typeof users.$inferSelect;
export type UserSession = typeof userSessions.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type Platform = typeof platforms.$inferSelect;
export type Shop = typeof shops.$inferSelect;
export type AITask = typeof aiTasks.$inferSelect;
export type AITaskOutput = typeof aiTaskOutputs.$inferSelect;
export type SelectionSession = typeof selectionSessions.$inferSelect;
export type GeneratedImage = typeof generatedImages.$inferSelect;
export type GeneratedVideo = typeof generatedVideos.$inferSelect;
export type ListingDraft = typeof listingDrafts.$inferSelect;
export type ChatHistory = typeof chatHistories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Supplier = typeof suppliers.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type Inventory = typeof inventory.$inferSelect;
export type AdCampaign = typeof adCampaigns.$inferSelect;