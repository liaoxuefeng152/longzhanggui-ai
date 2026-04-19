"""
测试TikTok Shop API连接
"""
import os
import json
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

def test_tiktok_token():
    """测试获取TikTok Shop Access Token"""
    print("=" * 60)
    print("TikTok Shop API Token 获取测试")
    print("=" * 60)

    app_key = os.getenv("TIKTOK_SHOP_APP_KEY")
    app_secret = os.getenv("TIKTOK_SHOP_APP_SECRET")
    api_url = os.getenv("TIKTOK_SHOP_API_URL", "https://open.tiktokapis.com")

    print(f"\n【配置信息】")
    print(f"API URL: {api_url}")
    print(f"App Key: {app_key}")
    print(f"App Secret: {app_secret[:20]}...")  # 只显示前20位

    if not app_key or not app_secret:
        print("\n❌ 缺少API密钥")
        return

    # 尝试获取Access Token
    print(f"\n【请求Access Token】")
    token_url = f"{api_url}/v2/shop/auth/token"

    payload = {
        "app_key": app_key,
        "app_secret": app_secret,
        "auth_type": "app"
    }

    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }

    try:
        print(f"URL: {token_url}")
        print(f"Payload: {json.dumps(payload, indent=2)}")

        response = requests.post(
            token_url,
            json=payload,
            headers=headers,
            timeout=30
        )

        print(f"\n【响应信息】")
        print(f"HTTP状态码: {response.status_code}")
        print(f"响应头: {dict(response.headers)}")
        print(f"响应内容: {response.text[:500]}")

        if response.status_code == 200:
            try:
                data = response.json()
                print(f"\n✅ 成功!")
                print(json.dumps(data, indent=2, ensure_ascii=False))

                if "data" in data:
                    access_token = data["data"].get("access_token")
                    if access_token:
                        print(f"\n🎉 Access Token获取成功!")
                        print(f"Token: {access_token[:30]}...")

                        # 测试使用Token调用API
                        print(f"\n【使用Token测试API】")
                        test_products_url = f"{api_url}/product/202309/products"
                        auth_headers = {
                            "Authorization": f"Bearer {access_token}",
                            "Content-Type": "application/json"
                        }

                        prod_response = requests.get(
                            test_products_url,
                            headers=auth_headers,
                            params={"page_size": 5},
                            timeout=30
                        )

                        print(f"商品API响应: {prod_response.status_code}")
                        print(f"商品API内容: {prod_response.text[:500]}")
                else:
                    print(f"\n⚠️ 响应中没有data字段")
                    print(f"完整响应: {json.dumps(data, indent=2, ensure_ascii=False)}")

            except json.JSONDecodeError:
                print(f"\n❌ 响应不是有效的JSON")
                print(f"原始响应: {response.text}")
        else:
            print(f"\n❌ 请求失败")
            print(f"状态码: {response.status_code}")

    except Exception as e:
        print(f"\n❌ 请求异常: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_tiktok_token()
