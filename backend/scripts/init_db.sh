#!/bin/bash
# ===========================================
# 初始化数据库脚本
# ===========================================

set -e

echo "🔧 初始化数据库..."

# 激活虚拟环境
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# 创建数据库目录
mkdir -p data

# 运行Python初始化脚本
python3 -c "
import asyncio
from app.core.database import init_db
from app.services.init_service import init_system

async def main():
    await init_db()
    await init_system()
    print('✅ 数据库初始化完成')

asyncio.run(main())
"

echo "✅ 初始化完成"
