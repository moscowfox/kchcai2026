# PowerShell 部署脚本
# 上传文件到轻量应用服务器

$ServerIP = "49.232.73.65"
$ServerUser = "root"  # 请根据实际情况修改
$DeployDir = "/var/www/html"
$LocalDir = ".\dist"

Write-Host "开始部署到服务器 $ServerIP..." -ForegroundColor Green

# 检查本地文件是否存在
if (-not (Test-Path $LocalDir)) {
    Write-Host "错误: 找不到 $LocalDir 文件夹！" -ForegroundColor Red
    exit 1
}

# 使用 SCP 上传（需要安装 OpenSSH 客户端）
Write-Host "正在上传文件..." -ForegroundColor Yellow

# 方法1: 使用 scp（如果已安装 OpenSSH）
try {
    scp -r "$LocalDir\*" "${ServerUser}@${ServerIP}:${DeployDir}/"
    Write-Host "部署完成！" -ForegroundColor Green
} catch {
    Write-Host "SCP 上传失败，请使用以下方法之一：" -ForegroundColor Yellow
    Write-Host "1. 使用 WinSCP 或 FileZilla 手动上传" -ForegroundColor Cyan
    Write-Host "2. 使用 PowerShell 的 PSSession" -ForegroundColor Cyan
    Write-Host "3. 安装 OpenSSH 客户端: Add-WindowsCapability -Online -Name OpenSSH.Client" -ForegroundColor Cyan
}

