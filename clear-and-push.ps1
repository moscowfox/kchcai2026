# Clear GitHub credentials and push again
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Clear credentials and push to GitHub" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location "d:\Cursor\kchcaiweb"

# Check if there are commits
Write-Host "[1/4] Checking commit status..." -ForegroundColor Yellow
$commitCheck = git log --oneline -1 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: No commits found!" -ForegroundColor Red
    Write-Host "Please commit first:" -ForegroundColor Yellow
    Write-Host "  git add index.html styles.css script.js README.md .gitignore" -ForegroundColor White
    Write-Host "  git commit -m `"Initial commit`"" -ForegroundColor White
    exit 1
} else {
    Write-Host "Found commit: $commitCheck" -ForegroundColor Green
}

# Clear Windows Credential Manager GitHub credentials
Write-Host ""
Write-Host "[2/4] Clearing cached GitHub credentials..." -ForegroundColor Yellow
Write-Host "Clearing Windows Credential Manager..." -ForegroundColor Gray

# Use cmdkey to clear credentials
$gitHubCreds = cmdkey /list | Select-String "github.com"
if ($gitHubCreds) {
    Write-Host "Found cached GitHub credentials, clearing..." -ForegroundColor Gray
    cmdkey /list | Select-String "git:" | ForEach-Object {
        $line = $_.Line
        if ($line -match "Target:\s+(.+)") {
            $target = $matches[1]
            Write-Host "  Clearing: $target" -ForegroundColor Gray
            cmdkey /delete:$target 2>$null | Out-Null
        }
    }
    Write-Host "Credentials cleared" -ForegroundColor Green
} else {
    Write-Host "No cached credentials found" -ForegroundColor Green
}

# Clear Git credential cache
Write-Host ""
Write-Host "[3/4] Clearing Git credential cache..." -ForegroundColor Yellow
git credential reject "protocol=https`nhost=github.com" 2>$null
Write-Host "Git credential cache cleared" -ForegroundColor Green

# Push again
Write-Host ""
Write-Host "[4/4] Pushing to GitHub..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Important" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "When prompted, enter:" -ForegroundColor White
Write-Host "  Username: moscowfox" -ForegroundColor Cyan
Write-Host "  Password: [Your GitHub Personal Access Token]" -ForegroundColor Cyan
Write-Host ""
Write-Host "If you don't have a Token, visit:" -ForegroundColor Yellow
Write-Host "  https://github.com/settings/tokens" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host ""
Write-Host "Pushing..." -ForegroundColor Gray
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  Push successful!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Visit: https://github.com/moscowfox/kchcaiwebsite" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  Push failed" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Possible reasons:" -ForegroundColor Yellow
    Write-Host "1. Incorrect Token" -ForegroundColor White
    Write-Host "2. Token lacks repo permission" -ForegroundColor White
    Write-Host "3. Network connection issue" -ForegroundColor White
    Write-Host ""
    Write-Host "Please check and try again" -ForegroundColor Yellow
}
