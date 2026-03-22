#!/bin/bash
# ===========================================
# 运行测试脚本
# ===========================================

set -e

echo "🧪 运行测试..."

# 激活虚拟环境
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# 安装测试依赖
pip install pytest pytest-asyncio pytest-cov httpx

# 运行测试
pytest tests/ -v --cov=app --cov-report=term-missing

echo "✅ 测试完成"
