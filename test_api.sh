#!/bin/bash
# 龙掌柜智能运营系统 - API接口测试脚本
# 使用方法: ./test_api.sh

set -e

BASE_URL="http://localhost:8000/api/v1"
TOKEN=""

echo "=========================================="
echo "龙掌柜智能运营系统 - API接口测试"
echo "=========================================="
echo ""

# 1. 健康检查
echo "1. 健康检查..."
curl -s http://localhost:8000/health | jq .
echo ""

# 2. 登录获取token
echo "2. 用户登录..."
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800138000","password":"admin123"}')
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token')
echo "Token获取成功: ${TOKEN:0:50}..."
echo ""

# 3. 获取当前用户
echo "3. 获取当前用户..."
curl -s $BASE_URL/auth/me \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# 4. 获取AI模型列表
echo "4. 获取AI模型列表..."
curl -s $BASE_URL/ai/models | jq '.models[:3]'
echo ""

# 5. 选品分析
echo "5. 选品分析测试..."
curl -s -X POST $BASE_URL/ai/select-products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"category":"宠物用品","platform":"tiktok","region":"id","budget":"中等","quantity":3}' | jq '.success'
echo ""

# 6. 智能定价
echo "6. 智能定价测试..."
curl -s -X POST $BASE_URL/ai/calculate-price \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"cost_price":68.00,"logistics_cost":15.00,"platform_fee_rate":0.06,"target_profit_rate":0.30}' | jq '.success'
echo ""

# 7. Listing优化
echo "7. Listing优化测试..."
curl -s -X POST $BASE_URL/ai/optimize-listing \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"product_info":{"name":"宠物饮水机","description":"自动循环饮水"},"target_platform":"tiktok"}' | jq '.success'
echo ""

# 8. 关键词建议
echo "8. 关键词建议测试..."
curl -s -X POST $BASE_URL/ai/suggest-keywords \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"product_name":"宠物玩具","platform":"tiktok","region":"id","count":10}' | jq '.success'
echo ""

# 9. 客服回复
echo "9. 客服回复测试..."
curl -s -X POST $BASE_URL/ai/customer-reply \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"产品什么时候发货？","language":"id"}' | jq '.success'
echo ""

# 10. 数据报告
echo "10. 数据报告测试..."
curl -s -X POST $BASE_URL/ai/data-report \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"start_date":"2024-01-01","end_date":"2024-01-31","platform":"tiktok"}' | jq '.success'
echo ""

# 11. 竞品分析
echo "11. 竞品分析测试..."
curl -s -X POST $BASE_URL/ai/analyze-competition \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"product_name":"宠物玩具","platform":"tiktok","region":"id"}' | jq '.success'
echo ""

# 12. 获取商品列表
echo "12. 获取商品列表..."
curl -s $BASE_URL/erp/products \
  -H "Authorization: Bearer $TOKEN" | jq '.total'
echo ""

# 13. 工作流模板
echo "13. 工作流模板列表..."
curl -s $BASE_URL/workflow/templates | jq '.[].name'
echo ""

# 14. TikTok类目
echo "14. TikTok类目列表..."
curl -s $BASE_URL/tiktok/categories \
  -H "Authorization: Bearer $TOKEN" | jq '.categories[:3]'
echo ""

# 15. 飞书指令
echo "15. 飞书支持指令..."
curl -s $BASE_URL/feishu/commands | jq '.commands[:3]'
echo ""

echo "=========================================="
echo "测试完成！"
echo "=========================================="
