#!/bin/bash
# ===========================================
# 数据库迁移脚本
# ===========================================

set -e

echo "📦 运行数据库迁移..."

# 激活虚拟环境
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# 运行迁移
alembic upgrade head

echo "✅ 数据库迁移完成"
