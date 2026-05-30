#!/bin/bash
set -Eeuo pipefail

COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"

cd "${COZE_WORKSPACE_PATH}"

# ============================================
# 步骤1: 安装前端依赖
# ============================================
echo "===== Installing frontend dependencies ====="
pnpm install --prefer-frozen-lockfile --prefer-offline 2>&1 || {
  echo "[警告] pnpm install 失败，尝试不带锁文件安装..."
  pnpm install 2>&1
}

# ============================================
# 步骤2: 构建前端 (Next.js standalone 模式)
# ============================================
echo "===== Building the frontend ====="
pnpm next build 2>&1

# ============================================
# 步骤3: 复制静态资源到 standalone 目录
# Next.js standalone 模式不自动包含以下资源，需手动复制
# ============================================
echo "===== Copying static assets for standalone mode ====="

STANDALONE_DIR=".next/standalone"

if [ ! -d "${STANDALONE_DIR}" ]; then
  echo "[错误] standalone 目录不存在: ${STANDALONE_DIR}"
  echo "[错误] 请检查 next.config.ts 中是否配置了 output: 'standalone'"
  exit 1
fi

# 复制客户端静态资源 (JS/CSS/字体等)
if [ -d ".next/static" ]; then
  mkdir -p "${STANDALONE_DIR}/.next/static"
  cp -r .next/static/* "${STANDALONE_DIR}/.next/static/" 2>/dev/null || true
  echo "[OK] 已复制 .next/static → standalone"
else
  echo "[警告] .next/static 目录不存在"
fi

# 复制公共资源 (图片、favicon 等)
if [ -d "public" ]; then
  mkdir -p "${STANDALONE_DIR}/public"
  cp -r public/* "${STANDALONE_DIR}/public/" 2>/dev/null || true
  echo "[OK] 已复制 public → standalone"
else
  echo "[警告] public 目录不存在"
fi

# 验证关键文件存在
echo "===== 验证 standalone 构建 ====="
if [ -f "${STANDALONE_DIR}/server.js" ]; then
  echo "[OK] server.js 存在"
else
  echo "[错误] server.js 不存在！"
  exit 1
fi

if [ -d "${STANDALONE_DIR}/.next/static" ] && [ "$(ls -A ${STANDALONE_DIR}/.next/static 2>/dev/null)" ]; then
  echo "[OK] 静态资源已复制"
else
  echo "[警告] standalone 静态资源目录为空，可能导致页面空白"
fi

# ============================================
# 步骤4: 安装后端依赖（可选，容错）
# ============================================
echo "===== Installing backend dependencies ====="
if [ -d "${COZE_WORKSPACE_PATH}/backend" ] && [ -f "${COZE_WORKSPACE_PATH}/backend/requirements.txt" ]; then
  if command -v pip &>/dev/null || command -v pip3 &>/dev/null; then
    cd "${COZE_WORKSPACE_PATH}/backend"
    pip install -r requirements.txt -q 2>/dev/null || pip3 install -r requirements.txt -q 2>/dev/null || {
      echo "[警告] Python 依赖安装失败，后端可能不可用"
    }
    mkdir -p data 2>/dev/null || true
    cd "${COZE_WORKSPACE_PATH}"
    echo "[OK] 后端依赖安装完成"
  else
    echo "[跳过] 未检测到 pip，跳过后端依赖安装"
  fi
else
  echo "[跳过] 后端目录不存在，跳过后端依赖安装"
fi

echo "===== Build completed successfully! ====="
