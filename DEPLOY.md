# 部署指南 - 轻量应用服务器

## 服务器信息
- **IP 地址**: 49.232.73.65
- **部署目录**: /var/www/html
- **Web 服务器**: Nginx

## 部署步骤

### 1. 准备部署文件

部署文件已准备好，位于 `dist/` 文件夹：
- `index.html` - 主页面
- `styles.css` - 样式文件
- `script.js` - JavaScript 文件

### 2. 上传文件到服务器

#### 方法一：使用 SCP（推荐）

```bash
# 在项目根目录执行
scp -r dist/* root@49.232.73.65:/var/www/html/
```

#### 方法二：使用 SFTP 工具

使用 FileZilla、WinSCP 等工具：
- **主机**: 49.232.73.65
- **协议**: SFTP
- **端口**: 22
- **用户名**: root（或您的用户名）
- **密码**: 您的服务器密码
- **远程目录**: /var/www/html

上传 `dist/` 文件夹中的所有文件到服务器的 `/var/www/html/` 目录。

#### 方法三：使用 PowerShell（Windows）

```powershell
# 使用 PSCP（需要先安装 PuTTY）
pscp -r dist\* root@49.232.73.65:/var/www/html/
```

### 3. 配置 Nginx

#### 3.1 连接到服务器

```bash
ssh root@49.232.73.65
```

#### 3.2 检查 Nginx 是否安装

```bash
nginx -v
```

如果没有安装，执行：
```bash
# Ubuntu/Debian
apt update && apt install nginx -y

# CentOS/RHEL
yum install nginx -y
```

#### 3.3 配置 Nginx

编辑配置文件：
```bash
nano /etc/nginx/sites-available/default
```

或者创建新配置：
```bash
nano /etc/nginx/conf.d/kchcai.conf
```

参考项目中的 `nginx.conf.example` 文件内容进行配置。

#### 3.4 测试配置

```bash
nginx -t
```

#### 3.5 重启 Nginx

```bash
systemctl restart nginx
# 或
service nginx restart
```

#### 3.6 设置 Nginx 开机自启

```bash
systemctl enable nginx
```

### 4. 设置文件权限

```bash
# 设置目录权限
chown -R www-data:www-data /var/www/html
chmod -R 755 /var/www/html
```

### 5. 配置防火墙

如果服务器启用了防火墙，需要开放 80 和 443 端口：

```bash
# UFW (Ubuntu)
ufw allow 80/tcp
ufw allow 443/tcp

# firewalld (CentOS)
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --reload
```

### 6. 配置域名（可选）

如果需要使用域名访问：

1. **配置 DNS 解析**
   - 在域名服务商处添加 A 记录
   - 主机记录：`@` 和 `www`
   - 记录类型：`A`
   - 记录值：`49.232.73.65`

2. **更新 Nginx 配置**
   - 修改 `server_name` 为您的域名
   - 重启 Nginx

3. **配置 SSL 证书（推荐）**
   - 使用 Let's Encrypt 免费证书：
   ```bash
   apt install certbot python3-certbot-nginx -y
   certbot --nginx -d atlantis9.com -d www.atlantis9.com
   ```

## 验证部署

1. 访问 `http://49.232.73.65` 查看网站
2. 检查浏览器控制台是否有错误
3. 测试所有页面功能

## 常见问题

### 问题 1: 403 Forbidden
**解决方案**:
```bash
chmod -R 755 /var/www/html
chown -R www-data:www-data /var/www/html
```

### 问题 2: 502 Bad Gateway
**解决方案**: 检查 Nginx 是否运行
```bash
systemctl status nginx
systemctl start nginx
```

### 问题 3: 样式或脚本未加载
**解决方案**: 检查文件路径和权限
```bash
ls -la /var/www/html
```

## 更新部署

当需要更新网站时，只需重新上传文件：

```bash
scp -r dist/* root@49.232.73.65:/var/www/html/
```

## 备份

建议定期备份网站文件：

```bash
# 在服务器上执行
tar -czf /root/website_backup_$(date +%Y%m%d).tar.gz /var/www/html
```

