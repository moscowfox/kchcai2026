# 文件上传指南

## 问题：dist 文件夹不存在

如果遇到 `No such file or directory` 错误，说明 `dist` 文件夹不存在。

## 解决方案

### 方法一：使用 PowerShell 创建并上传

在 Cursor Terminal 中执行：

```powershell
cd d:\Cursor\kchcaiweb

# 1. 创建 dist 文件夹并复制文件
New-Item -ItemType Directory -Path dist -Force | Out-Null
Copy-Item index.html dist\
Copy-Item styles.css dist\
Copy-Item script.js dist\

# 2. 验证文件
Get-ChildItem dist

# 3. 上传文件（需要输入服务器密码）
scp -r dist\* root@49.232.73.65:/var/www/html/
```

### 方法二：使用 WinSCP 或 FileZilla（图形界面，推荐）

如果 SCP 命令有问题，可以使用图形工具：

#### WinSCP 设置：
- **主机名**: `49.232.73.65`
- **端口**: `22`
- **用户名**: `root`
- **密码**: 您的服务器密码
- **协议**: SFTP

#### 上传步骤：
1. 连接服务器
2. 在本地找到 `d:\Cursor\kchcaiweb` 目录
3. 创建 `dist` 文件夹（如果不存在）
4. 将以下文件复制到 `dist` 文件夹：
   - `index.html`
   - `styles.css`
   - `script.js`
5. 将 `dist` 文件夹中的所有文件拖拽到服务器的 `/var/www/html/` 目录

### 方法三：直接上传文件（不使用 dist 文件夹）

如果 dist 文件夹有问题，可以直接上传文件：

```powershell
cd d:\Cursor\kchcaiweb

# 直接上传三个文件
scp index.html root@49.232.73.65:/var/www/html/
scp styles.css root@49.232.73.65:/var/www/html/
scp script.js root@49.232.73.65:/var/www/html/
```

## 验证上传

上传完成后，SSH 连接到服务器验证：

```bash
ssh root@49.232.73.65
ls -la /var/www/html/
```

应该能看到：
- `index.html`
- `styles.css`
- `script.js`

## 下一步：配置 Nginx

文件上传成功后，参考 `QUICK-DEPLOY.md` 配置 Nginx。
