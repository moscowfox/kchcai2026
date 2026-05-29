# 快速部署指南

## 📋 部署前检查清单

- [x] 部署文件已准备（dist 文件夹）
- [ ] 服务器 SSH 连接正常
- [ ] 服务器已安装 Nginx
- [ ] 服务器防火墙已开放 80 端口

## 🚀 快速部署步骤

### 步骤 1: 上传文件

在 Cursor Terminal 中执行（需要输入服务器密码）：

```powershell
cd d:\Cursor\kchcaiweb
scp -r dist\* root@49.232.73.65:/var/www/html/
```

**或者使用完整部署脚本：**

```powershell
.\deploy-complete.ps1
```

### 步骤 2: 配置 Nginx

SSH 连接到服务器后，执行以下命令：

```bash
# 连接到服务器
ssh root@49.232.73.65

# 创建 Nginx 配置文件
cat > /etc/nginx/conf.d/kchcai.conf << 'EOF'
server {
    listen 80;
    server_name atlantis9.com www.atlantis9.com 49.232.73.65;
    
    root /var/www/html;
    index index.html index.htm;

    access_log /var/log/nginx/kchcai_access.log;
    error_log /var/log/nginx/kchcai_error.log;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
EOF

# 设置文件权限
chown -R www-data:www-data /var/www/html
chmod -R 755 /var/www/html

# 测试配置
nginx -t

# 重启 Nginx
systemctl restart nginx

# 检查状态
systemctl status nginx
```

### 步骤 3: 验证部署

访问以下地址验证：
- http://49.232.73.65
- http://atlantis9.com (如果已配置 DNS)

## 🔧 一键配置脚本

如果上传了 `setup-nginx.sh` 到服务器，可以直接执行：

```bash
chmod +x /tmp/setup-nginx.sh
/tmp/setup-nginx.sh
```

## ❓ 常见问题

### 问题：SCP 连接失败
**解决**：检查服务器 IP、用户名和密码是否正确

### 问题：403 Forbidden
**解决**：执行权限设置命令
```bash
chown -R www-data:www-data /var/www/html
chmod -R 755 /var/www/html
```

### 问题：502 Bad Gateway
**解决**：检查 Nginx 是否运行
```bash
systemctl status nginx
systemctl start nginx
```
