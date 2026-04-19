#!/bin/bash
# 移除严格模式，允许部分失败
# set -Eeuo pipefail

COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"
PORT=5000
DEPLOY_RUN_PORT="${DEPLOY_RUN_PORT:-$PORT}"

cd "${COZE_WORKSPACE_PATH}"

# 确保数据目录存在
mkdir -p "${COZE_WORKSPACE_PATH}/backend/data"

# 启动Python后端（端口8000）
echo "Starting Python backend on port 8000..."
cd "${COZE_WORKSPACE_PATH}/backend"

# 设置PYTHONPATH
export PYTHONPATH="${COZE_WORKSPACE_PATH}/backend"

# 后台启动后端
nohup python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend started with PID: $BACKEND_PID"

# 等待后端启动
echo "Waiting for backend to start..."
sleep 5

# 检查后端是否正常
for i in {1..10}; do
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo "Backend health check passed!"
        break
    fi
    echo "Waiting for backend... attempt $i/10"
    sleep 2
done

# 启动前端（端口5000）
cd "${COZE_WORKSPACE_PATH}"
echo "Starting Next.js frontend on port ${DEPLOY_RUN_PORT}..."
exec npx next start --port ${DEPLOY_RUN_PORT}
