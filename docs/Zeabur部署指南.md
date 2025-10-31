# Zeabur 部署指南

## 📦 准备工作

### 1. 确认项目已推送到 GitHub

```bash
# 检查当前 Git 状态
git status

# 如有未提交的更改，先提交
git add .
git commit -m "feat: 准备部署到 Zeabur"
git push origin main
```

### 2. 准备 Zeabur 账号

1. 访问 [Zeabur](https://zeabur.com/)
2. 使用 GitHub 账号登录
3. 授权 Zeabur 访问您的 GitHub 仓库

## 🚀 部署步骤

### 方法一：通过 Zeabur Dashboard（推荐）

#### 步骤 1: 创建新项目

1. 登录 Zeabur Dashboard
2. 点击 **"New Project"** 按钮
3. 输入项目名称：`freight-analysis-system`
4. 选择部署区域（推荐：`ap-east-1` 香港或 `ap-northeast-1` 东京）

#### 步骤 2: 部署后端服务

1. 在项目中点击 **"Add Service"**
2. 选择 **"Git"**
3. 选择您的 GitHub 仓库：`运费分公斤段`
4. Zeabur 会自动检测到 `backend` 目录
5. 配置服务：
   - **Service Name**: `backend`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Port**: `3000`

6. 添加环境变量：
   ```
   PORT=3000
   NODE_ENV=production
   ```

7. 点击 **"Deploy"** 开始部署

#### 步骤 3: 部署前端服务

1. 再次点击 **"Add Service"**
2. 选择 **"Git"**
3. 选择同一个 GitHub 仓库
4. 配置服务：
   - **Service Name**: `frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run preview`
   - **Port**: `4173`

5. 添加环境变量：
   ```
   VITE_API_URL=https://your-backend-url.zeabur.app
   ```
   （注意：需要等后端部署完成后，复制后端的域名地址）

6. 点击 **"Deploy"** 开始部署

#### 步骤 4: 配置域名（可选）

1. 在后端服务页面，点击 **"Domains"**
2. Zeabur 会自动分配一个域名，如：`backend-xxx.zeabur.app`
3. 复制这个域名，用于前端环境变量配置

4. 回到前端服务，更新环境变量：
   ```
   VITE_API_URL=https://backend-xxx.zeabur.app
   ```

5. 触发重新部署（点击 "Redeploy"）

### 方法二：使用 Zeabur CLI

#### 安装 Zeabur CLI

```bash
npm install -g @zeabur/cli
# 或
pnpm install -g @zeabur/cli
```

#### 登录 Zeabur

```bash
zeabur login
```

#### 初始化项目

```bash
cd /Users/tomnice/cursor/pet/运费分公斤段
zeabur init
```

#### 部署后端

```bash
cd backend
zeabur deploy
```

#### 部署前端

```bash
cd ../frontend
zeabur deploy
```

## 🔧 项目配置文件

### backend/package.json

确保有以下脚本：

```json
{
  "scripts": {
    "start": "node dist/startup.js",
    "build": "tsc",
    "dev": "nodemon --exec ts-node src/startup.ts"
  }
}
```

### frontend/package.json

确保有以下脚本：

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

### frontend/vite.config.ts

配置生产环境预览：

```typescript
export default defineConfig({
  server: {
    port: 5173
  },
  preview: {
    port: 4173,
    host: '0.0.0.0'
  }
})
```

## 📋 环境变量说明

### 后端环境变量

| 变量名 | 说明 | 默认值 | 必填 |
|--------|------|--------|------|
| `PORT` | 服务端口 | 3000 | 否 |
| `NODE_ENV` | 运行环境 | development | 否 |
| `MONGODB_URI` | MongoDB连接字符串 | - | 否（使用内存存储）|

### 前端环境变量

| 变量名 | 说明 | 示例 | 必填 |
|--------|------|------|------|
| `VITE_API_URL` | 后端API地址 | https://backend-xxx.zeabur.app | 是 |

## 🔍 部署验证

### 1. 检查后端服务

访问：`https://your-backend-url.zeabur.app/`

应该看到：
```json
{
  "message": "运费分析系统 API",
  "version": "1.0.0",
  "endpoints": {
    "analytics": "/api/analytics",
    "dashboard": "/api/dashboard",
    "upload": "/api/upload"
  }
}
```

### 2. 检查前端服务

访问：`https://your-frontend-url.zeabur.app/`

应该看到运营分析仪表板页面，并能正常加载数据。

### 3. 测试数据上传

1. 点击右上角 "上传数据" 按钮
2. 选择一个小的测试Excel文件
3. 验证上传成功并能在仪表板看到数据

## ⚠️ 常见问题

### 问题 1: 前端无法连接后端

**原因**：环境变量配置错误或CORS未配置

**解决方案**：
1. 检查 `VITE_API_URL` 环境变量是否正确
2. 确认后端已启用CORS（项目中已配置）
3. 在浏览器控制台查看具体错误信息

### 问题 2: 后端启动失败

**原因**：TypeScript未编译或启动命令错误

**解决方案**：
1. 确认 `build` 命令执行成功
2. 检查 `dist` 目录是否生成
3. 查看 Zeabur 构建日志

### 问题 3: 文件上传失败

**原因**：文件大小超限或路径配置问题

**解决方案**：
1. 检查文件大小（默认限制 50MB）
2. 调整 `backend/src/middleware/uploadMiddleware.ts` 中的 `fileSize` 配置
3. 重新部署后端服务

### 问题 4: 数据加载慢

**原因**：内存存储限制或网络延迟

**解决方案**：
1. 考虑升级 Zeabur 服务配置
2. 启用 MongoDB 持久化存储
3. 优化前端数据缓存策略

## 🎯 生产环境优化建议

### 1. 启用 MongoDB

```javascript
// backend/src/startup.ts
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/freight-analysis';
```

在 Zeabur 中添加 MongoDB 服务：
1. 在项目中点击 "Add Service"
2. 选择 "Prebuilt Service"
3. 选择 "MongoDB"
4. 获取连接字符串，添加到后端环境变量

### 2. 启用 Redis 缓存

可选：使用 Redis 替代内存缓存，提升多实例部署性能

### 3. CDN 配置

在 Zeabur 中为前端服务启用 CDN 加速

### 4. 监控告警

设置 Zeabur 监控告警：
- CPU 使用率 > 80%
- 内存使用率 > 80%
- 服务响应时间 > 3s

## 📊 部署后检查清单

- [ ] 后端服务正常启动
- [ ] 前端服务正常访问
- [ ] API 接口连接正常
- [ ] 数据加载功能正常
- [ ] 文件上传功能正常
- [ ] 各个分析页面正常显示
- [ ] 性能表现符合预期
- [ ] 错误日志监控已配置

## 🔗 相关链接

- [Zeabur 官方文档](https://zeabur.com/docs)
- [Zeabur GitHub 集成](https://zeabur.com/docs/deploy/github)
- [环境变量配置](https://zeabur.com/docs/deploy/environment-variables)
- [域名绑定](https://zeabur.com/docs/deploy/domain-binding)

## 💡 技术支持

如遇到部署问题，请：
1. 查看 Zeabur 构建日志
2. 检查环境变量配置
3. 参考项目 README.md
4. 查看 `docs/产品功能总结.md`

---

**部署愉快！** 🚀

