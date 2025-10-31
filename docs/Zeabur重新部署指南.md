# Zeabur 重新部署指南

## 问题诊断

当前部署遇到 "Bad Gateway" 错误，原因是：

1. ❌ Dockerfile 配置不正确
2. ❌ 前端缺少环境变量配置
3. ❌ 端口配置可能有问题

## 已完成的修复

✅ 已创建正确的 Dockerfile：
- **backend/Dockerfile** - Node.js 后端配置
- **frontend/Dockerfile** - React + Nginx 前端配置

✅ 已创建配置文件：
- **zeabur.yaml** - Zeabur 多服务配置
- **frontend/nginx.conf** - Nginx 服务器配置
- **.dockerignore** - 优化构建速度

## 重新部署步骤

### 方法一：通过 Git 推送自动部署（推荐）

#### 1. 提交更改到 GitHub

```bash
cd /Users/tomnice/cursor/pet/运费分公斤段
git add -A
git commit -m "fix: 添加正确的 Dockerfile 和 Zeabur 配置"
git push origin main
```

#### 2. 在 Zeabur 中触发重新部署

1. 访问您的 Zeabur 项目：https://zeabur.com/projects/690451d7a4e6b6517feafe6b
2. 对于 **backend** 服务：
   - 点击服务卡片
   - 点击右上角的 **"Redeploy"** 按钮
   - 确认重新部署
3. 对于 **frontend** 服务：
   - 点击服务卡片
   - 点击右上角的 **"Redeploy"** 按钮
   - 确认重新部署

#### 3. 配置环境变量

**后端服务环境变量**（可能已经自动设置）：
```
PORT=8080
NODE_ENV=production
```

**前端服务环境变量**：

⚠️ **重要**：前端构建需要在 **Build Args** 中设置，而不是普通环境变量！

1. 进入 frontend 服务
2. 点击 **"Settings"** 标签
3. 找到 **"Build Args"** 部分
4. 添加：
   ```
   VITE_API_URL=https://freight-api.zeabur.app
   ```
5. 保存后点击 **"Redeploy"**

### 方法二：删除服务并重新创建（如果方法一失败）

#### 1. 删除现有服务

1. 访问项目页面
2. 分别删除 `backend` 和 `frontend` 服务

#### 2. 推送代码到 GitHub

```bash
cd /Users/tomnice/cursor/pet/运费分公斤段
git add -A
git commit -m "fix: 添加正确的 Dockerfile 和 Zeabur 配置"
git push origin main
```

#### 3. 重新创建后端服务

1. 在项目页面点击 **"Add Service"**
2. 选择 **"Git"**
3. 选择仓库：`tom88115/freight-weight-analyzer`
4. 配置：
   - **Service Name**: `backend`
   - **Root Directory**: `backend`
   - **Branch**: `main`
5. 环境变量：
   ```
   PORT=8080
   NODE_ENV=production
   ```
6. 点击 **"Deploy"**

#### 4. 获取后端域名

部署完成后，在后端服务的 **"Domains"** 标签中获取域名，例如：
```
https://backend-xxx.zeabur.app
```

#### 5. 重新创建前端服务

1. 再次点击 **"Add Service"** → **"Git"**
2. 选择同一个仓库
3. 配置：
   - **Service Name**: `frontend`
   - **Root Directory**: `frontend`
   - **Branch**: `main`
4. **Build Args**（非常重要）：
   ```
   VITE_API_URL=https://backend-xxx.zeabur.app
   ```
   ⚠️ 替换为步骤 4 中获取的实际后端域名
5. 点击 **"Deploy"**

## 验证部署

### 1. 测试后端

```bash
# 应该返回 API 信息
curl https://freight-api.zeabur.app/
```

预期响应：
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

### 2. 测试前端

访问：https://freight-app.zeabur.app/

应该能看到：
- ✅ 运营分析页面正常显示
- ✅ 数据能够加载
- ✅ 没有控制台错误

## 查看部署日志

如果部署失败，查看日志：

1. 进入服务页面
2. 点击 **"Logs"** 标签
3. 查看构建和运行时日志
4. 寻找错误信息

## 常见问题

### 问题 1: 前端显示空白页

**原因**：`VITE_API_URL` 没有正确设置

**解决**：
1. 确认在 **Build Args** 中设置了 `VITE_API_URL`
2. 注意是 **Build Args**，不是普通环境变量
3. 重新部署前端服务

### 问题 2: 前端无法连接后端

**原因**：CORS 或后端域名错误

**检查**：
1. 打开浏览器开发者工具（F12）
2. 查看 Console 标签的错误信息
3. 查看 Network 标签，确认 API 请求的地址

**解决**：
1. 确认后端 CORS 已启用（代码中已配置）
2. 确认前端 `VITE_API_URL` 指向正确的后端域名

### 问题 3: 后端启动失败

**原因**：依赖安装失败或端口冲突

**解决**：
1. 查看后端日志
2. 确认 `PORT=8080` 环境变量已设置
3. 如果是依赖问题，可能需要清理缓存后重新部署

### 问题 4: 构建超时

**原因**：依赖下载慢或构建时间过长

**解决**：
1. 在 Zeabur 项目设置中增加构建超时时间
2. 或使用 Zeabur 的 CDN 加速功能

## 项目文件结构

确认以下文件已正确创建：

```
运费分公斤段/
├── backend/
│   ├── Dockerfile          ✅ 新创建
│   ├── .dockerignore       ✅ 新创建
│   └── ...
├── frontend/
│   ├── Dockerfile          ✅ 新创建
│   ├── .dockerignore       ✅ 新创建
│   ├── nginx.conf          ✅ 新创建
│   └── ...
└── zeabur.yaml            ✅ 新创建
```

## 技术支持

- Zeabur 文档：https://zeabur.com/docs
- Zeabur Discord：https://zeabur.com/dc
- 项目仓库：https://github.com/tom88115/freight-weight-analyzer

---

**部署完成后，请记得更新文档中的实际访问地址！**

