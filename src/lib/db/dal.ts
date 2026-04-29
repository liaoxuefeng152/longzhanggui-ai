import { getDb } from './index';
import type { MiaoshouConfig } from '../store';

// ==================== 平台配置 DAL ====================

export interface PlatformConfig {
  id: string;
  name: string;
  platform: string;
  credentials: string;
  status: string;
  last_sync: string | null;
  created_at: string;
  updated_at: string;
}

export const PlatformDAL = {
  // 获取所有平台配置
  getAll(): PlatformConfig[] {
    const db = getDb();
    return db.prepare('SELECT * FROM platforms ORDER BY created_at DESC').all() as PlatformConfig[];
  },

  // 获取单个平台配置
  getById(id: string): PlatformConfig | undefined {
    const db = getDb();
    return db.prepare('SELECT * FROM platforms WHERE id = ?').get(id) as PlatformConfig | undefined;
  },

  // 保存或更新平台配置
  upsert(data: { id: string; name: string; platform: string; credentials: string }): boolean {
    const db = getDb();
    try {
      db.prepare(`
        INSERT INTO platforms (id, name, platform, credentials, status, updated_at)
        VALUES (@id, @name, @platform, @credentials, 'configured', datetime('now'))
        ON CONFLICT(id) DO UPDATE SET
          name = @name,
          platform = @platform,
          credentials = @credentials,
          status = 'configured',
          updated_at = datetime('now')
      `).run(data);
      return true;
    } catch (error) {
      console.error('[DAL] Platform upsert error:', error);
      return false;
    }
  },

  // 更新状态
  updateStatus(id: string, status: string): boolean {
    const db = getDb();
    try {
      db.prepare('UPDATE platforms SET status = ?, updated_at = datetime(\'now\') WHERE id = ?').run(status, id);
      return true;
    } catch (error) {
      console.error('[DAL] Platform updateStatus error:', error);
      return false;
    }
  },

  // 删除平台配置
  delete(id: string): boolean {
    const db = getDb();
    try {
      db.prepare('DELETE FROM platforms WHERE id = ?').run(id);
      return true;
    } catch (error) {
      console.error('[DAL] Platform delete error:', error);
      return false;
    }
  }
};

// ==================== 妙手ERP配置 DAL ====================

export const MiaoshouDAL = {
  // 获取配置
  get(): MiaoshouConfig | undefined {
    const db = getDb();
    const row = db.prepare('SELECT * FROM miaoshou_config LIMIT 1').get() as any;
    if (row) {
      return {
        id: String(row.id),
        phone: row.phone,
        password: row.password,
        cookies: row.cookies,
        appKey: row.app_key,
        appSecret: row.app_secret,
        status: row.status,
        lastSync: row.last_sync,
        updated_at: row.updated_at
      };
    }
    return undefined;
  },

  // 保存配置
  save(data: { phone: string; password: string; cookies?: string; appKey?: string; appSecret?: string }): boolean {
    const db = getDb();
    try {
      // 先删除旧配置
      db.prepare('DELETE FROM miaoshou_config').run();
      // 插入新配置
      db.prepare(`
        INSERT INTO miaoshou_config (phone, password, cookies, app_key, app_secret, status, updated_at)
        VALUES (?, ?, ?, ?, ?, 'disconnected', datetime('now'))
      `).run(data.phone, data.password, data.cookies || null, data.appKey || null, data.appSecret || null);
      return true;
    } catch (error) {
      console.error('[DAL] Miaoshou save error:', error);
      return false;
    }
  },

  // 更新状态
  updateStatus(status: string): boolean {
    const db = getDb();
    try {
      db.prepare('UPDATE miaoshou_config SET status = ?, updated_at = datetime(\'now\')').run(status);
      return true;
    } catch (error) {
      console.error('[DAL] Miaoshou updateStatus error:', error);
      return false;
    }
  },

  // 更新cookies
  updateCookies(cookies: string): boolean {
    const db = getDb();
    try {
      db.prepare('UPDATE miaoshou_config SET cookies = ?, updated_at = datetime(\'now\')').run(cookies);
      return true;
    } catch (error) {
      console.error('[DAL] Miaoshou updateCookies error:', error);
      return false;
    }
  }
};

// ==================== 商品 DAL ====================

export interface Product {
  id: string;
  name: string;
  name_en?: string;
  sku?: string;
  category?: string;
  cost_price: number;
  price: number;
  stock: number;
  status: string;
  source?: string;
  source_url?: string;
  supplier_name?: string;
  supplier_id?: string;
  images: string;
  video_url?: string;
  weight?: number;
  dimensions?: string;
  description?: string;
  description_en?: string;
  keywords?: string;
  attributes: string;
  shop_id?: string;
  created_at: string;
  updated_at: string;
}

export const ProductDAL = {
  // 获取所有商品
  getAll(limit = 100, offset = 0): Product[] {
    const db = getDb();
    return db.prepare('SELECT * FROM products ORDER BY created_at DESC LIMIT ? OFFSET ?').all(limit, offset) as Product[];
  },

  // 获取商品数量
  getCount(): number {
    const db = getDb();
    const row = db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number };
    return row.count;
  },

  // 获取单个商品
  getById(id: string): Product | undefined {
    const db = getDb();
    return db.prepare('SELECT * FROM products WHERE id = ?').get(id) as Product | undefined;
  },

  // 创建商品
  create(data: Partial<Product>): boolean {
    const db = getDb();
    try {
      db.prepare(`
        INSERT INTO products (id, name, name_en, sku, category, cost_price, price, stock, status, 
          source, source_url, supplier_name, supplier_id, images, video_url, weight, dimensions,
          description, description_en, keywords, attributes, shop_id)
        VALUES (@id, @name, @name_en, @sku, @category, @cost_price, @price, @stock, @status,
          @source, @source_url, @supplier_name, @supplier_id, @images, @video_url, @weight, @dimensions,
          @description, @description_en, @keywords, @attributes, @shop_id)
      `).run({
        id: data.id || `PROD${Date.now()}`,
        name: data.name || '',
        name_en: data.name_en || null,
        sku: data.sku || null,
        category: data.category || null,
        cost_price: data.cost_price || 0,
        price: data.price || 0,
        stock: data.stock || 0,
        status: data.status || 'draft',
        source: data.source || null,
        source_url: data.source_url || null,
        supplier_name: data.supplier_name || null,
        supplier_id: data.supplier_id || null,
        images: data.images || '[]',
        video_url: data.video_url || null,
        weight: data.weight || null,
        dimensions: data.dimensions || null,
        description: data.description || null,
        description_en: data.description_en || null,
        keywords: data.keywords || null,
        attributes: data.attributes || '{}',
        shop_id: data.shop_id || null
      });
      return true;
    } catch (error) {
      console.error('[DAL] Product create error:', error);
      return false;
    }
  },

  // 更新商品
  update(id: string, data: Partial<Product>): boolean {
    const db = getDb();
    try {
      const fields = Object.keys(data).filter(k => k !== 'id');
      const setClause = fields.map(f => `${f} = @${f}`).join(', ');
      db.prepare(`UPDATE products SET ${setClause}, updated_at = datetime('now') WHERE id = @id`).run({ ...data, id });
      return true;
    } catch (error) {
      console.error('[DAL] Product update error:', error);
      return false;
    }
  },

  // 删除商品
  delete(id: string): boolean {
    const db = getDb();
    try {
      db.prepare('DELETE FROM products WHERE id = ?').run(id);
      return true;
    } catch (error) {
      console.error('[DAL] Product delete error:', error);
      return false;
    }
  }
};

// ==================== 采集商品 DAL ====================

export interface CollectionProduct {
  id: string;
  collection_id: string | null;
  product_id: string | null;
  product_name: string;
  source: string | null;
  source_url: string | null;
  source_id: string | null;
  supplier_name: string | null;
  cost_price: number;
  images: string;
  category: string | null;
  claimed: number;
  claimed_by: string | null;
  claimed_at: string | null;
  created_at: string;
  updated_at: string;
}

export const CollectionDAL = {
  // 获取所有采集商品
  getAll(): CollectionProduct[] {
    const db = getDb();
    return db.prepare('SELECT * FROM collection_products ORDER BY created_at DESC').all() as CollectionProduct[];
  },

  // 获取公用采集箱
  getPublic(): CollectionProduct[] {
    const db = getDb();
    return db.prepare('SELECT * FROM collection_products WHERE claimed = 0 ORDER BY created_at DESC').all() as CollectionProduct[];
  },

  // 获取单个采集商品
  getById(id: string): CollectionProduct | undefined {
    const db = getDb();
    return db.prepare('SELECT * FROM collection_products WHERE id = ?').get(id) as CollectionProduct | undefined;
  },

  // 创建采集商品
  create(data: Partial<CollectionProduct>): boolean {
    const db = getDb();
    try {
      db.prepare(`
        INSERT INTO collection_products (id, collection_id, product_id, product_name, source, source_url, 
          source_id, supplier_name, cost_price, images, category, claimed)
        VALUES (@id, @collection_id, @product_id, @product_name, @source, @source_url, 
          @source_id, @supplier_name, @cost_price, @images, @category, @claimed)
      `).run({
        id: data.id || `COLL${Date.now()}`,
        collection_id: data.collection_id || null,
        product_id: data.product_id || null,
        product_name: data.product_name || '',
        source: data.source || null,
        source_url: data.source_url || null,
        source_id: data.source_id || null,
        supplier_name: data.supplier_name || null,
        cost_price: data.cost_price || 0,
        images: data.images || '[]',
        category: data.category || null,
        claimed: data.claimed || 0
      });
      return true;
    } catch (error) {
      console.error('[DAL] Collection create error:', error);
      return false;
    }
  },

  // 认领商品
  claim(id: string, userId: string): boolean {
    const db = getDb();
    try {
      db.prepare('UPDATE collection_products SET claimed = 1, claimed_by = ?, claimed_at = datetime(\'now\'), updated_at = datetime(\'now\') WHERE id = ?').run(userId, id);
      return true;
    } catch (error) {
      console.error('[DAL] Collection claim error:', error);
      return false;
    }
  },

  // 删除采集商品
  delete(id: string): boolean {
    const db = getDb();
    try {
      db.prepare('DELETE FROM collection_products WHERE id = ?').run(id);
      return true;
    } catch (error) {
      console.error('[DAL] Collection delete error:', error);
      return false;
    }
  }
};

// ==================== 用户 DAL ====================

export interface User {
  id: string;
  username: string;
  password: string;
  email: string | null;
  role: string;
  avatar: string | null;
  created_at: string;
  updated_at: string;
}

export const UserDAL = {
  // 获取所有用户
  getAll(): User[] {
    const db = getDb();
    return db.prepare('SELECT * FROM users ORDER BY created_at DESC').all() as User[];
  },

  // 获取单个用户
  getById(id: string): User | undefined {
    const db = getDb();
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;
  },

  // 根据用户名获取用户
  getByUsername(username: string): User | undefined {
    const db = getDb();
    return db.prepare('SELECT * FROM users WHERE username = ?').get(username) as User | undefined;
  },

  // 创建用户
  create(data: { id: string; username: string; password: string; email?: string; role?: string }): boolean {
    const db = getDb();
    try {
      db.prepare(`
        INSERT INTO users (id, username, password, email, role)
        VALUES (?, ?, ?, ?, ?)
      `).run(data.id, data.username, data.password, data.email || null, data.role || 'client');
      return true;
    } catch (error) {
      console.error('[DAL] User create error:', error);
      return false;
    }
  },

  // 更新用户
  update(id: string, data: Partial<User>): boolean {
    const db = getDb();
    try {
      const fields = Object.keys(data).filter(k => k !== 'id');
      const setClause = fields.map(f => `${f} = @${f}`).join(', ');
      db.prepare(`UPDATE users SET ${setClause}, updated_at = datetime('now') WHERE id = @id`).run({ ...data, id });
      return true;
    } catch (error) {
      console.error('[DAL] User update error:', error);
      return false;
    }
  },

  // 删除用户
  delete(id: string): boolean {
    const db = getDb();
    try {
      db.prepare('DELETE FROM users WHERE id = ?').run(id);
      return true;
    } catch (error) {
      console.error('[DAL] User delete error:', error);
      return false;
    }
  }
};
