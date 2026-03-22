# ============================================
# Stage 1: 依赖安装
# ============================================
FROM node:20-alpine AS deps
WORKDIR /app

# 安装pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 复制依赖配置
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# ============================================
# Stage 2: 构建
# ============================================
FROM node:20-alpine AS builder
WORKDIR /app

# 安装pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 复制依赖
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 设置环境变量
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# 构建
RUN pnpm run build

# ============================================
# Stage 3: 运行
# ============================================
FROM node:20-alpine AS runner
WORKDIR /app

# 设置环境变量
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 创建非root用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制构建产物
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 创建数据目录
RUN mkdir -p /app/data/db /app/data/uploads
RUN chown -R nextjs:nodejs /app/data

# 切换用户
USER nextjs

# 暴露端口
EXPOSE 5000

# 设置端口
ENV PORT=5000
ENV HOSTNAME="0.0.0.0"

# 启动命令
CMD ["node", "server.js"]
