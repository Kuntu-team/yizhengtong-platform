# 易政通平台部署包打包脚本 (PowerShell版本)

# 设置错误处理
$ErrorActionPreference = "Stop"

# 颜色定义
$Green = "Green"
$Yellow = "Yellow"
$Red = "Red"

# 日志函数
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Green
}

function Write-Warn {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Red
}

# 获取当前目录
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectName = "yizhengtong-platform"
$PackageName = "${ProjectName}-deployment-$(Get-Date -Format 'yyyyMMdd_HHmmss')"
$PackageDir = Join-Path $ScriptDir $PackageName

Write-Info "开始打包易政通平台部署包..."

# 创建打包目录
New-Item -ItemType Directory -Path $PackageDir -Force | Out-Null

# 复制核心应用文件
Write-Info "复制应用文件..."
$AppDirs = @("app", "components", "hooks", "lib", "prisma", "public", "styles")
foreach ($dir in $AppDirs) {
    if (Test-Path $dir) {
        Copy-Item -Path $dir -Destination $PackageDir -Recurse -Force
    }
}

# 复制配置文件
Write-Info "复制配置文件..."
$ConfigFiles = @(
    "package.json", "package-lock.json", "pnpm-lock.yaml", 
    "next.config.mjs", "tailwind.config.ts", "tsconfig.json", 
    "postcss.config.mjs", "components.json"
)
foreach ($file in $ConfigFiles) {
    if (Test-Path $file) {
        Copy-Item -Path $file -Destination $PackageDir -Force
    }
}

# 复制部署相关文件
Write-Info "复制部署文件..."
$DeployFiles = @(
    "Dockerfile", "docker-compose.yml", "nginx.conf", 
    "init-db.sql", "deploy.sh", ".dockerignore", "README-DEPLOY.md"
)
foreach ($file in $DeployFiles) {
    if (Test-Path $file) {
        Copy-Item -Path $file -Destination $PackageDir -Force
    }
}

# 创建必要的目录
Write-Info "创建必要目录..."
$Dirs = @("logs", "ssl", "data/postgres", "backups")
foreach ($dir in $Dirs) {
    $FullPath = Join-Path $PackageDir $dir
    New-Item -ItemType Directory -Path $FullPath -Force | Out-Null
}

# 创建环境变量示例文件
Write-Info "创建环境变量示例文件..."
$EnvExample = @"
# 数据库配置
DATABASE_URL=postgresql://yizhengtong_user:yizhengtong_password@postgres:5432/yizhengtong

# 应用配置
NODE_ENV=production
PORT=3000

# 时区设置
TZ=Asia/Shanghai
"@
$EnvExample | Out-File -FilePath (Join-Path $PackageDir ".env.example") -Encoding UTF8

# 创建快速启动脚本
Write-Info "创建快速启动脚本..."
$StartScript = @"
#!/bin/bash

# 快速启动脚本
echo "启动易政通平台..."

# 检查Docker是否运行
if ! docker info > /dev/null 2>&1; then
    echo "错误: Docker未运行，请先启动Docker服务"
    exit 1
fi

# 启动服务
docker-compose up -d

echo "服务启动完成！"
echo "访问地址: http://`$(hostname -I | awk '{print `$1}'):80"
echo "查看状态: docker-compose ps"
echo "查看日志: docker-compose logs -f"
"@
$StartScript | Out-File -FilePath (Join-Path $PackageDir "start.sh") -Encoding UTF8

# 创建停止脚本
Write-Info "创建停止脚本..."
$StopScript = @"
#!/bin/bash

# 停止服务脚本
echo "停止易政通平台..."

docker-compose down

echo "服务已停止"
"@
$StopScript | Out-File -FilePath (Join-Path $PackageDir "stop.sh") -Encoding UTF8

# 创建更新脚本
Write-Info "创建更新脚本..."
$UpdateScript = @"
#!/bin/bash

# 更新服务脚本
echo "更新易政通平台..."

# 停止服务
docker-compose down

# 重新构建镜像
docker-compose build --no-cache

# 启动服务
docker-compose up -d

# 运行数据库迁移
docker-compose exec app npx prisma migrate deploy

echo "更新完成！"
"@
$UpdateScript | Out-File -FilePath (Join-Path $PackageDir "update.sh") -Encoding UTF8

# 创建健康检查脚本
Write-Info "创建健康检查脚本..."
$HealthScript = @"
#!/bin/bash

# 健康检查脚本
echo "=== 易政通平台健康检查 ==="
echo "时间: `$(date)"
echo ""

# 检查容器状态
echo "容器状态:"
docker-compose ps
echo ""

# 检查服务响应
echo "服务响应检查:"
if curl -f http://localhost:80/health > /dev/null 2>&1; then
    echo "✓ Web服务正常"
else
    echo "✗ Web服务异常"
fi

if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "✓ 应用服务正常"
else
    echo "✗ 应用服务异常"
fi

# 检查数据库连接
echo ""
echo "数据库连接检查:"
if docker-compose exec -T postgres pg_isready -U yizhengtong_user > /dev/null 2>&1; then
    echo "✓ 数据库连接正常"
else
    echo "✗ 数据库连接异常"
fi
"@
$HealthScript | Out-File -FilePath (Join-Path $PackageDir "health-check.sh") -Encoding UTF8

# 创建清理脚本
Write-Info "创建清理脚本..."
$CleanupScript = @"
#!/bin/bash

# 清理脚本
echo "清理易政通平台..."

# 停止并删除容器
docker-compose down

# 删除镜像
docker rmi `$(docker images -q yizhengtong-platform_app) 2>/dev/null || true

# 删除未使用的镜像和容器
docker system prune -f

echo "清理完成"
"@
$CleanupScript | Out-File -FilePath (Join-Path $PackageDir "cleanup.sh") -Encoding UTF8

# 创建部署包说明文件
Write-Info "创建部署包说明文件..."
$ReadmeContent = @"
# 易政通平台部署包

## 快速开始

1. **解压部署包**
   ```bash
   tar -xzf yizhengtong-platform-deployment-*.tar.gz
   cd yizhengtong-platform-deployment-*
   ```

2. **运行部署脚本**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

3. **访问应用**
   - 主应用: http://服务器IP:80
   - 直接访问: http://服务器IP:3000

## 文件说明

- `deploy.sh` - 自动部署脚本
- `start.sh` - 快速启动脚本
- `stop.sh` - 停止服务脚本
- `update.sh` - 更新服务脚本
- `health-check.sh` - 健康检查脚本
- `cleanup.sh` - 清理脚本
- `docker-compose.yml` - Docker编排配置
- `Dockerfile` - 应用镜像构建文件
- `nginx.conf` - Nginx配置文件
- `init-db.sql` - 数据库初始化脚本

## 系统要求

- CentOS 7/8 或 RHEL 7/8
- 至少 2GB 内存（推荐 4GB+）
- 至少 10GB 可用磁盘空间
- 网络连接

## 详细文档

请参考 `README-DEPLOY.md` 获取详细的部署和管理说明。
"@
$ReadmeContent | Out-File -FilePath (Join-Path $PackageDir "README.md") -Encoding UTF8

# 创建Windows版本的部署说明
Write-Info "创建Windows部署说明..."
$WindowsReadme = @"
# Windows环境下的部署包准备

## 说明

此部署包专为CentOS/Linux服务器设计，包含完整的Docker化部署方案。

## 在Windows上准备部署包

1. **运行打包脚本**
   ```powershell
   .\package-deploy.ps1
   ```

2. **上传到Linux服务器**
   - 使用SCP、SFTP或其他文件传输工具
   - 将生成的tar.gz文件上传到目标服务器

3. **在Linux服务器上部署**
   ```bash
   tar -xzf yizhengtong-platform-deployment-*.tar.gz
   cd yizhengtong-platform-deployment-*
   chmod +x deploy.sh
   ./deploy.sh
   ```

## 注意事项

- 此部署包需要在Linux环境下运行
- 确保目标服务器已安装Docker和Docker Compose
- 部署脚本会自动安装所需的依赖
"@
$WindowsReadme | Out-File -FilePath (Join-Path $PackageDir "WINDOWS-README.md") -Encoding UTF8

# 打包文件
Write-Info "创建部署包..."
Set-Location $ScriptDir

# 使用PowerShell压缩
try {
    Compress-Archive -Path $PackageName -DestinationPath "${PackageName}.zip" -Force
    Write-Info "使用PowerShell压缩完成: ${PackageName}.zip"
} catch {
    Write-Warn "打包过程中出现警告，但继续执行"
}

# 清理临时目录
Remove-Item -Path $PackageDir -Recurse -Force

# 获取文件大小
$PackageFile = if (Test-Path "${PackageName}.tar.gz") { "${PackageName}.tar.gz" } else { "${PackageName}.zip" }
$FileSize = (Get-Item $PackageFile).Length
$FileSizeMB = [math]::Round($FileSize / 1MB, 2)

Write-Info "部署包创建完成: $PackageFile"
Write-Info "文件大小: ${FileSizeMB} MB"

Write-Host ""
Write-Info "部署包内容:"
Write-Host "  - 完整的Next.js应用"
Write-Host "  - Docker配置文件"
Write-Host "  - 数据库初始化脚本"
Write-Host "  - Nginx反向代理配置"
Write-Host "  - 自动化部署脚本"
Write-Host "  - 服务管理脚本"
Write-Host "  - 监控和备份工具"
Write-Host ""

Write-Warn "部署说明:"
Write-Host "1. 将 $PackageFile 上传到CentOS服务器"
Write-Host "2. 解压: tar -xzf $PackageFile (或 unzip $PackageFile)"
Write-Host "3. 进入目录: cd $PackageName"
Write-Host "4. 运行部署: ./deploy.sh" 