#!/bin/bash
# 启动localtunnel并保存输出

echo "正在启动localtunnel..."
npx localtunnel --port 5001 > /tmp/lt_output.log 2>&1 &
LT_PID=$!

echo "localtunnel PID: $LT_PID"
echo "等待公网地址生成..."

# 等待10秒让localtunnel生成地址
sleep 10

# 读取输出文件
if [ -f /tmp/lt_output.log ]; then
    echo "=== localtunnel 输出 ==="
    cat /tmp/lt_output.log
    echo "=== 输出结束 ==="
else
    echo "未找到输出文件"
fi
