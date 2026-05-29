# 完整部署脚本 - Windows PowerShell
# 包含上传文件和配置 Nginx 的完整流程

$ServerIP = "49.232.73.65"
$ServerUser = "root"
$DeployDir = "/var/www/html"
$LocalDir = ".\dist"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  网站部署脚本 - 轻量应用服务器" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查本地文件
Write-Host "[1/3] 检查部署文件..." -ForegroundColor Yellow
if (-not (Test-Path $LocalDir)) {
    Write-Host "错误: 找不到 $LocalDir 文件夹！" -ForegroundColor Red
    exit 1
}

$files = Get-ChildItem $LocalDir
if ($files.Count -eq 0) {
    Write-Host "错误: dist 文件夹为空！" -ForegroundColor Red
    exit 1
}

Write-Host "找到 $($files.Count) 个文件：" -ForegroundColor Green
$files | ForEach-Object { Write-Host "  - $($_.Name)" }

# 上传文件
Write-Host ""
Write-Host "[2/3] 上传文件到服务器..." -ForegroundColor Yellow
Write-Host "服务器: ${ServerUser}@${ServerIP}" -ForegroundColor Gray
Write-Host "目标目录: $DeployDir" -ForegroundColor Gray
Write-Host ""

# 检查 OpenSSH 是否安装
$scpAvailable = Get-Command scp -ErrorAction SilentlyContinue
if (-not $scpAvailable) {
    Write-Host "未检测到 SCP 命令，请选择上传方式：" -ForegroundColor Yellow
    Write-Host "1. 安装 OpenSSH 客户端后重试" -ForegroundColor Cyan
    Write-Host "2. 使用 WinSCP 或 FileZilla 手动上传" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "安装 OpenSSH 客户端命令：" -ForegroundColor Yellow
    Write-Host "  Add-WindowsCapability -Online -Name OpenSSH.Client" -ForegroundColor White
    exit 1
}

# 执行上传
Write-Host "正在上传文件..." -ForegroundColor Gray
Write-Host "提示: 如果提示输入密码，请输入服务器 root 用户的密码" -ForegroundColor Yellow
scp -r "$LocalDir\*" "${ServerUser}@${ServerIP}:${DeployDir}/"

if ($LASTEXITCODE -eq 0) {
    Write-Host "文件上传成功！" -ForegroundColor Green
} else {
    Write-Host "文件上传失败，错误代码: $LASTEXITCODE" -ForegroundColor Red
    Write-Host "请检查：" -ForegroundColor Yellow
    Write-Host "  1. 服务器 IP 和用户名是否正确" -ForegroundColor White
    Write-Host "  2. 服务器密码是否正确" -ForegroundColor White
    Write-Host "  3. 服务器 SSH 服务是否正常运行" -ForegroundColor White
    exit 1
}

# 配置 Nginx
Write-Host ""
Write-Host "[3/3] 配置 Nginx..." -ForegroundColor Yellow
Write-Host "正在连接到服务器进行配置..." -ForegroundColor Gray

# 将 Nginx 配置脚本上传到服务器
if (Test-Path "setup-nginx.sh") {
    $nginxScript = Get-Content "setup-nginx.sh" -Raw
    $tempScript = [System.IO.Path]::GetTempFileName() + ".sh"
    Set-Content -Path $tempScript -Value $nginxScript -Encoding UTF8

    Write-Host "上传 Nginx 配置脚本..." -ForegroundColor Gray
    scp $tempScript "${ServerUser}@${ServerIP}:/tmp/setup-nginx.sh"

    if ($LASTEXITCODE -ne 0) {
        Write-Host "Nginx 配置脚本上传失败" -ForegroundColor Red
        Remove-Item $tempScript -ErrorAction SilentlyContinue
        exit 1
    }

    Write-Host "执行 Nginx 配置..." -ForegroundColor Gray
    ssh "${ServerUser}@${ServerIP}" "chmod +x /tmp/setup-nginx.sh; /tmp/setup-nginx.sh"

    if ($LASTEXITCODE -eq 0) {
        Write-Host "Nginx 配置完成！" -ForegroundColor Green
    } else {
        Write-Host "Nginx 配置失败，请手动执行配置脚本" -ForegroundColor Red
        Write-Host "SSH 连接到服务器后执行：" -ForegroundColor Yellow
        Write-Host "  chmod +x /tmp/setup-nginx.sh" -ForegroundColor White
        Write-Host "  /tmp/setup-nginx.sh" -ForegroundColor White
    }

    Remove-Item $tempScript -ErrorAction SilentlyContinue
} else {
    Write-Host "警告: 未找到 setup-nginx.sh 文件，跳过自动配置" -ForegroundColor Yellow
    Write-Host "请手动配置 Nginx，参考 QUICK-DEPLOY.md 文件" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  部署完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "访问地址：" -ForegroundColor Yellow
Write-Host "  http://49.232.73.65" -ForegroundColor White
Write-Host ('  http://atlantis9.com (如果已配置 DNS)') -ForegroundColor White
Write-Host ""

