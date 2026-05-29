# 域名配置指南 - atlantis9.com

## 📍 当前部署情况说明

### 通过 MCP 部署的网站位置

**重要说明**：通过 EdgeOne Pages MCP 部署的网站**不在**您自己的轻量应用服务器上，而是部署在**腾讯云 EdgeOne Pages 服务**上。

- **MCP 部署地址**：`mcp.edgeone.site/share/...`（这是腾讯云的托管服务）
- **您的服务器**：`49.232.73.65`（轻量应用服务器，目前还没有部署网站）

### 两种部署方案对比

| 方案 | 优点 | 缺点 |
|------|------|------|
| **方案一：继续使用 EdgeOne Pages** | 简单快速，自动 HTTPS | 需要配置域名绑定，可能有限制 |
| **方案二：部署到自己的服务器** | 完全控制，使用已有资源 | 需要手动配置 Nginx 和 SSL |

## 🎯 推荐方案：部署到自己的服务器

既然您已经购买了轻量应用服务器，建议将网站部署到自己的服务器上，这样可以：
- 充分利用已有资源
- 完全控制网站
- 更灵活的配置

---

## 方案一：在 EdgeOne Pages 配置域名（如果继续使用 MCP 部署）

### 步骤 1: 登录腾讯云控制台

1. 访问：https://console.cloud.tencent.com/
2. 进入 **EdgeOne** → **Pages** 服务

### 步骤 2: 找到您的部署项目

1. 在 Pages 项目列表中找到通过 MCP 部署的项目
2. 点击进入项目详情

### 步骤 3: 配置自定义域名

1. 进入 **域名配置** 或 **自定义域名** 页面
2. 点击 **添加域名**
3. 输入域名：`atlantis9.com` 和 `www.atlantis9.com`
4. 系统会提供 **CNAME 记录值**

### 步骤 4: 配置 DNS 解析

在您的域名服务商（如腾讯云 DNS、阿里云等）添加 CNAME 记录：

```
类型: CNAME
主机记录: @
记录值: [EdgeOne Pages 提供的 CNAME 值]
TTL: 600
```

```
类型: CNAME
主机记录: www
记录值: [EdgeOne Pages 提供的 CNAME 值]
TTL: 600
```

### 步骤 5: 等待生效

- DNS 解析通常需要几分钟到几小时
- SSL 证书会自动申请和配置

---

## 方案二：部署到自己的服务器（推荐）⭐

### 步骤 1: 部署网站到服务器

使用我们准备好的部署脚本：

```powershell
cd d:\Cursor\kchcaiweb
.\deploy-complete.ps1
```

或者手动上传：

```powershell
scp -r dist\* root@49.232.73.65:/var/www/html/
```

### 步骤 2: 配置 Nginx

SSH 连接到服务器：

```bash
ssh root@49.232.73.65
```

执行以下命令配置 Nginx：

```bash
# 创建 Nginx 配置文件
cat > /etc/nginx/conf.d/atlantis9.conf << 'EOF'
server {
    listen 80;
    server_name atlantis9.com www.atlantis9.com;
    
    root /var/www/html;
    index index.html index.htm;

    access_log /var/log/nginx/atlantis9_access.log;
    error_log /var/log/nginx/atlantis9_error.log;

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
```

### 步骤 3: 配置 DNS 解析

在您的域名服务商处添加 **A 记录**：

```
类型: A
主机记录: @
记录值: 49.232.73.65
TTL: 600
```

```
类型: A
主机记录: www
记录值: 49.232.73.65
TTL: 600
```

### 步骤 4: 配置 SSL 证书（HTTPS）

使用 Let's Encrypt 免费证书：

```bash
# 安装 Certbot
apt update
apt install certbot python3-certbot-nginx -y

# 申请证书
certbot --nginx -d atlantis9.com -d www.atlantis9.com

# 证书会自动配置，并设置自动续期
```

### 步骤 5: 验证部署

等待 DNS 解析生效后（通常几分钟到几小时），访问：
- http://atlantis9.com
- https://atlantis9.com（配置 SSL 后）
- http://www.atlantis9.com

---

## 🔍 检查 DNS 解析

在配置 DNS 后，可以使用以下命令检查：

```bash
# Windows PowerShell
nslookup atlantis9.com

# 或使用在线工具
# https://dnschecker.org/
```

---

## ❓ 常见问题

### Q1: 我应该选择哪个方案？

**推荐方案二**（部署到自己的服务器），因为：
- 您已经购买了服务器资源
- 完全控制，更灵活
- 可以配置更多功能

### Q2: DNS 解析需要多长时间？

通常 5-30 分钟，最长可能需要 24-48 小时。

### Q3: 如何知道 DNS 是否生效？

使用命令检查：
```bash
nslookup atlantis9.com
```

如果返回 `49.232.73.65`，说明解析已生效。

### Q4: 配置 SSL 证书是必须的吗？

不是必须的，但**强烈推荐**：
- 提高网站安全性
- 提升 SEO 排名
- 现代浏览器要求 HTTPS

---

## 📝 快速检查清单

- [ ] 网站已部署到服务器（方案二）或 EdgeOne Pages（方案一）
- [ ] Nginx 已配置并运行（方案二）
- [ ] DNS 解析已配置（A 记录或 CNAME 记录）
- [ ] 防火墙已开放 80 和 443 端口（方案二）
- [ ] SSL 证书已配置（可选但推荐）

---

## 🚀 下一步

1. **选择方案**：推荐使用方案二（自己的服务器）
2. **执行部署**：使用 `deploy-complete.ps1` 脚本
3. **配置 DNS**：在域名服务商添加 A 记录
4. **配置 SSL**：使用 Let's Encrypt 免费证书

需要我帮您执行哪个步骤？
