"""
尝试不同的TikTok Shop API端点
"""
import os
import requests

# 加载.env文件
try:
    from dotenv import load_dotenv
    workspace_path = os.getenv("COZE_WORKSPACE_PATH", "/workspace/projects")
    env_file = os.path.join(workspace_path, ".env")
    if os.path.exists(env_file):
        load_dotenv(env_file)
except ImportError:
    pass

app_key = os.getenv("TIKTOK_SHOP_APP_KEY")
app_secret = os.getenv("TIKTOK_SHOP_APP_SECRET")

print("尝试不同的TikTok Shop API端点...")
print(f"App Key: {app_key}\n")

# 尝试多个可能的API端点
endpoints = [
    {
        "name": "TikTok Shop Open API (US)",
        "token_url": "https://open-api.tiktokglobalshop.com/oauth2/access_token",
        "auth_url": "https://open-api.tiktokglobalshop.com/api/products/list",
    },
    {
        "name": "TikTok Shop Open API (Global)",
        "token_url": "https://partner.tiktokshop.com/api/v2/token/create",
        "auth_url": "https://partner.tiktokshop.com/api/v2/product/list",
    },
    {
        "name": "TikTok Shop (old endpoint)",
        "token_url": "https://api-va.tiktokshop.com/api/v2/token/create",
        "auth_url": "https://api-va.tiktokshop.com/api/v2/product/list",
    },
]

for endpoint in endpoints:
    print(f"\n{'='*60}")
    print(f"测试: {endpoint['name']}")
    print(f"{'='*60}")

    # 测试Token端点
    try:
        print(f"\n1. 测试Token端点: {endpoint['token_url']}")
        response = requests.get(endpoint['token_url'], timeout=10)
        print(f"   状态码: {response.status_code}")

        if response.status_code != 404:
            print(f"   ✅ 端点有效!")
            print(f"   响应: {response.text[:200]}")
    except Exception as e:
        print(f"   ❌ 错误: {str(e)}")

    # 测试Auth端点
    try:
        print(f"\n2. 测试Auth端点: {endpoint['auth_url']}")
        response = requests.get(endpoint['auth_url'], timeout=10)
        print(f"   状态码: {response.status_code}")

        if response.status_code != 404:
            print(f"   ✅ 端点有效!")
            print(f"   响应: {response.text[:200]}")
    except Exception as e:
        print(f"   ❌ 错误: {str(e)}")

print(f"\n{'='*60}")
print("总结")
print(f"{'='*60}")
print("""
根据测试结果，TikTok Shop API的端点可能因以下原因而不同：
1. 店铺所在地区（东南亚/欧美/其他）
2. API版本（v1/v2/v3）
3. 应用类型（Seller App/Partner App）

建议：
1. 登录 TikTok Shop 开放平台: https://partner.tiktokshop.com
2. 查看您的应用详情，获取正确的API端点
3. 确认店铺所在地区对应的API域名

临时方案：
- 继续使用智能体的其他功能（选品、Listing优化、图片视频生成等）
- 手动提供订单数据，智能体帮您分析
- 使用联网搜索获取市场趋势和竞品信息
""")

# 检查是否是测试环境密钥
if len(app_key) == 13:
    print(f"\n⚠️ 注意：您的App Key长度为{len(app_key)}字符，这可能是测试环境密钥")
    print("   生产环境的密钥可能需要从TikTok Shop开放平台重新获取")
