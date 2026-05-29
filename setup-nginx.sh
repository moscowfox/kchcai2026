#!/bin/bash
# Nginx 配置脚本 - 在服务器上执行

echo "开始配置 Nginx..."

# 1. 备份现有配置
if [ -f /etc/nginx/sites-available/default ]; then
    cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup.$(date +%Y%m%d)
    echo "已备份现有配置"
fi

# 2. 创建新的 Nginx 配置
cat > /etc/nginx/sites-available/kchcai << 'EOF'
server {
    listen 80;
    server_name atlantis9.com www.atlantis9.com 49.232.73.65;
    
    root /var/www/html;
    index index.html index.htm;

    # 日志配置
    access_log /var/log/nginx/kchcai_access.log;
    error_log /var/log/nginx/kchcai_error.log;

    # 主配置
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
EOF

# 3. 创建符号链接（如果使用 sites-available/sites-enabled 结构）
if [ -d /etc/nginx/sites-enabled ]; then
    ln -sf /etc/nginx/sites-available/kchcai /etc/nginx/sites-enabled/kchcai
    # 禁用默认站点
    rm -f /etc/nginx/sites-enabled/default
fi

# 4. 设置文件权限
chown -R www-data:www-data /var/www/html
chmod -R 755 /var/www/html

# 5. 测试配置
echo "测试 Nginx 配置..."
nginx -t

if [ $? -eq 0 ]; then
    echo "配置测试通过！"
    # 6. 重启 Nginx
    systemctl restart nginx
    systemctl enable nginx
    echo "Nginx 已重启并设置为开机自启"
    echo "配置完成！"
else
    echo "配置测试失败，请检查错误信息"
    exit 1
fi

