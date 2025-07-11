# 使用官方 Node.js 22 Alpine 镜像
FROM node:22-alpine

# 设置时区为上海
ENV TZ=Asia/Shanghai

# 设置工作目录
WORKDIR /app

# 将项目文件复制到容器中的 /app 目录
COPY . /app

# 设置 npm 镜像源
RUN npm config set registry https://registry.npmjs.org/

# 安装项目依赖
RUN npm install

# 暴露应用的端口（根据你的 Next.js 配置，通常是 3000）
EXPOSE 3000

# 启动应用
CMD ["npm", "run", "start"]
