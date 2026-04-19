"""
TikTok Shop API 诊断工具
用于测试API连接和配置
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
        print(f"✓ 已加载配置文件: {env_file}")
    else:
        print(f"⚠️ 未找到配置文件: {env_file}")
except ImportError:
    print("⚠️ 未安装 python-dotenv，无法加载.env文件")

def test_tiktok_api_config():
    """测试TikTok Shop API配置"""
    print("=" * 60)
    print("TikTok Shop API 配置诊断")
    print("=" * 60)

    # 检查环境变量
    app_key = os.getenv("TIKTOK_SHOP_APP_KEY")
    app_secret = os.getenv("TIKTOK_SHOP_APP_SECRET")
    api_url = os.getenv("TIKTOK_SHOP_API_URL", "https://open.tiktokapis.com")

    print("\n【1. 环境变量检查】")
    print(f"✓ TIKTOK_SHOP_APP_KEY: {'已设置' if app_key else '❌ 未设置'}")
    print(f"✓ TIKTOK_SHOP_APP_SECRET: {'已设置' if app_secret else '❌ 未设置'}")
    print(f"✓ TIKTOK_SHOP_API_URL: {api_url}")

    if not app_key or not app_secret:
        print("\n❌ 缺少必需的API密钥，请检查.env文件")
        return False

    # 测试API连接
    print("\n【2. API连接测试】")
    test_urls = [
        f"{api_url}/product/202309/products",
        f"{api_url}/v2/shop/auth/token",
    ]

    for url in test_urls:
        try:
            response = requests.get(url, timeout=10)
            print(f"✓ {url}: HTTP {response.status_code}")
        except Exception as e:
            print(f"❌ {url}: {str(e)}")

    # API密钥格式检查
    print("\n【3. API密钥格式检查】")
    print(f"✓ App Key 长度: {len(app_key)} 字符")
    print(f"✓ App Secret 长度: {len(app_secret)} 字符")

    if len(app_key) < 10:
        print("⚠️ App Key长度似乎太短，请检查是否正确")
    if len(app_secret) < 20:
        print("⚠️ App Secret长度似乎太短，请检查是否正确")

    print("\n【4. 常见问题排查】")
    print("""
可能的失败原因：

1. API密钥无效
   - 检查密钥是否从TikTok Shop开放平台正确复制
   - 确认密钥未过期
   - 验证密钥权限是否包含商品/订单读取权限

2. API端点不正确
   - TikTok Shop API端点可能因地区而异
   - 不同站点（东南亚/欧美）API可能不同
   - 建议联系TikTok Shop官方确认正确的API端点

3. 需要额外的认证步骤
   - 某些API需要先获取Access Token
   - 可能需要店铺授权流程
   - 建议查看TikTok Shop官方文档

4. 网络问题
   - 检查是否能访问 open.tiktokapis.com
   - 尝试使用代理或VPN

5. API版本问题
   - 当前使用的是202309版本
   - 可能需要更新到最新版本

【建议操作步骤】

1. 访问 TikTok Shop 开放平台: https://partner.tiktokshop.com
2. 检查应用状态和权限
3. 确认API文档中的正确端点
4. 测试API密钥是否有效
5. 如需帮助，联系TikTok Shop技术支持

【智能体仍可提供的价值】

即使API暂时无法连接，智能体仍可帮您：

✅ 市场趋势分析（通过联网搜索）
✅ 商品Listing优化（智能生成）
✅ 图片/视频生成（AI创作）
✅ 利润计算（手动输入数据）
✅ 定价策略建议（智能推荐）
✅ 多语种客服（自动翻译）
✅ 合规检查（图片/文本分析）

您可以继续使用这些功能进行店铺运营！
    """)

    return True

if __name__ == "__main__":
    test_tiktok_api_config()
