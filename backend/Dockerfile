FROM node:18-alpine

WORKDIR /app

# 复制 backend 的 package 文件
COPY backend/package*.json ./

# 安装依赖（包括 devDependencies，因为需要 TypeScript）
RUN npm install

# 复制 backend 源代码
COPY backend/ ./

# 编译 TypeScript
RUN npm run build

# 验证构建产物
RUN ls -la dist/ && echo "=== Build artifacts verified ==="

# 暴露端口
EXPOSE 8080

# 设置环境变量
ENV PORT=8080
ENV NODE_ENV=production

# 启动应用 - 直接使用 node 运行编译后的文件
CMD ["node", "dist/startup.js"]

