#!/bin/bash

# ==========================================
# 阿峰跨境AI中台 - Docker 部署脚本
# ==========================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置
IMAGE_NAME="afeng-ai-platform"
CONTAINER_NAME="afeng-ai-platform"

# 打印带颜色的消息
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查 Docker 是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker 未安装，请先安装 Docker"
        exit 1
    fi
    print_info "Docker 已安装: $(docker --version)"
}

# 检查 Docker Compose 是否安装
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose 未安装，请先安装 Docker Compose"
        exit 1
    fi
    print_info "Docker Compose 已安装"
}

# 构建镜像
build_image() {
    print_info "开始构建 Docker 镜像..."
    docker build -t $IMAGE_NAME:latest .
    print_info "镜像构建完成: $IMAGE_NAME:latest"
}

# 运行容器
run_container() {
    print_info "启动容器..."

    # 停止并删除旧容器
    if [ "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
        print_warn "容器已存在，正在停止..."
        docker stop $CONTAINER_NAME
        docker rm $CONTAINER_NAME
    fi

    # 启动新容器
    docker run -d \
        --name $CONTAINER_NAME \
        --restart unless-stopped \
        -p 5000:5000 \
        -e NODE_ENV=production \
        -e PORT=5000 \
        $IMAGE_NAME:latest

    print_info "容器启动成功！"
    print_info "访问地址: http://localhost:5000"
}

# 使用 Docker Compose 启动
run_with_compose() {
    print_info "使用 Docker Compose 启动服务..."

    if command -v docker-compose &> /dev/null; then
        docker-compose down
        docker-compose up -d
    else
        docker compose down
        docker compose up -d
    fi

    print_info "服务启动成功！"
    print_info "应用地址: http://localhost:5000"
    print_info "Nginx 地址: http://localhost:80"
}

# 查看日志
view_logs() {
    print_info "查看容器日志..."
    docker logs -f $CONTAINER_NAME
}

# 停止服务
stop_service() {
    print_info "停止服务..."

    if [ "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
        docker stop $CONTAINER_NAME
        docker rm $CONTAINER_NAME
        print_info "服务已停止"
    else
        print_warn "容器未运行"
    fi
}

# 清理镜像
clean_images() {
    print_info "清理旧镜像..."
    docker rmi $IMAGE_NAME:latest 2>/dev/null || true
    print_info "清理完成"
}

# 主菜单
show_menu() {
    echo ""
    echo "=========================================="
    echo "  阿峰跨境AI中台 - Docker 部署工具"
    echo "=========================================="
    echo ""
    echo "1. 构建镜像"
    echo "2. 运行容器（仅应用）"
    echo "3. 使用 Docker Compose 启动（含 Nginx）"
    echo "4. 查看日志"
    echo "5. 停止服务"
    echo "6. 清理镜像"
    echo "7. 退出"
    echo ""
    read -p "请选择操作 [1-7]: " choice
}

# 主流程
main() {
    check_docker
    check_docker_compose

    while true; do
        show_menu
        case $choice in
            1)
                build_image
                ;;
            2)
                run_container
                ;;
            3)
                run_with_compose
                ;;
            4)
                view_logs
                ;;
            5)
                stop_service
                ;;
            6)
                clean_images
                ;;
            7)
                print_info "退出"
                exit 0
                ;;
            *)
                print_error "无效选择"
                ;;
        esac
    done
}

# 执行主流程
main
