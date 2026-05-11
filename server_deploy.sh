#!/bin/bash

# ==========================================
# 阿里云 ECS 服务器部署脚本
# ==========================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
print_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

APP_DIR="/root/longzhanggui"
PROJECT_NAME="龙掌柜智能运营系统"

# 检查 Docker
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker 未安装，正在安装..."
        curl -fsSL https://get.docker.com | sh
        systemctl start docker
        systemctl enable docker
    fi
    print_info "Docker 版本: $(docker --version)"
}

check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        print_info "安装 Docker Compose..."
        curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
    fi
    print_info "Docker Compose 版本: $(docker-compose --version)"
}

# 停止旧服务
stop_old() {
    print_info "停止旧容器..."
    cd $APP_DIR
    docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
}

# 启动服务
start_service() {
    print_info "构建并启动服务..."
    cd $APP_DIR
    
    # 构建镜像
    docker-compose -f docker-compose.prod.yml build --no-cache
    
    # 启动服务
    docker-compose -f docker-compose.prod.yml up -d
    
    print_info "服务启动成功！"
}

# 查看状态
status() {
    cd $APP_DIR
    docker-compose -f docker-compose.prod.yml ps
}

# 查看日志
logs() {
    cd $APP_DIR
    docker-compose -f docker-compose.prod.yml logs -f
}

# 主菜单
show_menu() {
    echo ""
    echo "=========================================="
    echo "  $PROJECT_NAME - 部署管理"
    echo "=========================================="
    echo ""
    echo "1. 一键部署（停止旧服务并启动）"
    echo "2. 仅查看状态"
    echo "3. 查看日志"
    echo "4. 退出"
    echo ""
    read -p "请选择操作 [1-4]: " choice
}

main() {
    check_docker
    check_docker_compose
    
    if [ ! -d "$APP_DIR" ]; then
        print_error "项目目录不存在: $APP_DIR"
        print_info "请先解压上传的 deploy.tar.gz"
        mkdir -p $APP_DIR
        exit 1
    fi
    
    while true; do
        show_menu
        case $choice in
            1)
                stop_old
                start_service
                ;;
            2)
                status
                ;;
            3)
                logs
                ;;
            4)
                print_info "退出"
                exit 0
                ;;
            *)
                print_error "无效选择"
                ;;
        esac
    done
}

main
