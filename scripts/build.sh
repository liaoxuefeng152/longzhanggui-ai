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

# Next.js standalone 模式需要手动复制静态资源
echo "Copying static assets for standalone mode..."
cp -r .next/static .next/standalone/.next/static 2>/dev/null || true
cp -r public .next/standalone/public 2>/dev/null || true

# 安装后端依赖
echo "Installing backend dependencies..."
cd "${COZE_WORKSPACE_PATH}/backend"
pip install -r requirements.txt -q 2>/dev/null || pip install -r requirements.txt -q

# 确保数据目录存在（容错：生产环境可能只读）
mkdir -p data 2>/dev/null || true

# 数据库会在后端首次启动时自动初始化
echo "Database will be initialized on first backend startup"

echo "Build completed successfully!"
