FROM node:18-alpine

WORKDIR /app

# 复制 backend 的 package 文件
COPY backend/package*.json ./

# 安装依赖
RUN npm install

# 复制 backend 源代码
COPY backend/ ./

# 编译 TypeScript
RUN npm run build

# 暴露端口
EXPOSE 8080

# 设置环境变量
ENV PORT=8080
ENV NODE_ENV=production

# 启动应用
CMD ["npm", "start"]

