#!/bin/bash

COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"
PORT=5000
DEPLOY_RUN_PORT="${DEPLOY_RUN_PORT:-$PORT}"
BACKEND_PORT=8000

echo "🚀 Starting production services..."
echo "   Frontend port: ${DEPLOY_RUN_PORT}"
echo "   Backend port: ${BACKEND_PORT}"

cd "${COZE_WORKSPACE_PATH}"

# 创建数据目录
mkdir -p "${COZE_WORKSPACE_PATH}/backend/data"

# 创建日志目录
mkdir -p /tmp/logs

# 启动后端服务（后台）
echo "🔧 Starting backend service..."
cd "${COZE_WORKSPACE_PATH}/backend"

# 后台启动后端
uvicorn app.main:app --host 0.0.0.0 --port ${BACKEND_PORT} > /tmp/logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "✅ Backend started (PID: ${BACKEND_PID})"

# 等待后端启动
sleep 5

# 检查后端是否启动成功
for i in {1..6}; do
    if curl -s "http://localhost:${BACKEND_PORT}/health" > /dev/null 2>&1; then
        echo "✅ Backend health check passed!"
        break
    fi
    echo "⏳ Waiting for backend... attempt $i/6"
    sleep 2
done

# 启动前端服务
echo "🔧 Starting frontend service..."
cd "${COZE_WORKSPACE_PATH}"
echo "✅ Frontend starting on port ${DEPLOY_RUN_PORT}..."

exec npx next start --port ${DEPLOY_RUN_PORT}
