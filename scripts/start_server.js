#!/usr/bin/env node

/**
 * 龙掌柜智能运营系统 - 生产环境启动入口
 * 由 FaaS 系统调用: node ./scripts/start_server.js
 * 
 * 核心策略：直接启动 start.sh，不做额外的端口检测
 * FaaS 系统会自行检测 5000 端口是否就绪
 */

const { spawn } = require('child_process');
const path = require('path');

const workspacePath = process.env.COZE_WORKSPACE_PATH || process.cwd();

console.log('[启动] 正在启动前端服务，端口: 5000...');

// 直接启动 start.sh，FaaS 系统会自动检测端口就绪
const child = spawn('pnpm', ['start'], {
  cwd: workspacePath,
  shell: true,
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: '5000',
    DEPLOY_RUN_PORT: '5000',
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
