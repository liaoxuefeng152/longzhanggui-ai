import { pgTable, serial, varchar, timestamp, boolean, integer, jsonb, text, numeric, index } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

// System table - DO NOT DELETE
export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

// ==================== E-commerce Platforms ====================

// Platforms configuration for marketplace integrations (Shopee, Lazada, TikTok, etc.)
export const platforms = pgTable(
  "platforms",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    platformCode: varchar("platform_code", { length: 20 }).notNull(), // 'shopee', 'lazada', 'tiktok', 'amazon'
    platformName: varchar("platform_name", { length: 50 }).notNull(), // 'Shopee', 'Lazada Mall', 'TikTok Shop'
    
    // Open Platform credentials
    partnerId: varchar("partner_id", { length: 50 }), // Open Platform Partner ID
    partnerKey: text("partner_key"), // Open Platform Partner Key (encrypted storage)
    
    // Shop info
    shopId: varchar("shop_id", { length: 50 }).notNull(), // Shop ID from marketplace
    shopName: varchar("shop_name", { length: 100 }), // Shop display name
    region: varchar("region", { length: 10 }).notNull(), // 'SG', 'MY', 'TH', 'ID', 'VN', 'PH', 'BR'
    currency: varchar("currency", { length: 10 }), // 'SGD', 'MYR', 'THB', 'IDR', 'VND', 'PHP', 'BRL'
    
    // OAuth tokens (encrypted storage)
    accessToken: text("access_token"), // Access token (4 hours validity)
    refreshToken: text("refresh_token"), // Refresh token (30 days validity)
    tokenExpiresAt: timestamp("token_expires_at", { withTimezone: true }),
    refreshExpiresAt: timestamp("refresh_expires_at", { withTimezone: true }),
    
    // Authorization status
    authStatus: varchar("auth_status", { length: 20 }).notNull().default("pending"), // 'pending', 'authorized', 'expired', 'error', 'revoked'
    authorizedAt: timestamp("authorized_at", { withTimezone: true }),
    lastAuthError: text("last_auth_error"),
    
    // Shop status from marketplace
    shopStatus: varchar("shop_status", { length: 20 }), // 'NORMAL', 'BANNED', 'DEACTIVATED', 'SUSPENDED'
    
    // Sync tracking
    lastProductSync: timestamp("last_product_sync", { withTimezone: true }),
    lastOrderSync: timestamp("last_order_sync", { withTimezone: true }),
    lastInventorySync: timestamp("last_inventory_sync", { withTimezone: true }),
    
    // Config
    syncEnabled: boolean("sync_enabled").default(true),
    autoPublishEnabled: boolean("auto_publish_enabled").default(false),
    autoOrderPullEnabled: boolean("auto_order_pull_enabled").default(true),
    
    // Metadata
    extraConfig: jsonb("extra_config"), // Platform-specific config
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

// Shop-Platform binding (for multi-shop support)
export const shops = pgTable(
  "shops",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    shopName: varchar("shop_name", { length: 100 }).notNull(),
    ownerId: varchar("owner_id", { length: 36 }), // User ID reference (future)
    platformId: varchar("platform_id", { length: 36 }).references(() => platforms.id, { onDelete: "cascade" }),
    
    // Local shop config
    localCurrency: varchar("local_currency", { length: 10 }), // Base currency for this shop
    defaultWarehouse: varchar("default_warehouse", { length: 50 }),
    
    // Status
    status: varchar("status", { length: 20 }).notNull().default("active"), // 'active', 'inactive', 'suspended'
    
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

// Unified AI task tracking table
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

// ==================== E-commerce Platforms ====================

// Platforms configuration for marketplace integrations (Shopee, Lazada, TikTok, etc.)
export const platforms = pgTable(
  "platforms",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    platformCode: varchar("platform_code", { length: 20 }).notNull(), // 'shopee', 'lazada', 'tiktok', 'amazon'
    platformName: varchar("platform_name", { length: 50 }).notNull(), // 'Shopee', 'Lazada Mall', 'TikTok Shop'
    
    // Open Platform credentials
    partnerId: varchar("partner_id", { length: 50 }), // Open Platform Partner ID
    partnerKey: text("partner_key"), // Open Platform Partner Key (encrypted storage)
    
    // Shop info
    shopId: varchar("shop_id", { length: 50 }).notNull(), // Shop ID from marketplace
    shopName: varchar("shop_name", { length: 100 }), // Shop display name
    region: varchar("region", { length: 10 }).notNull(), // 'SG', 'MY', 'TH', 'ID', 'VN', 'PH', 'BR'
    currency: varchar("currency", { length: 10 }), // 'SGD', 'MYR', 'THB', 'IDR', 'VND', 'PHP', 'BRL'
    
    // OAuth tokens (encrypted storage)
    accessToken: text("access_token"), // Access token (4 hours validity)
    refreshToken: text("refresh_token"), // Refresh token (30 days validity)
    tokenExpiresAt: timestamp("token_expires_at", { withTimezone: true }),
    refreshExpiresAt: timestamp("refresh_expires_at", { withTimezone: true }),
    
    // Authorization status
    authStatus: varchar("auth_status", { length: 20 }).notNull().default("pending"), // 'pending', 'authorized', 'expired', 'error', 'revoked'
    authorizedAt: timestamp("authorized_at", { withTimezone: true }),
    lastAuthError: text("last_auth_error"),
    
    // Shop status from marketplace
    shopStatus: varchar("shop_status", { length: 20 }), // 'NORMAL', 'BANNED', 'DEACTIVATED', 'SUSPENDED'
    
    // Sync tracking
    lastProductSync: timestamp("last_product_sync", { withTimezone: true }),
    lastOrderSync: timestamp("last_order_sync", { withTimezone: true }),
    lastInventorySync: timestamp("last_inventory_sync", { withTimezone: true }),
    
    // Config
    syncEnabled: boolean("sync_enabled").default(true),
    autoPublishEnabled: boolean("auto_publish_enabled").default(false),
    autoOrderPullEnabled: boolean("auto_order_pull_enabled").default(true),
    
    // Metadata
    extraConfig: jsonb("extra_config"), // Platform-specific config
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

// Shop-Platform binding (for multi-shop support)
export const shops = pgTable(
  "shops",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    shopName: varchar("shop_name", { length: 100 }).notNull(),
    ownerId: varchar("owner_id", { length: 36 }), // User ID reference (future)
    platformId: varchar("platform_id", { length: 36 }).references(() => platforms.id, { onDelete: "cascade" }),
    
    // Local shop config
    localCurrency: varchar("local_currency", { length: 10 }), // Base currency for this shop
    defaultWarehouse: varchar("default_warehouse", { length: 50 }),
    
    // Status
    status: varchar("status", { length: 20 }).notNull().default("active"), // 'active', 'inactive', 'suspended'
    
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("shops_owner_id_idx").on(table.ownerId),
    index("shops_platform_id_idx").on(table.platformId),
    index("shops_status_idx").on(table.status),
  ]
);

// AI task outputs - links to ai_tasks
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

// ==================== E-commerce Platforms ====================

// Platforms configuration for marketplace integrations (Shopee, Lazada, TikTok, etc.)
export const platforms = pgTable(
  "platforms",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    platformCode: varchar("platform_code", { length: 20 }).notNull(), // 'shopee', 'lazada', 'tiktok', 'amazon'
    platformName: varchar("platform_name", { length: 50 }).notNull(), // 'Shopee', 'Lazada Mall', 'TikTok Shop'
    
    // Open Platform credentials
    partnerId: varchar("partner_id", { length: 50 }), // Open Platform Partner ID
    partnerKey: text("partner_key"), // Open Platform Partner Key (encrypted storage)
    
    // Shop info
    shopId: varchar("shop_id", { length: 50 }).notNull(), // Shop ID from marketplace
    shopName: varchar("shop_name", { length: 100 }), // Shop display name
    region: varchar("region", { length: 10 }).notNull(), // 'SG', 'MY', 'TH', 'ID', 'VN', 'PH', 'BR'
    currency: varchar("currency", { length: 10 }), // 'SGD', 'MYR', 'THB', 'IDR', 'VND', 'PHP', 'BRL'
    
    // OAuth tokens (encrypted storage)
    accessToken: text("access_token"), // Access token (4 hours validity)
    refreshToken: text("refresh_token"), // Refresh token (30 days validity)
    tokenExpiresAt: timestamp("token_expires_at", { withTimezone: true }),
    refreshExpiresAt: timestamp("refresh_expires_at", { withTimezone: true }),
    
    // Authorization status
    authStatus: varchar("auth_status", { length: 20 }).notNull().default("pending"), // 'pending', 'authorized', 'expired', 'error', 'revoked'
    authorizedAt: timestamp("authorized_at", { withTimezone: true }),
    lastAuthError: text("last_auth_error"),
    
    // Shop status from marketplace
    shopStatus: varchar("shop_status", { length: 20 }), // 'NORMAL', 'BANNED', 'DEACTIVATED', 'SUSPENDED'
    
    // Sync tracking
    lastProductSync: timestamp("last_product_sync", { withTimezone: true }),
    lastOrderSync: timestamp("last_order_sync", { withTimezone: true }),
    lastInventorySync: timestamp("last_inventory_sync", { withTimezone: true }),
    
    // Config
    syncEnabled: boolean("sync_enabled").default(true),
    autoPublishEnabled: boolean("auto_publish_enabled").default(false),
    autoOrderPullEnabled: boolean("auto_order_pull_enabled").default(true),
    
    // Metadata
    extraConfig: jsonb("extra_config"), // Platform-specific config
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

// Shop-Platform binding (for multi-shop support)
export const shops = pgTable(
  "shops",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    shopName: varchar("shop_name", { length: 100 }).notNull(),
    ownerId: varchar("owner_id", { length: 36 }), // User ID reference (future)
    platformId: varchar("platform_id", { length: 36 }).references(() => platforms.id, { onDelete: "cascade" }),
    
    // Local shop config
    localCurrency: varchar("local_currency", { length: 10 }), // Base currency for this shop
    defaultWarehouse: varchar("default_warehouse", { length: 50 }),
    
    // Status
    status: varchar("status", { length: 20 }).notNull().default("active"), // 'active', 'inactive', 'suspended'
    
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("shops_owner_id_idx").on(table.ownerId),
    index("shops_platform_id_idx").on(table.platformId),
    index("shops_status_idx").on(table.status),
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

// ==================== E-commerce Platforms ====================

// Platforms configuration for marketplace integrations (Shopee, Lazada, TikTok, etc.)
export const platforms = pgTable(
  "platforms",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    platformCode: varchar("platform_code", { length: 20 }).notNull(), // 'shopee', 'lazada', 'tiktok', 'amazon'
    platformName: varchar("platform_name", { length: 50 }).notNull(), // 'Shopee', 'Lazada Mall', 'TikTok Shop'
    
    // Open Platform credentials
    partnerId: varchar("partner_id", { length: 50 }), // Open Platform Partner ID
    partnerKey: text("partner_key"), // Open Platform Partner Key (encrypted storage)
    
    // Shop info
    shopId: varchar("shop_id", { length: 50 }).notNull(), // Shop ID from marketplace
    shopName: varchar("shop_name", { length: 100 }), // Shop display name
    region: varchar("region", { length: 10 }).notNull(), // 'SG', 'MY', 'TH', 'ID', 'VN', 'PH', 'BR'
    currency: varchar("currency", { length: 10 }), // 'SGD', 'MYR', 'THB', 'IDR', 'VND', 'PHP', 'BRL'
    
    // OAuth tokens (encrypted storage)
    accessToken: text("access_token"), // Access token (4 hours validity)
    refreshToken: text("refresh_token"), // Refresh token (30 days validity)
    tokenExpiresAt: timestamp("token_expires_at", { withTimezone: true }),
    refreshExpiresAt: timestamp("refresh_expires_at", { withTimezone: true }),
    
    // Authorization status
    authStatus: varchar("auth_status", { length: 20 }).notNull().default("pending"), // 'pending', 'authorized', 'expired', 'error', 'revoked'
    authorizedAt: timestamp("authorized_at", { withTimezone: true }),
    lastAuthError: text("last_auth_error"),
    
    // Shop status from marketplace
    shopStatus: varchar("shop_status", { length: 20 }), // 'NORMAL', 'BANNED', 'DEACTIVATED', 'SUSPENDED'
    
    // Sync tracking
    lastProductSync: timestamp("last_product_sync", { withTimezone: true }),
    lastOrderSync: timestamp("last_order_sync", { withTimezone: true }),
    lastInventorySync: timestamp("last_inventory_sync", { withTimezone: true }),
    
    // Config
    syncEnabled: boolean("sync_enabled").default(true),
    autoPublishEnabled: boolean("auto_publish_enabled").default(false),
    autoOrderPullEnabled: boolean("auto_order_pull_enabled").default(true),
    
    // Metadata
    extraConfig: jsonb("extra_config"), // Platform-specific config
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

// Shop-Platform binding (for multi-shop support)
export const shops = pgTable(
  "shops",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    shopName: varchar("shop_name", { length: 100 }).notNull(),
    ownerId: varchar("owner_id", { length: 36 }), // User ID reference (future)
    platformId: varchar("platform_id", { length: 36 }).references(() => platforms.id, { onDelete: "cascade" }),
    
    // Local shop config
    localCurrency: varchar("local_currency", { length: 10 }), // Base currency for this shop
    defaultWarehouse: varchar("default_warehouse", { length: 50 }),
    
    // Status
    status: varchar("status", { length: 20 }).notNull().default("active"), // 'active', 'inactive', 'suspended'
    
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("shops_owner_id_idx").on(table.ownerId),
    index("shops_platform_id_idx").on(table.platformId),
    index("shops_status_idx").on(table.status),
  ]
);

// ==================== Generated Images ====================

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

// ==================== E-commerce Platforms ====================

// Platforms configuration for marketplace integrations (Shopee, Lazada, TikTok, etc.)
export const platforms = pgTable(
  "platforms",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    platformCode: varchar("platform_code", { length: 20 }).notNull(), // 'shopee', 'lazada', 'tiktok', 'amazon'
    platformName: varchar("platform_name", { length: 50 }).notNull(), // 'Shopee', 'Lazada Mall', 'TikTok Shop'
    
    // Open Platform credentials
    partnerId: varchar("partner_id", { length: 50 }), // Open Platform Partner ID
    partnerKey: text("partner_key"), // Open Platform Partner Key (encrypted storage)
    
    // Shop info
    shopId: varchar("shop_id", { length: 50 }).notNull(), // Shop ID from marketplace
    shopName: varchar("shop_name", { length: 100 }), // Shop display name
    region: varchar("region", { length: 10 }).notNull(), // 'SG', 'MY', 'TH', 'ID', 'VN', 'PH', 'BR'
    currency: varchar("currency", { length: 10 }), // 'SGD', 'MYR', 'THB', 'IDR', 'VND', 'PHP', 'BRL'
    
    // OAuth tokens (encrypted storage)
    accessToken: text("access_token"), // Access token (4 hours validity)
    refreshToken: text("refresh_token"), // Refresh token (30 days validity)
    tokenExpiresAt: timestamp("token_expires_at", { withTimezone: true }),
    refreshExpiresAt: timestamp("refresh_expires_at", { withTimezone: true }),
    
    // Authorization status
    authStatus: varchar("auth_status", { length: 20 }).notNull().default("pending"), // 'pending', 'authorized', 'expired', 'error', 'revoked'
    authorizedAt: timestamp("authorized_at", { withTimezone: true }),
    lastAuthError: text("last_auth_error"),
    
    // Shop status from marketplace
    shopStatus: varchar("shop_status", { length: 20 }), // 'NORMAL', 'BANNED', 'DEACTIVATED', 'SUSPENDED'
    
    // Sync tracking
    lastProductSync: timestamp("last_product_sync", { withTimezone: true }),
    lastOrderSync: timestamp("last_order_sync", { withTimezone: true }),
    lastInventorySync: timestamp("last_inventory_sync", { withTimezone: true }),
    
    // Config
    syncEnabled: boolean("sync_enabled").default(true),
    autoPublishEnabled: boolean("auto_publish_enabled").default(false),
    autoOrderPullEnabled: boolean("auto_order_pull_enabled").default(true),
    
    // Metadata
    extraConfig: jsonb("extra_config"), // Platform-specific config
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

// Shop-Platform binding (for multi-shop support)
export const shops = pgTable(
  "shops",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    shopName: varchar("shop_name", { length: 100 }).notNull(),
    ownerId: varchar("owner_id", { length: 36 }), // User ID reference (future)
    platformId: varchar("platform_id", { length: 36 }).references(() => platforms.id, { onDelete: "cascade" }),
    
    // Local shop config
    localCurrency: varchar("local_currency", { length: 10 }), // Base currency for this shop
    defaultWarehouse: varchar("default_warehouse", { length: 50 }),
    
    // Status
    status: varchar("status", { length: 20 }).notNull().default("active"), // 'active', 'inactive', 'suspended'
    
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("shops_owner_id_idx").on(table.ownerId),
    index("shops_platform_id_idx").on(table.platformId),
    index("shops_status_idx").on(table.status),
  ]
);

// ==================== Generated Videos ====================

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

// ==================== E-commerce Platforms ====================

// Platforms configuration for marketplace integrations (Shopee, Lazada, TikTok, etc.)
export const platforms = pgTable(
  "platforms",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    platformCode: varchar("platform_code", { length: 20 }).notNull(), // 'shopee', 'lazada', 'tiktok', 'amazon'
    platformName: varchar("platform_name", { length: 50 }).notNull(), // 'Shopee', 'Lazada Mall', 'TikTok Shop'
    
    // Open Platform credentials
    partnerId: varchar("partner_id", { length: 50 }), // Open Platform Partner ID
    partnerKey: text("partner_key"), // Open Platform Partner Key (encrypted storage)
    
    // Shop info
    shopId: varchar("shop_id", { length: 50 }).notNull(), // Shop ID from marketplace
    shopName: varchar("shop_name", { length: 100 }), // Shop display name
    region: varchar("region", { length: 10 }).notNull(), // 'SG', 'MY', 'TH', 'ID', 'VN', 'PH', 'BR'
    currency: varchar("currency", { length: 10 }), // 'SGD', 'MYR', 'THB', 'IDR', 'VND', 'PHP', 'BRL'
    
    // OAuth tokens (encrypted storage)
    accessToken: text("access_token"), // Access token (4 hours validity)
    refreshToken: text("refresh_token"), // Refresh token (30 days validity)
    tokenExpiresAt: timestamp("token_expires_at", { withTimezone: true }),
    refreshExpiresAt: timestamp("refresh_expires_at", { withTimezone: true }),
    
    // Authorization status
    authStatus: varchar("auth_status", { length: 20 }).notNull().default("pending"), // 'pending', 'authorized', 'expired', 'error', 'revoked'
    authorizedAt: timestamp("authorized_at", { withTimezone: true }),
    lastAuthError: text("last_auth_error"),
    
    // Shop status from marketplace
    shopStatus: varchar("shop_status", { length: 20 }), // 'NORMAL', 'BANNED', 'DEACTIVATED', 'SUSPENDED'
    
    // Sync tracking
    lastProductSync: timestamp("last_product_sync", { withTimezone: true }),
    lastOrderSync: timestamp("last_order_sync", { withTimezone: true }),
    lastInventorySync: timestamp("last_inventory_sync", { withTimezone: true }),
    
    // Config
    syncEnabled: boolean("sync_enabled").default(true),
    autoPublishEnabled: boolean("auto_publish_enabled").default(false),
    autoOrderPullEnabled: boolean("auto_order_pull_enabled").default(true),
    
    // Metadata
    extraConfig: jsonb("extra_config"), // Platform-specific config
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

// Shop-Platform binding (for multi-shop support)
export const shops = pgTable(
  "shops",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    shopName: varchar("shop_name", { length: 100 }).notNull(),
    ownerId: varchar("owner_id", { length: 36 }), // User ID reference (future)
    platformId: varchar("platform_id", { length: 36 }).references(() => platforms.id, { onDelete: "cascade" }),
    
    // Local shop config
    localCurrency: varchar("local_currency", { length: 10 }), // Base currency for this shop
    defaultWarehouse: varchar("default_warehouse", { length: 50 }),
    
    // Status
    status: varchar("status", { length: 20 }).notNull().default("active"), // 'active', 'inactive', 'suspended'
    
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("shops_owner_id_idx").on(table.ownerId),
    index("shops_platform_id_idx").on(table.platformId),
    index("shops_status_idx").on(table.status),
  ]
);

// ==================== Listing Drafts ====================

export const listingDrafts = pgTable(
	"listing_drafts",
	{
		id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
		taskId: varchar("task_id", { length: 36 }).references(() => aiTasks.id, { onDelete: "set null" }),
		productId: varchar("product_id", { length: 36 }),
		platform: varchar("platform", { length: 50 }),
		market: varchar("market", { length: 50 }),
		title: text("title"),
		bulletPoints: jsonb("bullet_points"),
		description: text("description"),
		keywords: jsonb("keywords"),
		language: varchar("language", { length: 10 }).default("en"),
		storageKey: text("storage_key"),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index("listing_drafts_product_id_idx").on(table.productId),
		index("listing_drafts_platform_idx").on(table.platform),
		index("listing_drafts_created_at_idx").on(table.createdAt),
	]
);

// ==================== E-commerce Platforms ====================

// Platforms configuration for marketplace integrations (Shopee, Lazada, TikTok, etc.)
export const platforms = pgTable(
  "platforms",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    platformCode: varchar("platform_code", { length: 20 }).notNull(), // 'shopee', 'lazada', 'tiktok', 'amazon'
    platformName: varchar("platform_name", { length: 50 }).notNull(), // 'Shopee', 'Lazada Mall', 'TikTok Shop'
    
    // Open Platform credentials
    partnerId: varchar("partner_id", { length: 50 }), // Open Platform Partner ID
    partnerKey: text("partner_key"), // Open Platform Partner Key (encrypted storage)
    
    // Shop info
    shopId: varchar("shop_id", { length: 50 }).notNull(), // Shop ID from marketplace
    shopName: varchar("shop_name", { length: 100 }), // Shop display name
    region: varchar("region", { length: 10 }).notNull(), // 'SG', 'MY', 'TH', 'ID', 'VN', 'PH', 'BR'
    currency: varchar("currency", { length: 10 }), // 'SGD', 'MYR', 'THB', 'IDR', 'VND', 'PHP', 'BRL'
    
    // OAuth tokens (encrypted storage)
    accessToken: text("access_token"), // Access token (4 hours validity)
    refreshToken: text("refresh_token"), // Refresh token (30 days validity)
    tokenExpiresAt: timestamp("token_expires_at", { withTimezone: true }),
    refreshExpiresAt: timestamp("refresh_expires_at", { withTimezone: true }),
    
    // Authorization status
    authStatus: varchar("auth_status", { length: 20 }).notNull().default("pending"), // 'pending', 'authorized', 'expired', 'error', 'revoked'
    authorizedAt: timestamp("authorized_at", { withTimezone: true }),
    lastAuthError: text("last_auth_error"),
    
    // Shop status from marketplace
    shopStatus: varchar("shop_status", { length: 20 }), // 'NORMAL', 'BANNED', 'DEACTIVATED', 'SUSPENDED'
    
    // Sync tracking
    lastProductSync: timestamp("last_product_sync", { withTimezone: true }),
    lastOrderSync: timestamp("last_order_sync", { withTimezone: true }),
    lastInventorySync: timestamp("last_inventory_sync", { withTimezone: true }),
    
    // Config
    syncEnabled: boolean("sync_enabled").default(true),
    autoPublishEnabled: boolean("auto_publish_enabled").default(false),
    autoOrderPullEnabled: boolean("auto_order_pull_enabled").default(true),
    
    // Metadata
    extraConfig: jsonb("extra_config"), // Platform-specific config
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

// Shop-Platform binding (for multi-shop support)
export const shops = pgTable(
  "shops",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    shopName: varchar("shop_name", { length: 100 }).notNull(),
    ownerId: varchar("owner_id", { length: 36 }), // User ID reference (future)
    platformId: varchar("platform_id", { length: 36 }).references(() => platforms.id, { onDelete: "cascade" }),
    
    // Local shop config
    localCurrency: varchar("local_currency", { length: 10 }), // Base currency for this shop
    defaultWarehouse: varchar("default_warehouse", { length: 50 }),
    
    // Status
    status: varchar("status", { length: 20 }).notNull().default("active"), // 'active', 'inactive', 'suspended'
    
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("shops_owner_id_idx").on(table.ownerId),
    index("shops_platform_id_idx").on(table.platformId),
    index("shops_status_idx").on(table.status),
  ]
);

// ==================== Chat Histories ====================

export const chatHistories = pgTable(
	"chat_histories",
	{
		id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
		sessionId: varchar("session_id", { length: 36 }).notNull(),
		role: varchar("role", { length: 20 }).notNull(),
		content: text("content").notNull(),
		intentType: varchar("intent_type", { length: 50 }),
		metadata: jsonb("metadata"),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index("chat_histories_session_id_idx").on(table.sessionId),
		index("chat_histories_created_at_idx").on(table.createdAt),
	]
);

// ==================== E-commerce Platforms ====================

// Platforms configuration for marketplace integrations (Shopee, Lazada, TikTok, etc.)
export const platforms = pgTable(
  "platforms",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    platformCode: varchar("platform_code", { length: 20 }).notNull(), // 'shopee', 'lazada', 'tiktok', 'amazon'
    platformName: varchar("platform_name", { length: 50 }).notNull(), // 'Shopee', 'Lazada Mall', 'TikTok Shop'
    
    // Open Platform credentials
    partnerId: varchar("partner_id", { length: 50 }), // Open Platform Partner ID
    partnerKey: text("partner_key"), // Open Platform Partner Key (encrypted storage)
    
    // Shop info
    shopId: varchar("shop_id", { length: 50 }).notNull(), // Shop ID from marketplace
    shopName: varchar("shop_name", { length: 100 }), // Shop display name
    region: varchar("region", { length: 10 }).notNull(), // 'SG', 'MY', 'TH', 'ID', 'VN', 'PH', 'BR'
    currency: varchar("currency", { length: 10 }), // 'SGD', 'MYR', 'THB', 'IDR', 'VND', 'PHP', 'BRL'
    
    // OAuth tokens (encrypted storage)
    accessToken: text("access_token"), // Access token (4 hours validity)
    refreshToken: text("refresh_token"), // Refresh token (30 days validity)
    tokenExpiresAt: timestamp("token_expires_at", { withTimezone: true }),
    refreshExpiresAt: timestamp("refresh_expires_at", { withTimezone: true }),
    
    // Authorization status
    authStatus: varchar("auth_status", { length: 20 }).notNull().default("pending"), // 'pending', 'authorized', 'expired', 'error', 'revoked'
    authorizedAt: timestamp("authorized_at", { withTimezone: true }),
    lastAuthError: text("last_auth_error"),
    
    // Shop status from marketplace
    shopStatus: varchar("shop_status", { length: 20 }), // 'NORMAL', 'BANNED', 'DEACTIVATED', 'SUSPENDED'
    
    // Sync tracking
    lastProductSync: timestamp("last_product_sync", { withTimezone: true }),
    lastOrderSync: timestamp("last_order_sync", { withTimezone: true }),
    lastInventorySync: timestamp("last_inventory_sync", { withTimezone: true }),
    
    // Config
    syncEnabled: boolean("sync_enabled").default(true),
    autoPublishEnabled: boolean("auto_publish_enabled").default(false),
    autoOrderPullEnabled: boolean("auto_order_pull_enabled").default(true),
    
    // Metadata
    extraConfig: jsonb("extra_config"), // Platform-specific config
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

// Shop-Platform binding (for multi-shop support)
export const shops = pgTable(
  "shops",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    shopName: varchar("shop_name", { length: 100 }).notNull(),
    ownerId: varchar("owner_id", { length: 36 }), // User ID reference (future)
    platformId: varchar("platform_id", { length: 36 }).references(() => platforms.id, { onDelete: "cascade" }),
    
    // Local shop config
    localCurrency: varchar("local_currency", { length: 10 }), // Base currency for this shop
    defaultWarehouse: varchar("default_warehouse", { length: 50 }),
    
    // Status
    status: varchar("status", { length: 20 }).notNull().default("active"), // 'active', 'inactive', 'suspended'
    
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("shops_owner_id_idx").on(table.ownerId),
    index("shops_platform_id_idx").on(table.platformId),
    index("shops_status_idx").on(table.status),
  ]
);
