#!/bin/bash

# 龙掌柜生产环境启动脚本
# 同时启动前端和后端服务（后端启动失败不影响前端）

COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"
PORT="${DEPLOY_RUN_PORT:-5000}"
BACKEND_PORT=8000

echo "========================================="
echo "  龙掌柜智能运营系统 - 生产环境启动"
echo "  前端端口: ${PORT}"
echo "  后端端口: ${BACKEND_PORT}"
echo "========================================="

cd "${COZE_WORKSPACE_PATH}"

# ============================================
# 创建必要的目录（容错：生产环境部分目录可能只读）
# ============================================
mkdir -p "${COZE_WORKSPACE_PATH}/backend/data" 2>/dev/null || true

# 确定日志目录
LOG_DIR="/app/work/logs/bypass"
if [ ! -d "${LOG_DIR}" ] || [ ! -w "${LOG_DIR}" ]; then
  LOG_DIR="/tmp"
  mkdir -p "${LOG_DIR}" 2>/dev/null || true
fi

# 确定后端数据目录
DATA_DIR="${COZE_WORKSPACE_PATH}/backend/data"
if [ ! -d "${DATA_DIR}" ] || [ ! -w "${DATA_DIR}" ]; then
  DATA_DIR="/tmp/backend_data"
  mkdir -p "${DATA_DIR}" 2>/dev/null || true
  export DATABASE_URL="sqlite+aiosqlite:///${DATA_DIR}/erp.db"
fi

# ============================================
# 尝试启动后端服务（后台运行，失败不影响前端）
# ============================================
if command -v uvicorn &>/dev/null || command -v python3 &>/dev/null || command -v python &>/dev/null; then
  echo "[后端] 检测到 Python 环境，尝试启动后端服务..."
  cd "${COZE_WORKSPACE_PATH}/backend"
  nohup uvicorn app.main:app --host 0.0.0.0 --port ${BACKEND_PORT} > "${LOG_DIR}/backend.log" 2>&1 &
  BACKEND_PID=$!
  echo "[后端] 后端服务启动中 (PID: ${BACKEND_PID})"
  cd "${COZE_WORKSPACE_PATH}"
else
  echo "[后端] 未检测到 Python 环境，跳过后端启动（前端仍可正常运行）"
fi

# ============================================
# 启动前端服务（前台运行，保持容器存活）
# ============================================
echo "[前端] 启动 Next.js standalone 服务..."

# Next.js standalone 模式需要 PORT 和 HOSTNAME 环境变量
export PORT="${PORT}"
export HOSTNAME="0.0.0.0"

# 验证 standalone server.js 存在
if [ ! -f ".next/standalone/server.js" ]; then
  echo "[错误] .next/standalone/server.js 不存在！"
  echo "[错误] 请检查构建是否成功完成"
  exit 1
fi

echo "[前端] Next.js 监听: ${HOSTNAME}:${PORT}"
exec node .next/standalone/server.js
