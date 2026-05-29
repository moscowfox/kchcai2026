#!/bin/bash
# 部署脚本 - 上传文件到轻量应用服务器

SERVER_IP="49.232.73.65"
SERVER_USER="root"  # 请根据实际情况修改用户名
DEPLOY_DIR="/var/www/html"
LOCAL_DIR="./dist"

echo "开始部署到服务器 $SERVER_IP..."

# 使用 scp 上传文件
scp -r $LOCAL_DIR/* $SERVER_USER@$SERVER_IP:$DEPLOY_DIR/

echo "部署完成！"
echo "请确保服务器上的 Nginx 已正确配置。"

