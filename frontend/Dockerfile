# 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app

# 复制 frontend 的 package 文件
COPY frontend/package*.json ./

# 安装依赖
RUN npm install

# 复制 frontend 源代码
COPY frontend/ ./

# 设置环境变量（将在构建时使用）
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# 构建应用
RUN npm run build

# 生产阶段 - 使用 nginx 提供静态文件
FROM nginx:alpine

# 复制构建产物到 nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 nginx 配置（从项目根目录的 frontend/nginx.conf）
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 8080

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]

