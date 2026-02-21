# 🚀 阿里云部署指南

本文档提供详细的阿里云部署指南，支持 ECS、ACK、ECI 等多种部署方式。

---

## 📋 部署方式对比

| 部署方式 | 适用场景 | 难度 | 成本 |
|---------|---------|------|------|
| **Docker (ECS)** | 小规模、单实例 | ⭐ 低 | 低 |
| **Docker Compose (ECS)** | 包含 Nginx 的完整部署 | ⭐⭐ 中 | 中 |
| **ACK (容器服务)** | 生产环境、高可用 | ⭐⭐⭐ 高 | 中高 |
| **ECI (容器实例)** | 无服务器、按需付费 | ⭐⭐ 中 | 低 |

---

## 🎯 方式一：Docker 直接部署（推荐入门）

### 前置要求

- 阿里云 ECS 实例（建议：2核4G以上）
- 已安装 Docker
- 开放安全组端口：5000

### 部署步骤

#### 1. 连接到 ECS 服务器

```bash
# 使用 SSH 连接
ssh root@your-ecs-ip

# 或使用阿里云控制台的远程连接
```

#### 2. 安装 Docker

```bash
# 更新软件包
yum update -y

# 安装 Docker
curl -fsSL https://get.docker.com | bash -s docker --mirror Aliyun

# 启动 Docker
systemctl start docker
systemctl enable docker

# 验证安装
docker --version
```

#### 3. 上传项目文件

```bash
# 在本地打包项目
tar -czf afeng-ai-platform.tar.gz \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.git' \
  .

# 使用 scp 上传到服务器
scp afeng-ai-platform.tar.gz root@your-ecs-ip:/root/

# 在服务器上解压
cd /root
tar -xzf afeng-ai-platform.tar.gz
cd afeng-ai-platform
```

#### 4. 构建镜像

```bash
# 构建镜像（会使用阿里云加速）
docker build -t afeng-ai-platform:latest .
```

#### 5. 运行容器

```bash
# 运行容器
docker run -d \
  --name afeng-ai-platform \
  --restart unless-stopped \
  -p 5000:5000 \
  -e NODE_ENV=production \
  -e PORT=5000 \
  afeng-ai-platform:latest

# 查看容器状态
docker ps

# 查看日志
docker logs -f afeng-ai-platform
```

#### 6. 配置安全组

在阿里云控制台：
1. 进入「云服务器 ECS」→「实例」
2. 选择实例 →「安全组」→「配置规则」
3. 添加入方向规则：
   - 端口范围：5000/5000
   - 授权对象：0.0.0.0/0

#### 7. 访问应用

```
http://your-ecs-ip:5000
```

---

## 🐳 方式二：Docker Compose 部署（推荐生产）

### 前置要求

- 已安装 Docker 和 Docker Compose
- 阿里云 ECS 实例
- 域名（可选，用于 HTTPS）

### 部署步骤

#### 1. 安装 Docker Compose

```bash
# 下载 Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# 添加执行权限
chmod +x /usr/local/bin/docker-compose

# 验证安装
docker-compose --version
```

#### 2. 使用部署脚本

```bash
# 给脚本添加执行权限
chmod +x deploy.sh

# 运行部署脚本
./deploy.sh
```

选择 `3` 使用 Docker Compose 启动（包含 Nginx）

#### 3. 配置 Nginx

编辑 `nginx.conf` 配置反向代理：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://app:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 4. 启动服务

```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

---

## ☸️ 方式三：阿里云 ACK（容器服务）部署

### 前置要求

- 已创建 ACK 集群
- 已配置 kubectl
- 阿里云容器镜像服务（ACR）

### 部署步骤

#### 1. 构建并推送镜像到 ACR

```bash
# 登录 ACR
docker login --username=your-username registry.cn-hangzhou.aliyuncs.com

# 标记镜像
docker tag afeng-ai-platform:latest \
  registry.cn-hangzhou.aliyuncs.com/your-namespace/afeng-ai-platform:latest

# 推送镜像
docker push registry.cn-hangzhou.aliyuncs.com/your-namespace/afeng-ai-platform:latest
```

#### 2. 创建 Kubernetes 配置文件

创建 `k8s-deployment.yaml`：

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: afeng-ai-platform
  labels:
    app: afeng-ai-platform
spec:
  replicas: 2
  selector:
    matchLabels:
      app: afeng-ai-platform
  template:
    metadata:
      labels:
        app: afeng-ai-platform
    spec:
      containers:
      - name: afeng-ai-platform
        image: registry.cn-hangzhou.aliyuncs.com/your-namespace/afeng-ai-platform:latest
        ports:
        - containerPort: 5000
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "5000"
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /
            port: 5000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 5000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: afeng-ai-platform-service
spec:
  selector:
    app: afeng-ai-platform
  ports:
  - protocol: TCP
    port: 80
    targetPort: 5000
  type: LoadBalancer
```

#### 3. 部署到 ACK

```bash
# 应用配置
kubectl apply -f k8s-deployment.yaml

# 查看 Pod 状态
kubectl get pods

# 查看 Service 状态
kubectl get services
```

---

## 🌐 方式四：ECI（弹性容器实例）部署

### 前置要求

- 已开通 ECI 服务
- 已配置容器镜像服务

### 部署步骤

#### 1. 创建 ECI 配置文件

创建 `eci-deployment.yaml`：

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: afeng-ai-platform-eci
  labels:
    app: afeng-ai-platform
spec:
  containers:
  - name: afeng-ai-platform
    image: registry.cn-hangzhou.aliyuncs.com/your-namespace/afeng-ai-platform:latest
    ports:
    - containerPort: 5000
    env:
    - name: NODE_ENV
      value: "production"
    - name: PORT
      value: "5000"
    resources:
      requests:
        memory: "1Gi"
        cpu: "1"
```

#### 2. 部署到 ECI

```bash
# 部署到 ECI
kubectl apply -f eci-deployment.yaml

# 查看 Pod 状态
kubectl get pods
```

---

## 🔒 配置 HTTPS（可选）

### 使用 Let's Encrypt 免费证书

```bash
# 安装 Certbot
yum install -y certbot

# 获取证书
certbot certonly --standalone -d your-domain.com

# 证书路径
# /etc/letsencrypt/live/your-domain.com/fullchain.pem
# /etc/letsencrypt/live/your-domain.com/privkey.pem
```

### 配置 Nginx HTTPS

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    location / {
        proxy_pass http://app:5000;
        # ... 其他配置
    }
}
```

---

## 📊 监控与日志

### 查看容器日志

```bash
# 查看实时日志
docker logs -f afeng-ai-platform

# 查看最近 100 行
docker logs --tail 100 afeng-ai-platform
```

### 容器健康检查

```bash
# 查看容器状态
docker ps

# 进入容器
docker exec -it afeng-ai-platform sh
```

---

## 🔄 更新与回滚

### 更新应用

```bash
# 停止容器
docker stop afeng-ai-platform

# 删除容器
docker rm afeng-ai-platform

# 重新构建镜像
docker build -t afeng-ai-platform:latest .

# 启动新容器
docker run -d \
  --name afeng-ai-platform \
  --restart unless-stopped \
  -p 5000:5000 \
  afeng-ai-platform:latest
```

### 使用 Docker Compose 更新

```bash
# 拉取最新代码
git pull

# 重新构建并启动
docker-compose down
docker-compose up -d --build
```

---

## 🚨 常见问题

### 问题 1：容器启动失败

```bash
# 查看容器日志
docker logs afeng-ai-platform

# 检查端口是否被占用
netstat -tuln | grep 5000
```

### 问题 2：无法访问应用

```bash
# 检查容器是否运行
docker ps

# 检查防火墙
firewall-cmd --list-ports

# 检查安全组配置（阿里云控制台）
```

### 问题 3：镜像构建失败

```bash
# 清理 Docker 缓存
docker system prune -a

# 重新构建
docker build --no-cache -t afeng-ai-platform:latest .
```

---

## 💰 成本优化

### ECS 实例选择

| 实例规格 | 适用场景 | 月成本（估算） |
|---------|---------|--------------|
| 1核2G | 测试、小规模 | ¥30-50 |
| 2核4G | 生产推荐 | ¥80-120 |
| 4核8G | 高并发 | ¥200-300 |

### 优化建议

1. **使用预付费实例**：节省 30-50% 成本
2. **选择按量付费**：灵活扩缩容
3. **使用共享带宽**：降低带宽成本
4. **使用云盘 OSS**：存储静态资源

---

## 📞 技术支持

如有问题，请联系：
- 阿里云文档：https://help.aliyun.com/
- Docker 文档：https://docs.docker.com/
- Next.js 部署：https://nextjs.org/docs/deployment

---

**祝部署顺利！🎉**
