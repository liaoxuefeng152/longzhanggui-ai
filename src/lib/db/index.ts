import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// 数据库文件路径 - 优先使用项目目录，不可写则回退到 /tmp
function getDbPath(): string {
  const projectDataDir = path.join(process.cwd(), 'data');
  try {
    if (!fs.existsSync(projectDataDir)) {
      fs.mkdirSync(projectDataDir, { recursive: true });
    }
    // 测试写入权限
    const testFile = path.join(projectDataDir, '.write_test');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    return path.join(projectDataDir, 'lobster.db');
  } catch {
    // 项目目录不可写，回退到 /tmp
    const tmpDataDir = '/tmp/backend_data';
    try {
      if (!fs.existsSync(tmpDataDir)) {
        fs.mkdirSync(tmpDataDir, { recursive: true });
      }
    } catch {
      // /tmp 也不可用（极端情况），使用内存模式
    }
    return path.join(tmpDataDir, 'lobster.db');
  }
}

const DB_PATH = getDbPath();

// 创建数据库连接
let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    
    // 初始化表结构
    initTables(db);
  }
  return db;
}

// 初始化所有表
function initTables(database: Database.Database) {
  // 平台配置表
  database.exec(`
    CREATE TABLE IF NOT EXISTS platforms (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      platform TEXT NOT NULL,
      credentials TEXT DEFAULT '{}',
      status TEXT DEFAULT 'disconnected',
      last_sync TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // 妙手ERP配置表
  database.exec(`
    CREATE TABLE IF NOT EXISTS miaoshou_config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT NOT NULL,
      password TEXT NOT NULL,
      cookies TEXT,
      status TEXT DEFAULT 'disconnected',
      last_sync TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // 迁移：添加app_key和app_secret列（如果不存在）
  try {
    database.exec('ALTER TABLE miaoshou_config ADD COLUMN app_key TEXT');
    database.exec('ALTER TABLE miaoshou_config ADD COLUMN app_secret TEXT');
  } catch (e) {
    // 列可能已存在，忽略错误
  }

  // 用户表
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      email TEXT,
      role TEXT DEFAULT 'client',
      avatar TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // 商品表
  database.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      name_en TEXT,
      sku TEXT,
      category TEXT,
      cost_price REAL DEFAULT 0,
      price REAL DEFAULT 0,
      stock INTEGER DEFAULT 0,
      status TEXT DEFAULT 'draft',
      source TEXT,
      source_url TEXT,
      supplier_name TEXT,
      supplier_id TEXT,
      images TEXT DEFAULT '[]',
      video_url TEXT,
      weight REAL,
      dimensions TEXT,
      description TEXT,
      description_en TEXT,
      keywords TEXT,
      attributes TEXT DEFAULT '{}',
      shop_id TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // 采集商品表
  database.exec(`
    CREATE TABLE IF NOT EXISTS collection_products (
      id TEXT PRIMARY KEY,
      collection_id TEXT,
      product_id TEXT,
      product_name TEXT NOT NULL,
      source TEXT,
      source_url TEXT,
      source_id TEXT,
      supplier_name TEXT,
      cost_price REAL DEFAULT 0,
      images TEXT DEFAULT '[]',
      category TEXT,
      claimed INTEGER DEFAULT 0,
      claimed_by TEXT,
      claimed_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // 飞书配置表
  database.exec(`
    CREATE TABLE IF NOT EXISTS feishu_config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      app_id TEXT NOT NULL,
      app_secret TEXT NOT NULL,
      bot_name TEXT,
      webhook_url TEXT,
      push_enabled INTEGER DEFAULT 0,
      alert_enabled INTEGER DEFAULT 1,
      alert_threshold INTEGER DEFAULT 10,
      templates TEXT DEFAULT '{}',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // 导入历史表
  database.exec(`
    CREATE TABLE IF NOT EXISTS import_history (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      file_name TEXT,
      status TEXT DEFAULT 'pending',
      total_rows INTEGER DEFAULT 0,
      success_rows INTEGER DEFAULT 0,
      error_rows INTEGER DEFAULT 0,
      error_log TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      completed_at TEXT
    )
  `);

  // 插入默认管理员账号
  const adminExists = database.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?').get('admin') as { count: number };
  if (adminExists.count === 0) {
    database.prepare(`
      INSERT INTO users (id, username, password, email, role) VALUES (?, ?, ?, ?, ?)
    `).run('admin', 'admin', 'admin123', 'admin@example.com', 'admin');
  }

  // 插入默认飞书配置
  const feishuExists = database.prepare('SELECT COUNT(*) as count FROM feishu_config').get() as { count: number };
  if (feishuExists.count === 0) {
    database.prepare(`
      INSERT INTO feishu_config (app_id, app_secret, bot_name, push_enabled, alert_enabled)
      VALUES (?, ?, ?, ?, ?)
    `).run('', '', '龙掌柜跨境AI全能助手', 0, 1);
  }

  console.log('[DB] Database tables initialized');
}

// 关闭数据库连接
export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}
