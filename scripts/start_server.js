#!/usr/bin/env node
/**
 * 龙掌柜进程管理器
 * 启动前端服务
 */

const { spawn } = require('child_process');
const http = require('http');

const PORT = process.env.DEPLOY_RUN_PORT || 5000;
const MAX_RETRIES = 30;
const RETRY_INTERVAL = 2000;

console.log(`[启动] 正在启动前端服务，端口: ${PORT}...`);

function checkServer() {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${PORT}`, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(3000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function waitForServer(retries = MAX_RETRIES) {
  for (let i = 0; i < retries; i++) {
    const ready = await checkServer();
    if (ready) {
      console.log(`[启动] 前端服务已就绪 http://localhost:${PORT}`);
      return true;
    }
    process.stdout.write(`\r[等待] 服务启动中... ${i + 1}/${retries}`);
    await new Promise(r => setTimeout(r, RETRY_INTERVAL));
  }
  console.log('\n[错误] 服务启动超时');
  return false;
}

async function start() {
  // 启动 Next.js 生产服务器
  const server = spawn('pnpm', ['start'], {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: true,
    env: { ...process.env }
  });

  server.on('error', (err) => {
    console.error('[错误] 启动失败:', err.message);
    process.exit(1);
  });

  // 等待服务就绪
  const ready = await waitForServer();
  if (!ready) {
    server.kill();
    process.exit(1);
  }

  // 保持进程运行
  process.on('SIGTERM', () => {
    console.log('[关闭] 正在停止服务...');
    server.kill();
    process.exit(0);
  });
}

start();
