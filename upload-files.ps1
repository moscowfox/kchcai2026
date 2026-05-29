# 简单文件上传脚本

$ServerIP = "49.232.73.65"
$ServerUser = "root"
$DeployDir = "/var/www/html"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  文件上传到服务器" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 确保 dist 文件夹存在
if (-not (Test-Path "dist")) {
    Write-Host "创建 dist 文件夹..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path "dist" -Force | Out-Null
}

# 复制文件到 dist
Write-Host "复制文件到 dist 文件夹..." -ForegroundColor Yellow
Copy-Item "index.html" "dist\" -Force
Copy-Item "styles.css" "dist\" -Force
Copy-Item "script.js" "dist\" -Force

# 验证文件
$files = Get-ChildItem "dist"
Write-Host "`n准备上传的文件：" -ForegroundColor Green
$files | ForEach-Object { 
    Write-Host "  - $($_.Name) ($([math]::Round($_.Length/1KB,2)) KB)" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "开始上传到服务器..." -ForegroundColor Yellow
Write-Host "服务器: ${ServerUser}@${ServerIP}" -ForegroundColor Gray
Write-Host "目标: ${DeployDir}" -ForegroundColor Gray
Write-Host ""
Write-Host "提示: 接下来需要输入服务器 root 用户的密码" -ForegroundColor Yellow
Write-Host ""

# 使用绝对路径上传
$distPath = Join-Path $PWD "dist"
$distPathUnix = $distPath -replace '\\', '/'

# 方法1: 尝试使用相对路径
Write-Host "正在上传文件..." -ForegroundColor Gray
scp -r "$distPath\*" "${ServerUser}@${ServerIP}:${DeployDir}/"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ 文件上传成功！" -ForegroundColor Green
    Write-Host ""
    Write-Host "下一步：" -ForegroundColor Yellow
    Write-Host "1. SSH 连接到服务器: ssh ${ServerUser}@${ServerIP}" -ForegroundColor White
    Write-Host "2. 配置 Nginx（参考 QUICK-DEPLOY.md）" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "✗ 上传失败，错误代码: $LASTEXITCODE" -ForegroundColor Red
    Write-Host ""
    Write-Host "替代方案：" -ForegroundColor Yellow
    Write-Host "1. 使用 WinSCP 或 FileZilla 手动上传" -ForegroundColor Cyan
    Write-Host "2. 或者逐个文件上传：" -ForegroundColor Cyan
    Write-Host "   scp dist\index.html ${ServerUser}@${ServerIP}:${DeployDir}/" -ForegroundColor White
    Write-Host "   scp dist\styles.css ${ServerUser}@${ServerIP}:${DeployDir}/" -ForegroundColor White
    Write-Host "   scp dist\script.js ${ServerUser}@${ServerIP}:${DeployDir}/" -ForegroundColor White
}

