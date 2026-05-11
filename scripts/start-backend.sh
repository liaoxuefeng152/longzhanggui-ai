#!/bin/bash
set -Eeuo pipefail

# 后端启动脚本（沙箱环境）
COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"
BACKEND_DIR="${COZE_WORKSPACE_PATH}/backend"
BACKEND_PORT=9000

cd "${BACKEND_DIR}"

# 创建数据目录
mkdir -p data

# 添加用户bin目录到PATH
export PATH="${PATH}:/root/.local/bin"

# 启动后端服务
echo "🚀 启动后端服务 (端口 ${BACKEND_PORT})..."
uvicorn app.main:app --host 0.0.0.0 --port ${BACKEND_PORT} --reload
