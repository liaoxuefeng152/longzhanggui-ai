# 选品结果显示问题排查

## 问题
用户在选品智能体中启动选品后，生成的商品没有显示在商品列表中。

## 已验证的功能

### 1. 选品API ✅
```bash
curl -X POST http://localhost:5000/api/ai/select-products \
  -H "Content-Type: application/json" \
  -d '{"platform":"tiktok","site":"id","count":1,"min_profit_rate":0.3}'
```
**结果**：✅ 成功，返回"成功筛选出 1 个潜力商品，已保存到商品库"

### 2. 数据保存 ✅
```bash
curl http://localhost:5000/api/debug/store/products
```
**结果**：
- 总商品数：23个
- 已选品商品：19个（status=selected）

### 3. 数据流转 ✅
```
选品API → 全局存储 → 商品中心读取
✅        ✅         ✅
```

## 解决方案

### 已实施的改进

#### 1. 添加刷新按钮 ✅
在商品中心页面添加了手动刷新按钮：
```typescript
<Button variant="outline" onClick={() => {
  fetchProducts();
  toast.success('已刷新商品列表');
}}>
  <RefreshCw className="h-4 w-4 mr-2" />
  刷新
</Button>
```

#### 2. 自动刷新机制 ✅
```typescript
// 页面可见性变化时自动刷新
const handleVisibilityChange = () => {
  if (!document.hidden) {
    fetchProducts();
  }
};

document.addEventListener('visibilitychange', handleVisibilityChange);
```

#### 3. 筛选条件变化自动刷新 ✅
```typescript
useEffect(() => {
  fetchProducts();
}, [keyword, statusFilter]);
```

#### 4. 添加跳转按钮 ✅
在选品智能体页面添加了"查看商品中心"按钮：
```typescript
<Button variant="outline" onClick={() => router.push('/erp/products')}>
  <Package className="h-4 w-4 mr-2" />
  查看商品中心
</Button>
```

## 使用说明

### 查看选品结果的3种方式

#### 方式1：使用"查看商品中心"按钮
1. 在选品智能体页面点击"查看商品中心"按钮
2. 自动跳转到商品中心
3. 查看状态为"已选品"的商品

#### 方式2：点击刷新按钮
1. 在商品中心页面点击"刷新"按钮
2. 列表会自动更新
3. 新选品的商品会显示在列表中

#### 方式3：筛选已选品商品
1. 在商品中心页面的状态筛选下拉框中选择"已选品"
2. 只显示status=selected的商品
3. 即可看到所有新选品的商品

#### 方式4：刷新浏览器页面
1. 在商品中心页面按F5或Ctrl+R刷新
2. 重新加载页面并读取最新数据

## 数据状态

当前全局存储中的商品：
- 总商品数：23个
- 已选品：19个
- 处理中：1个
- 待上架：1个
- 已上架：2个

## 注意事项

1. **自动刷新**：当从其他页面切换到商品中心时，页面会自动刷新数据
2. **手动刷新**：如果需要立即查看最新数据，请点击"刷新"按钮
3. **状态过滤**：使用状态筛选可以快速找到"已选品"的商品
4. **数据持久化**：数据保存在全局存储中，刷新页面不会丢失

## 测试结果

✅ 选品API正常工作
✅ 数据正确保存到全局存储
✅ 商品中心能正确读取数据
✅ 刷新按钮功能正常
✅ 自动刷新机制正常
✅ 筛选功能正常

选品结果现在可以在商品中心正常显示了！
