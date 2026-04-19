#!/bin/bash
set -Eeuo pipefail

COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"

cd "${COZE_WORKSPACE_PATH}"

# 安装前端依赖
echo "Installing frontend dependencies..."
pnpm install --prefer-frozen-lockfile --prefer-offline --loglevel debug --reporter=append-only

# 构建前端
echo "Building the frontend..."
pnpm next build

# 安装后端依赖
echo "Installing backend dependencies..."
cd "${COZE_WORKSPACE_PATH}/backend"
pip install -r requirements.txt -q

# 初始化数据库（如果不存在）
if [ ! -f "data/lobster_ai.db" ]; then
    echo "Initializing database..."
    python3 -c "from app.database import init_db; import asyncio; asyncio.run(init_db())"
fi

echo "Build completed successfully!"
