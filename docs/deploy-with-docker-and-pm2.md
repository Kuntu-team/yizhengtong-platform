# 亿政通平台 Docker + PM2 部署详细文档

## 1. 环境准备

- 云服务器操作系统：Linux（推荐 Ubuntu 20.04+ 或 CentOS 7+）
- 已安装 Docker 和（可选）Docker Compose
- 获取项目代码（推荐用 Git 克隆，或上传压缩包解压）

---

## 2. Dockerfile 示例

在项目根目录下创建 `Dockerfile`：

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build

RUN npm install -g pm2

EXPOSE 3002
CMD [ "pm2-runtime", "ecosystem.config.js" ]
```

---

## 3. PM2 配置（ecosystem.config.js）

确保 `ecosystem.config.js` 在项目根目录，内容如下（可根据服务器配置调整内存限制）：

```js
module.exports = {
  apps: [
    {
      name: 'yizhengtong-platform',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 'max', // 自动根据CPU核数
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
        NODE_OPTIONS: '--max-old-space-size=2048 --max-semi-space-size=256',
        CACHE_ENABLED: 'true',
      },
      max_memory_restart: '4G', // 根据容器内存调整   // 当前配置：适合16核32GB服务器
    }
  ]
};
```

---

## 4. .dockerignore 示例

在项目根目录下创建 `.dockerignore`，内容如下：

```
node_modules
.next
logs
.git
docs
*.md
*.jmx
```

---

## 5. 环境变量配置

- 推荐用 Docker Compose 或 Kubernetes Secret 管理 `.env` 文件
- 关键变量如 `DATABASE_URL`、`JWT_SECRET` 必须配置
- 示例：

```
DATABASE_URL=your_production_database_url
JWT_SECRET=your_production_jwt_secret
NODE_ENV=production
```

---

## 6. Docker Compose 示例（可选）

如需用 Compose 管理数据库和服务：

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3002:3002"
    env_file:
      - .env
    restart: always
    volumes:
      - ./logs:/app/logs
    # depends_on:
    #   - db
  # db:
  #   image: postgres:15
  #   ...
```

---

## 7. 部署流程

### 7.1 构建镜像
```bash
docker build -t yizhengtong-platform:latest .
```

### 7.2 运行容器
```bash
docker run -d --name yizhengtong-platform \
  --env-file .env \
  -p 3002:3002 \
  yizhengtong-platform:latest
```

或用 Compose：
```bash
docker-compose up -d
```

### 7.3 查看日志
```bash
docker logs -f yizhengtong-platform
```

### 7.4 进入容器调试（可选）
```bash
docker exec -it yizhengtong-platform sh
pm2 ls
pm2 logs
```

---

## 8. 常见问题与建议

- **内存限制**：如容器内存较小，调整 `max_memory_restart` 和 `NODE_OPTIONS`
- **端口冲突**：确保宿主机 3002 端口未被占用
- **数据库连接**：确保 `DATABASE_URL` 可从容器访问
- **日志持久化**：建议挂载 logs 目录到宿主机
- **依赖安装**：务必在镜像内执行 `npm install`，不要上传本地 `node_modules`

---

## 9. 升级/重启流程

```bash
# 拉取新代码/镜像
git pull
docker build -t yizhengtong-platform:latest .
docker stop yizhengtong-platform && docker rm yizhengtong-platform
docker run -d --name yizhengtong-platform --env-file .env -p 3002:3002 yizhengtong-platform:latest
```
或
```bash
docker-compose down
docker-compose up -d --build
```

---

## 10. PM2 相关命令（容器内）

```bash
pm2 ls           # 查看进程
pm2 logs         # 查看日志
pm2 restart all  # 重启所有进程
pm2 monit        # 监控
```

---

## 11. 安全建议

- 不要将 `.env`、`node_modules`、`logs`、`docs`、`.git` 等打包进镜像
- 生产环境务必关闭调试和开发模式

---

如有特殊需求可补充说明，运维人员可直接参考本文档进行 Docker + PM2 部署！