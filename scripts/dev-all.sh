#!/bin/bash
set -Eeuo pipefail

# 并行启动前后端脚本（沙箱环境）
COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"
FRONTEND_PORT=5000
BACKEND_PORT=8000

echo "🚀 启动龙虾AI跨境无人店系统..."
echo "   前端端口: ${FRONTEND_PORT}"
echo "   后端端口: ${BACKEND_PORT}"

# 清理端口
for port in ${FRONTEND_PORT} ${BACKEND_PORT}; do
    pids=$(ss -H -lntp 2>/dev/null | awk -v port="${port}" '$4 ~ ":"port"$"' | grep -o 'pid=[0-9]*' | cut -d= -f2 | paste -sd' ' - || true)
    if [[ -n "${pids}" ]]; then
        echo "🧹 清理端口 ${port} (PIDs: ${pids})"
        echo "${pids}" | xargs -I {} kill -9 {} 2>/dev/null || true
    fi
done

sleep 1

# 创建日志目录
mkdir -p /app/work/logs/bypass

# 添加用户bin目录到PATH
export PATH="${PATH}:/root/.local/bin"

# 启动后端服务（后台）
echo "🔧 启动后端服务..."
cd "${COZE_WORKSPACE_PATH}/backend"

# 创建数据目录
mkdir -p data

# 后台启动后端
nohup uvicorn app.main:app --host 0.0.0.0 --port ${BACKEND_PORT} > /app/work/logs/bypass/backend.log 2>&1 &
BACKEND_PID=$!
echo "✅ 后端服务启动完成 (PID: ${BACKEND_PID})"

# 等待后端启动
sleep 3

# 检查后端是否启动成功
if curl -s "http://localhost:${BACKEND_PORT}/health" > /dev/null 2>&1; then
    echo "✅ 后端服务健康检查通过"
else
    echo "⚠️ 后端服务可能未完全启动，继续启动前端..."
fi

# 启动前端服务
echo "🔧 启动前端服务..."
cd "${COZE_WORKSPACE_PATH}"

# 启动前端
echo "✅ 前端服务启动中..."
node "${COZE_WORKSPACE_PATH}/node_modules/next/dist/bin/next" dev --webpack --port ${FRONTEND_PORT}
