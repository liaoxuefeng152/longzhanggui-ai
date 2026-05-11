# 龙掌柜智能运营系统 - 接口测试用例

## 测试用例清单

### TC001: 用户登录
- **接口**: POST /api/v1/auth/login
- **请求体**: `{"phone":"13800138000","password":"admin123"}`
- **预期结果**: 返回 access_token 和 user 信息

### TC002: 获取当前用户信息
- **接口**: GET /api/v1/auth/me
- **认证**: Bearer Token
- **预期结果**: 返回当前用户详细信息

### TC003: 健康检查
- **接口**: GET /health
- **预期结果**: `{"status":"ok"}`

### TC004: 获取可用模型列表
- **接口**: GET /api/v1/ai/models
- **预期结果**: 返回模型列表

### TC005: 选品分析
- **接口**: POST /api/v1/ai/select-products
- **请求体**: `{"category":"宠物用品","platform":"tiktok","region":"id","budget":"中等","quantity":3}`
- **预期结果**: 返回选品结果列表

### TC006: 智能定价计算
- **接口**: POST /api/v1/ai/calculate-price
- **请求体**: `{"cost_price":68.00,"logistics_cost":15.00,"platform_fee_rate":0.06,"target_profit_rate":0.30}`
- **预期结果**: 返回计算后的价格信息

### TC007: Listing优化
- **接口**: POST /api/v1/ai/optimize-listing
- **请求体**: `{"product_name":"宠物饮水机","product_description":"自动循环饮水","target_platform":"tiktok"}`
- **预期结果**: 返回优化后的标题、描述、关键词等

### TC008: 图片处理(翻译模式)
- **接口**: POST /api/v1/ai/process-image
- **请求体**: `{"image_url":"https://via.placeholder.com/300x200.png","mode":"translate","target_language":"id"}`
- **预期结果**: 返回处理后的图片URL和翻译文本

### TC009: 批量图片处理
- **接口**: POST /api/v1/ai/process-image/batch
- **请求体**: `{"image_urls":["https://via.placeholder.com/300x200.png","https://via.placeholder.com/400x300.png"],"mode":"translate","target_language":"th"}`
- **预期结果**: 返回批量处理结果

### TC010: 竞品分析
- **接口**: POST /api/v1/ai/analyze-competition
- **请求体**: `{"product_name":"宠物玩具","platform":"tiktok","region":"id"}`
- **预期结果**: 返回竞品分析报告

### TC011: 关键词建议
- **接口**: POST /api/v1/ai/suggest-keywords
- **请求体**: `{"product_name":"宠物玩具","platform":"tiktok","region":"id","count":10}`
- **预期结果**: 返回关键词建议列表

### TC012: 客服回复生成
- **接口**: POST /api/v1/ai/customer-reply
- **请求体**: `{"customer_message":"产品什么时候发货？","language":"id"}`
- **预期结果**: 返回生成的回复内容

### TC013: 数据报告生成
- **接口**: POST /api/v1/ai/data-report
- **请求体**: `{"date_range":{"start":"2024-01-01","end":"2024-01-31"},"platform":"tiktok"}`
- **预期结果**: 返回数据报告

### TC014: 获取智能体列表
- **接口**: GET /api/v1/ai/agents
- **预期结果**: 返回7大AI智能体列表

### TC015: 工作流模板列表
- **接口**: GET /api/v1/workflow/templates
- **预期结果**: 返回工作流模板列表

### TC016: 工作流健康检查
- **接口**: GET /api/v1/workflow/health
- **预期结果**: 返回健康状态

### TC017: 执行工作流(同步)
- **接口**: POST /api/v1/workflow/execute-sync
- **请求体**: `{"template_name":"product_image_optimize","params":{"category":"宠物用品"}}`
- **预期结果**: 返回执行结果

### TC018: 获取控制台统计
- **接口**: GET /api/v1/dashboard/stats
- **预期结果**: 返回统计数据

### TC019: 获取商品列表
- **接口**: GET /api/v1/erp/products
- **预期结果**: 返回商品列表

### TC020: 创建商品
- **接口**: POST /api/v1/erp/products
- **请求体**: `{"name":"测试商品","category":"宠物用品","cost_price":50.00,"sku":"TEST001"}`
- **预期结果**: 返回创建的商品信息

### TC021: 获取库存列表
- **接口**: GET /api/v1/erp/inventory
- **预期结果**: 返回库存列表

### TC022: 获取订单列表
- **接口**: GET /api/v1/erp/orders
- **预期结果**: 返回订单列表

### TC023: 获取财务汇总
- **接口**: GET /api/v1/erp/finance/summary
- **预期结果**: 返回财务汇总数据

### TC024: 获取模型列表
- **接口**: GET /api/v1/models
- **预期结果**: 返回模型配置列表

### TC025: 获取Prompt列表
- **接口**: GET /api/v1/prompts
- **预期结果**: 返回Prompt列表

### TC026: 获取飞书支持的指令
- **接口**: GET /api/v1/feishu/commands
- **预期结果**: 返回支持的指令列表

### TC027: TikTok健康检查
- **接口**: GET /api/v1/tiktok/health
- **预期结果**: 返回TikTok连接状态

### TC028: 获取TikTok类目
- **接口**: GET /api/v1/tiktok/categories
- **预期结果**: 返回类目列表

### TC029: 获取平台配置
- **接口**: GET /api/v1/platforms
- **预期结果**: 返回平台配置列表

### TC030: 获取套餐列表
- **接口**: GET /api/v1/packages
- **预期结果**: 返回套餐列表

### TC031: 获取任务日志列表
- **接口**: GET /api/v1/task-logs
- **预期结果**: 返回任务日志列表

### TC032: 获取工单列表
- **接口**: GET /api/v1/customer-tickets
- **预期结果**: 返回工单列表

### TC033: 获取报表概览
- **接口**: GET /api/v1/reports/overview
- **预期结果**: 返回报表数据

### TC034: 获取系统设置
- **接口**: GET /api/v1/settings
- **预期结果**: 返回系统设置

### TC035: 获取飞书用户列表
- **接口**: GET /api/v1/feishu-users
- **预期结果**: 返回飞书用户列表

### TC036: 创建飞书用户
- **接口**: POST /api/v1/feishu-users
- **请求体**: `{"feishu_open_id":"ou_xxx","nickname":"测试用户"}`
- **预期结果**: 返回创建的用户信息

### TC037: 获取1688采集历史
- **接口**: GET /api/v1/1688/history
- **预期结果**: 返回采集历史记录

### TC038: 创建广告计划
- **接口**: POST /api/v1/ai/create-ad
- **请求体**: `{"product_id":"test123","platform":"tiktok","daily_budget":100,"target_acos":0.2,"keywords":["pet toy"]}`
- **预期结果**: 返回创建的广告计划

### TC039: 获取平台绑定列表
- **接口**: GET /api/v1/platform-bindings
- **预期结果**: 返回平台绑定列表

### TC040: 创建平台绑定
- **接口**: POST /api/v1/platform-bindings
- **请求体**: `{"platform":"tiktok","shop_name":"测试店铺","region":"id"}`
- **预期结果**: 返回创建的绑定信息

## 执行命令

```bash
# 健康检查
curl -s http://localhost:8000/health

# 认证登录
TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800138000","password":"admin123"}' | jq -r '.access_token')

# 测试获取用户
curl -s http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"

# 测试AI选品
curl -s -X POST http://localhost:8000/api/v1/ai/select-products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"category":"宠物用品","platform":"tiktok","region":"id","budget":"中等","quantity":3}'
```
