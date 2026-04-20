#!/bin/bash

# 龙掌柜生产环境启动脚本
# 同时启动前端和后端服务

COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"
PORT=5000
DEPLOY_RUN_PORT="${DEPLOY_RUN_PORT:-$PORT}"
BACKEND_PORT=8000

echo "🚀 启动龙掌柜智能运营系统..."
echo "   前端端口: ${DEPLOY_RUN_PORT}"
echo "   后端端口: ${BACKEND_PORT}"

cd "${COZE_WORKSPACE_PATH}"

# 创建必要的目录
mkdir -p "${COZE_WORKSPACE_PATH}/backend/data"
mkdir -p /app/work/logs/bypass

# ============================================
# 启动后端服务（后台运行）
# ============================================
echo "🔧 启动Python后端服务..."
cd "${COZE_WORKSPACE_PATH}/backend"

# 使用nohup确保后台进程持续运行
nohup uvicorn app.main:app --host 0.0.0.0 --port ${BACKEND_PORT} > /app/work/logs/bypass/backend.log 2>&1 &
BACKEND_PID=$!
echo "✅ 后端服务启动完成 (PID: ${BACKEND_PID})"

# 等待后端启动
sleep 3

# 检查后端健康状态
for i in {1..10}; do
    if curl -s "http://localhost:${BACKEND_PORT}/health" > /dev/null 2>&1; then
        echo "✅ 后端健康检查通过"
        break
    fi
    echo "⏳ 等待后端启动... ($i/10)"
    sleep 2
done

# 验证后端进程存活
if ! kill -0 ${BACKEND_PID} 2>/dev/null; then
    echo "❌ 后端进程已退出，请检查日志："
    tail -50 /app/work/logs/bypass/backend.log
fi

# ============================================
# 启动前端服务（前台运行，保持容器存活）
# ============================================
echo "🔧 启动Next.js前端服务..."
cd "${COZE_WORKSPACE_PATH}"

# 使用node直接启动，保持前台运行
exec node .next/standalone/server.js
