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

# 创建必要的目录（容错：生产环境部分目录可能只读）
mkdir -p "${COZE_WORKSPACE_PATH}/backend/data" 2>/dev/null || true

# 确定日志目录（优先 /app/work/logs/bypass，不可写则用 /tmp）
LOG_DIR="/app/work/logs/bypass"
if [ ! -d "${LOG_DIR}" ] || [ ! -w "${LOG_DIR}" ]; then
  LOG_DIR="/tmp"
  mkdir -p "${LOG_DIR}" 2>/dev/null || true
fi

# 确定后端数据目录（优先 backend/data，不可写则用 /tmp）
DATA_DIR="${COZE_WORKSPACE_PATH}/backend/data"
if [ ! -d "${DATA_DIR}" ] || [ ! -w "${DATA_DIR}" ]; then
  DATA_DIR="/tmp/backend_data"
  mkdir -p "${DATA_DIR}" 2>/dev/null || true
  export DATABASE_URL="sqlite+aiosqlite:///${DATA_DIR}/erp.db"
fi

# ============================================
# 启动后端服务（后台运行，不阻塞前端启动）
# ============================================
echo "🔧 启动Python后端服务..."
cd "${COZE_WORKSPACE_PATH}/backend"
nohup uvicorn app.main:app --host 0.0.0.0 --port ${BACKEND_PORT} > "${LOG_DIR}/backend.log" 2>&1 &
BACKEND_PID=$!
echo "✅ 后端服务启动中 (PID: ${BACKEND_PID})"

# ============================================
# 立即启动前端服务（前台运行，保持容器存活）
# 前端优先启动确保5000端口尽快响应健康检查
# 后端在后台并行启动
# ============================================
echo "🔧 启动Next.js前端服务..."
cd "${COZE_WORKSPACE_PATH}"

# Next.js standalone 模式需要 PORT 和 HOSTNAME 环境变量
export PORT=${DEPLOY_RUN_PORT}
export HOSTNAME="0.0.0.0"
echo "   Next.js 监听: ${HOSTNAME}:${PORT}"

exec node .next/standalone/server.js
