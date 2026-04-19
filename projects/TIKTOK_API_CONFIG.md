# TikTok Shop API 配置指南

## 🔐 环境变量配置

为了安全地接入TikTok Shop API，需要配置以下环境变量：

### 必需的环境变量

```bash
# TikTok Shop 应用密钥
TIKTOK_SHOP_APP_KEY=6jlirmraabt34

# TikTok Shop 应用密码
TIKTOK_SHOP_APP_SECRET=1d8eed27c8162c3fcd37e3fce90684e073fa4034

# TikTok Shop API基础URL（可选，默认值如下）
TIKTOK_SHOP_API_URL=https://open.tiktokapis.com
```

## 📋 配置方法

### 方法1：使用 .env 文件（推荐）

1. 在项目根目录创建 `.env` 文件：
```bash
cd /workspace/projects
touch .env
```

2. 将以下内容写入 `.env` 文件：
```env
TIKTOK_SHOP_APP_KEY=6jlirmraabt34
TIKTOK_SHOP_APP_SECRET=1d8eed27c8162c3fcd37e3fce90684e073fa4034
TIKTOK_SHOP_API_URL=https://open.tiktokapis.com
```

3. 确保安装了 python-dotenv：
```bash
uv add python-dotenv
```

### 方法2：系统环境变量

#### Linux/Mac:
```bash
export TIKTOK_SHOP_APP_KEY=6jlirmraabt34
export TIKTOK_SHOP_APP_SECRET=1d8eed27c8162c3fcd37e3fce90684e073fa4034
export TIKTOK_SHOP_API_URL=https://open.tiktokapis.com
```

#### Windows (PowerShell):
```powershell
$env:TIKTOK_SHOP_APP_KEY="6jlirmraabt34"
$env:TIKTOK_SHOP_APP_SECRET="1d8eed27c8162c3fcd37e3fce90684e073fa4034"
$env:TIKTOK_SHOP_API_URL="https://open.tiktokapis.com"
```

### 方法3：在启动脚本中设置

编辑 `src/main.py`，在文件开头添加：
```python
import os

# 设置TikTok Shop API密钥
os.environ["TIKTOK_SHOP_APP_KEY"] = "6jlirmraabt34"
os.environ["TIKTOK_SHOP_APP_SECRET"] = "1d8eed27c8162c3fcd37e3fce90684e073fa4034"
os.environ["TIKTOK_SHOP_API_URL"] = "https://open.tiktokapis.com"
```

## ✅ 验证配置

配置完成后，可以通过以下方式验证：

### 测试1：获取商品列表
```
请帮我获取TikTok Shop的商品列表
```

### 测试2：获取订单数据
```
请帮我获取TikTok Shop 2025年1月1日到2025年1月31日的订单数据
```

### 测试3：获取店铺分析数据
```
请帮我获取TikTok Shop今天的店铺数据
```

## 🔧 可用功能

配置成功后，智能体将支持以下TikTok Shop功能：

### 1. 商品管理
- ✅ 获取商品列表
- ✅ 查看商品状态
- ✅ 分析商品销量

### 2. 订单管理
- ✅ 获取订单列表
- ✅ 查看订单详情
- ✅ 订单利润分析
- ✅ 销售额统计

### 3. 数据分析
- ✅ 店铺运营数据
- ✅ 销售趋势分析
- ✅ 转化率统计

### 4. 智能运营
- ✅ 自动利润计算
- ✅ 库存预警
- ✅ 销量排行榜

## ⚠️ 注意事项

1. **密钥安全**：
   - 不要将API密钥提交到Git仓库
   - 定期更换密钥
   - 限制API访问权限

2. **API限制**：
   - 注意TikTok Shop API的调用频率限制
   - 避免频繁请求导致账号受限
   - 建议使用缓存减少重复请求

3. **数据隐私**：
   - 客户数据仅用于分析，不外泄
   - 遵守TikTok Shop的数据使用政策

## 🚀 开始使用

配置完成后，您可以直接使用智能体：

```
# 获取商品数据
"帮我查看TikTok Shop上架了哪些商品"

# 获取订单数据
"帮我查看最近的订单情况"

# 分析利润
"帮我分析TikTok Shop店铺的利润情况"

# 综合运营
"帮我做一个TikTok Shop店铺的运营诊断"
```

## 📞 遇到问题？

如果配置后仍然无法使用，请检查：

1. ✅ 环境变量是否正确设置
2. ✅ API密钥是否有效
3. ✅ 网络连接是否正常
4. ✅ TikTok Shop账号权限是否充足
