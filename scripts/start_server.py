#!/usr/bin/env python3
"""
龙掌柜进程管理器
同时启动和管理前端、后端服务
"""

import os
import sys
import signal
import subprocess
import time
import httpx
from loguru import logger

# 配置
COZE_WORKSPACE_PATH = os.environ.get('COZE_WORKSPACE_PATH', '/workspace/projects')
FRONTEND_PORT = int(os.environ.get('DEPLOY_RUN_PORT', 5000))
BACKEND_PORT = 8000

# 进程列表
processes = []

def cleanup(signum=None, frame=None):
    """清理所有子进程"""
    logger.info("正在停止所有服务...")
    for proc in processes:
        try:
            proc.terminate()
            proc.wait(timeout=5)
        except:
            try:
                proc.kill()
            except:
                pass
    logger.info("所有服务已停止")
    sys.exit(0)

def check_health(url: str, max_retries: int = 10) -> bool:
    """检查服务健康状态"""
    for i in range(max_retries):
        try:
            resp = httpx.get(url, timeout=2)
            if resp.status_code == 200:
                return True
        except:
            pass
        time.sleep(2)
    return False

def start_backend():
    """启动后端服务"""
    logger.info(f"🔧 启动Python后端服务 (端口: {BACKEND_PORT})...")
    
    backend_dir = os.path.join(COZE_WORKSPACE_PATH, 'backend')
    os.makedirs(os.path.join(backend_dir, 'data'), exist_ok=True)
    
    proc = subprocess.Popen(
        ['uvicorn', 'app.main:app', '--host', '0.0.0.0', '--port', str(BACKEND_PORT)],
        cwd=backend_dir,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )
    processes.append(proc)
    
    # 等待后端启动
    if check_health(f'http://localhost:{BACKEND_PORT}/health'):
        logger.info("✅ 后端服务启动成功")
        return True
    else:
        logger.error("❌ 后端服务启动失败")
        return False

def start_frontend():
    """启动前端服务"""
    logger.info(f"🔧 启动Next.js前端服务 (端口: {FRONTEND_PORT})...")
    
    # 使用standalone模式启动
    server_path = os.path.join(COZE_WORKSPACE_PATH, '.next', 'standalone', 'server.js')
    
    if os.path.exists(server_path):
        proc = subprocess.Popen(
            ['node', server_path],
            cwd=COZE_WORKSPACE_PATH,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            env={**os.environ, 'PORT': str(FRONTEND_PORT)}
        )
    else:
        # 回退到next start
        proc = subprocess.Popen(
            ['npx', 'next', 'start', '--port', str(FRONTEND_PORT)],
            cwd=COZE_WORKSPACE_PATH,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
        )
    
    processes.append(proc)
    
    # 等待前端启动
    if check_health(f'http://localhost:{FRONTEND_PORT}'):
        logger.info("✅ 前端服务启动成功")
        return True
    else:
        logger.error("❌ 前端服务启动失败")
        return False

def main():
    """主函数"""
    logger.info("=" * 50)
    logger.info("🚀 龙掌柜智能运营系统启动中...")
    logger.info(f"   工作目录: {COZE_WORKSPACE_PATH}")
    logger.info(f"   前端端口: {FRONTEND_PORT}")
    logger.info(f"   后端端口: {BACKEND_PORT}")
    logger.info("=" * 50)
    
    # 注册信号处理
    signal.signal(signal.SIGINT, cleanup)
    signal.signal(signal.SIGTERM, cleanup)
    
    # 启动后端
    if not start_backend():
        logger.error("后端启动失败，但继续启动前端...")
    
    # 启动前端
    if not start_frontend():
        logger.error("前端启动失败!")
        cleanup()
        sys.exit(1)
    
    logger.info("=" * 50)
    logger.info("✅ 所有服务启动完成!")
    logger.info(f"   前端访问: http://localhost:{FRONTEND_PORT}")
    logger.info(f"   后端API: http://localhost:{BACKEND_PORT}/docs")
    logger.info("=" * 50)
    
    # 保持运行，监控进程
    while True:
        for i, proc in enumerate(processes):
            if proc.poll() is not None:
                logger.warning(f"进程 {i} 已退出，退出码: {proc.returncode}")
        time.sleep(10)

if __name__ == '__main__':
    main()
