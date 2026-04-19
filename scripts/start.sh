#!/bin/bash
set -Eeuo pipefail

COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"
PORT=5000
DEPLOY_RUN_PORT="${DEPLOY_RUN_PORT:-$PORT}"

cd "${COZE_WORKSPACE_PATH}"

# 启动Python后端（端口8000）
echo "Starting Python backend on port 8000..."
cd "${COZE_WORKSPACE_PATH}/backend"
nohup python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend started with PID: $BACKEND_PID"

# 等待后端启动
sleep 3

# 检查后端是否正常
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "Backend health check passed!"
else
    echo "Warning: Backend health check failed, but continuing..."
fi

# 启动前端（端口5000）
cd "${COZE_WORKSPACE_PATH}"
echo "Starting Next.js frontend on port ${DEPLOY_RUN_PORT}..."
exec npx next start --port ${DEPLOY_RUN_PORT}
