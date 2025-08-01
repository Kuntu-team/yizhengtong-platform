# 部署脚本 - Windows PowerShell版本
# 使用方法: .\deploy.ps1 -ServerIP "your-server-ip" -Username "your-username" -TargetPath "/home/your-username/app"

param(
    [string]$ServerIP = "your-server-ip",
    [string]$Username = "your-username", 
    [string]$TargetPath = "/home/your-username/app"
)

Write-Host "🚀 开始部署 yizhengtong-platform 到 $ServerIP" -ForegroundColor Green

# 1. 构建项目
Write-Host "📦 构建项目..." -ForegroundColor Yellow
npm run build

# 2. 创建部署目录
Write-Host "📁 创建部署目录..." -ForegroundColor Yellow
if (Test-Path "deploy") { Remove-Item -Recurse -Force "deploy" }
New-Item -ItemType Directory -Path "deploy" -Force

# 3. 复制必需文件
Write-Host "📋 复制文件..." -ForegroundColor Yellow
# 复制standalone包到根目录（排除node_modules）
Get-ChildItem -Path ".next\standalone" -Exclude "node_modules" | ForEach-Object {
    if ($_.PSIsContainer) {
        Copy-Item -Path $_.FullName -Destination "deploy\" -Recurse -Force
    } else {
        Copy-Item -Path $_.FullName -Destination "deploy\" -Force
    }
}
# 复制静态资源到正确位置
Copy-Item -Path ".next\static" -Destination "deploy\.next\" -Recurse -Force
# 复制public目录
Copy-Item -Path "public" -Destination "deploy\" -Recurse -Force
# 复制PM2配置文件
Copy-Item -Path "ecosystem.config.js" -Destination "deploy\" -Force
# 复制package.json（用于在服务器上安装依赖）
Copy-Item -Path "package.json" -Destination "deploy\" -Force
# 复制package-lock.json（确保依赖版本一致）
if (Test-Path "package-lock.json") {
    Copy-Item -Path "package-lock.json" -Destination "deploy\" -Force
}

# 复制Prisma文件（确保数据库连接正常）
if (Test-Path "prisma") {
    Copy-Item -Path "prisma" -Destination "deploy\" -Recurse -Force
    Write-Host "✅ 已复制Prisma文件" -ForegroundColor Green
} else {
    Write-Host "⚠️  未找到prisma目录" -ForegroundColor Yellow
}

# 确保静态资源在正确位置（双重保险）
Write-Host "🔧 配置静态资源..." -ForegroundColor Yellow
if (Test-Path "deploy\.next\static") {
    Write-Host "✅ 静态资源已正确配置" -ForegroundColor Green
} else {
    Write-Host "⚠️  静态资源配置可能有问题" -ForegroundColor Yellow
}

# 确保静态资源在正确位置
Write-Host "🔧 配置静态资源..." -ForegroundColor Yellow
if (Test-Path "deploy\.next\static") {
    Write-Host "✅ 静态资源已正确配置" -ForegroundColor Green
} else {
    Write-Host "⚠️  静态资源配置可能有问题" -ForegroundColor Yellow
}

# 4. 创建logs目录
New-Item -ItemType Directory -Path "deploy\logs" -Force

# 5. 复制环境变量文件（如果存在）
if (Test-Path ".env") {
    Copy-Item -Path ".env" -Destination "deploy\" -Force
    Write-Host "✅ 已复制环境变量文件" -ForegroundColor Green
} else {
    Write-Host "⚠️  未找到.env文件，请手动创建" -ForegroundColor Yellow
}

# 6. 显示部署包信息
Write-Host "📊 部署包信息:" -ForegroundColor Cyan
$deploySize = (Get-ChildItem -Path "deploy" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "部署包大小: $([math]::Round($deploySize, 2)) MB" -ForegroundColor Cyan

# 7. 上传到服务器
Write-Host "📤 上传到服务器..." -ForegroundColor Yellow
ssh "${Username}@${ServerIP}" "mkdir -p ${TargetPath}"
scp -r deploy/* "${Username}@${ServerIP}:${TargetPath}/"

# 8. 在服务器上安装依赖并启动应用
Write-Host "🚀 在服务器上安装依赖并启动应用..." -ForegroundColor Yellow
ssh "${Username}@${ServerIP}" "cd ${TargetPath} && npm ci --omit=dev && npx prisma generate && pm2 start ecosystem.config.js"

Write-Host "✅ 部署完成！" -ForegroundColor Green
Write-Host "🌐 访问地址: http://${ServerIP}:3002" -ForegroundColor Cyan
Write-Host "📊 查看状态: ssh ${Username}@${ServerIP} 'pm2 status'" -ForegroundColor Cyan
Write-Host "📝 查看日志: ssh ${Username}@${ServerIP} 'pm2 logs yizhengtong-platform'" -ForegroundColor Cyan 