# GitHub 推送脚本
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  开始推送代码到 GitHub" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 切换到项目目录
Set-Location "d:\Cursor\kchcaiweb"
Write-Host "当前目录: $(Get-Location)" -ForegroundColor Green

# 检查是否已经是 Git 仓库
if (Test-Path .git) {
    Write-Host "✓ Git 仓库已存在" -ForegroundColor Green
} else {
    Write-Host "[1/5] 初始化 Git 仓库..." -ForegroundColor Yellow
    git init
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Git 仓库初始化成功" -ForegroundColor Green
    } else {
        Write-Host "✗ Git 仓库初始化失败" -ForegroundColor Red
        exit 1
    }
}

# 添加文件
Write-Host ""
Write-Host "[2/5] 添加文件到暂存区..." -ForegroundColor Yellow
git add index.html styles.css script.js README.md .gitignore
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ 文件添加成功" -ForegroundColor Green
} else {
    Write-Host "✗ 文件添加失败" -ForegroundColor Red
    exit 1
}

# 提交
Write-Host ""
Write-Host "[3/5] 提交到本地仓库..." -ForegroundColor Yellow
$commitOutput = git commit -m "Initial commit: 北京康城合创官方网站" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ 提交成功" -ForegroundColor Green
    Write-Host $commitOutput -ForegroundColor Gray
} else {
    # 检查是否已经有提交
    $hasCommits = git log --oneline -1 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ 已有提交记录，跳过提交步骤" -ForegroundColor Green
    } else {
        Write-Host "✗ 提交失败，错误信息：" -ForegroundColor Red
        Write-Host $commitOutput -ForegroundColor Red
        Write-Host "请检查文件是否已正确添加" -ForegroundColor Yellow
        exit 1
    }
}

# 检查远程仓库
Write-Host ""
Write-Host "[4/5] 配置远程仓库..." -ForegroundColor Yellow
$remoteExists = git remote get-url origin 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ 远程仓库已配置: $remoteExists" -ForegroundColor Green
} else {
    Write-Host "添加远程仓库..." -ForegroundColor Gray
    git remote add origin https://github.com/moscowfox/kchcaiwebsite.git
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ 远程仓库添加成功" -ForegroundColor Green
    } else {
        Write-Host "✗ 远程仓库添加失败" -ForegroundColor Red
        exit 1
    }
}

# 设置主分支
Write-Host ""
Write-Host "[4.5/5] 设置主分支..." -ForegroundColor Yellow
git branch -M main 2>$null | Out-Null

# 验证是否有提交
Write-Host ""
Write-Host "验证提交状态..." -ForegroundColor Gray
$commitCheck = git log --oneline -1 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ 错误：没有找到任何提交！" -ForegroundColor Red
    Write-Host "请确保文件已添加并提交" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "执行以下命令：" -ForegroundColor Cyan
    Write-Host "  git add index.html styles.css script.js README.md .gitignore" -ForegroundColor White
    Write-Host "  git commit -m 'Initial commit: 北京康城合创官方网站'" -ForegroundColor White
    exit 1
} else {
    Write-Host "✓ 找到提交: $commitCheck" -ForegroundColor Green
}

# 推送
Write-Host ""
Write-Host "[5/5] 推送到 GitHub..." -ForegroundColor Yellow
Write-Host "提示: 如果提示输入用户名和密码，请使用 GitHub Personal Access Token 作为密码" -ForegroundColor Cyan
Write-Host ""
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  ✓ 推送成功！" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "访问地址: https://github.com/moscowfox/kchcaiwebsite" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  推送需要身份验证" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "请执行以下步骤：" -ForegroundColor Yellow
    Write-Host "1. 访问 https://github.com/settings/tokens" -ForegroundColor White
    Write-Host "2. 生成新的 Personal Access Token (classic)" -ForegroundColor White
    Write-Host "3. 勾选 'repo' 权限" -ForegroundColor White
    Write-Host "4. 再次运行此脚本，在密码提示处输入 Token" -ForegroundColor White
    Write-Host ""
}

