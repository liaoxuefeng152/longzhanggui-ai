#!/usr/bin/env node

/**
 * 龙掌柜智能运营系统 - 生产环境启动入口
 * 由 FaaS 系统调用: node ./scripts/start_server.js
 * 
 * 核心策略：直接启动 start.sh，不依赖 pnpm
 * FaaS 运行时环境可能没有 pnpm 在 PATH 中
 */

const { spawn } = require('child_process');
const path = require('path');

const workspacePath = process.env.COZE_WORKSPACE_PATH || process.cwd();

console.log('[启动] 正在启动龙掌柜智能运营系统，端口: 5000...');

// 直接用 bash 调用 start.sh，绕过 pnpm 依赖
// 不使用 shell: true，避免中间 shell 进程干扰信号转发
const child = spawn('bash', [path.join(workspacePath, 'scripts', 'start.sh')], {
  cwd: workspacePath,
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: process.env.DEPLOY_RUN_PORT || '5000',
    DEPLOY_RUN_PORT: process.env.DEPLOY_RUN_PORT || '5000',
    HOSTNAME: '0.0.0.0',
    NODE_ENV: 'production',
  }
});

child.on('error', (err) => {
  console.error('[错误] 启动失败:', err.message);
  process.exit(1);
});

child.on('exit', (code) => {
  console.log(`[退出] 服务进程退出，代码: ${code}`);
  process.exit(code || 0);
});

// 信号转发：确保主进程收到终止信号时子进程也正确退出
process.on('SIGTERM', () => {
  console.log('[信号] 收到 SIGTERM，正在停止服务...');
  child.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('[信号] 收到 SIGINT，正在停止服务...');
  child.kill('SIGINT');
});
