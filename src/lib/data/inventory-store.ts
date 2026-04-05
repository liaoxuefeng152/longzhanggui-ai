/**
 * 库存数据存储
 * 用于在API路由之间共享数据
 */

export interface InventoryItem {
  id: string;
  product_id: string;
  product_name: string;
  sku: string;
  warehouse_id: string;
  warehouse_name: string;
  quantity_available: number;
  quantity_reserved: number;
  quantity_in_transit: number;
  quantity_on_order: number;
  unit_cost: number;
  total_value: number;
  reorder_point: number;
  reorder_quantity: number;
  last_restocked: string | null;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  created_at: string;
  updated_at: string;
}

// 初始化库存数据
const initialInventory: InventoryItem[] = [
  {
    id: 'INV-001',
    product_id: 'PROD-001',
    product_name: '智能手表 S5',
    sku: 'SKU-SW-S5-BLK',
    warehouse_id: 'WH-001',
    warehouse_name: '深圳仓',
    quantity_available: 350,
    quantity_reserved: 50,
    quantity_in_transit: 0,
    quantity_on_order: 0,
    unit_cost: 85.00,
    total_value: 34000.00,
    reorder_point: 100,
    reorder_quantity: 500,
    last_restocked: new Date(Date.now() - 10 * 86400000).toISOString(),
    status: 'in_stock',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'INV-002',
    product_id: 'PROD-002',
    product_name: '无线蓝牙耳机',
    sku: 'SKU-BT-WHT',
    warehouse_id: 'WH-001',
    warehouse_name: '深圳仓',
    quantity_available: 1200,
    quantity_reserved: 200,
    quantity_in_transit: 0,
    quantity_on_order: 0,
    unit_cost: 45.00,
    total_value: 63000.00,
    reorder_point: 200,
    reorder_quantity: 1000,
    last_restocked: new Date(Date.now() - 5 * 86400000).toISOString(),
    status: 'in_stock',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'INV-003',
    product_id: 'PROD-003',
    product_name: '便携式充电宝',
    sku: 'SKU-PB-20K',
    warehouse_id: 'WH-001',
    warehouse_name: '深圳仓',
    quantity_available: 80,
    quantity_reserved: 20,
    quantity_in_transit: 0,
    quantity_on_order: 800,
    unit_cost: 35.00,
    total_value: 3500.00,
    reorder_point: 100,
    reorder_quantity: 800,
    last_restocked: new Date(Date.now() - 30 * 86400000).toISOString(),
    status: 'low_stock',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
];

// 全局库存数据存储
const globalForInventory = globalThis as unknown as {
  inventory: InventoryItem[] | undefined;
};

export const inventoryStore = globalForInventory.inventory || initialInventory;

if (process.env.NODE_ENV !== 'production') {
  globalForInventory.inventory = inventoryStore;
}

// 辅助函数
export function getAllInventory(): InventoryItem[] {
  return inventoryStore;
}

export function getInventoryById(id: string): InventoryItem | undefined {
  return inventoryStore.find(i => i.id === id);
}

export function getInventoryByProductId(productId: string): InventoryItem | undefined {
  return inventoryStore.find(i => i.product_id === productId);
}

export function addInventory(item: InventoryItem): void {
  inventoryStore.push(item);
}

export function updateInventory(id: string, updates: Partial<InventoryItem>): InventoryItem | undefined {
  const index = inventoryStore.findIndex(i => i.id === id);
  if (index !== -1) {
    inventoryStore[index] = {
      ...inventoryStore[index],
      ...updates,
      total_value: (updates.quantity_available ?? inventoryStore[index].quantity_available) * 
                  (updates.unit_cost ?? inventoryStore[index].unit_cost),
      updated_at: new Date().toISOString(),
    };
    return inventoryStore[index];
  }
  return undefined;
}

export function updateInventoryQuantity(productId: string, quantityChange: number): InventoryItem | undefined {
  const item = inventoryStore.find(i => i.product_id === productId);
  if (item) {
    const newQuantity = item.quantity_available + quantityChange;
    if (newQuantity < 0) {
      throw new Error('库存不足');
    }

    item.quantity_available = newQuantity;
    item.total_value = newQuantity * item.unit_cost;

    // 更新状态
    if (newQuantity <= 0) {
      item.status = 'out_of_stock';
    } else if (newQuantity <= item.reorder_point) {
      item.status = 'low_stock';
    } else {
      item.status = 'in_stock';
    }

    item.updated_at = new Date().toISOString();
    return item;
  }
  return undefined;
}

export function deleteInventory(id: string): boolean {
  const index = inventoryStore.findIndex(i => i.id === id);
  if (index !== -1) {
    inventoryStore.splice(index, 1);
    return true;
  }
  return false;
}
