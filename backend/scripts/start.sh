#!/bin/bash
# ===========================================
# 生产环境启动脚本
# ===========================================

set -e

echo "🚀 启动生产环境..."

# 检查环境变量
if [ ! -f ".env" ]; then
    echo "❌ 未找到 .env 文件"
    exit 1
fi

# 创建必要目录
mkdir -p data logs

# 启动服务（使用gunicorn + uvicorn worker）
echo "🎯 启动 FastAPI 服务..."

gunicorn app.main:app \
    --workers 4 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:8000 \
    --timeout 120 \
    --keep-alive 5 \
    --access-logfile logs/access.log \
    --error-logfile logs/error.log \
    --log-level info
