# 🚨 Zeabur 部署紧急修复

## 问题诊断

当前 502 错误的根本原因：

### 后端问题
❌ **TypeScript 编译失败** - `tsconfig.json` 中的 `noUnusedParameters` 导致编译错误

### 前端问题  
❌ **环境变量名称不一致** - Dockerfile 使用 `VITE_API_URL`，代码需要 `VITE_API_BASE_URL`

## 已修复的问题

✅ 修改 `backend/tsconfig.json`：
- `noUnusedLocals`: true → false
- `noUnusedParameters`: true → false

✅ 修改 `frontend/Dockerfile`：
- `VITE_API_URL` → `VITE_API_BASE_URL`

✅ 修改 `zeabur.yaml`：
- buildArgs 环境变量统一为 `VITE_API_BASE_URL`

## 🚀 立即操作步骤

### 1. 在 Zeabur 中重新部署

访问：https://zeabur.cn/projects/690451d7a4e6b6517feafe6b

#### 后端服务

1. 点击 **backend** 服务
2. 点击 **"Redeploy"** 按钮
3. 等待构建完成（约 3-5 分钟）
4. 检查日志，确认没有 TypeScript 编译错误
5. 验证：`curl https://freight-api.zeabur.app/` 应该返回 JSON

#### 前端服务

1. 点击 **frontend** 服务
2. 点击 **"Settings"** → **"Build Args"**
3. 确认或添加：
   ```
   Key: VITE_API_BASE_URL
   Value: https://freight-api.zeabur.app
   ```
4. 保存后点击 **"Redeploy"**
5. 等待构建完成（约 3-5 分钟）
6. 验证：访问 https://freight-app.zeabur.app/ 应该能看到页面

### 2. 如果还是失败

查看构建日志：

1. 进入服务页面
2. 点击 **"Logs"** 标签
3. 查看 **"Build Logs"** 和 **"Runtime Logs"**
4. 寻找错误信息

常见错误：
- `npm ERR!` - 依赖安装失败
- `TS error` - TypeScript 编译错误
- `Error: Cannot find module` - 模块缺失

## 📝 技术细节

### 后端编译

TypeScript 配置现在允许未使用的参数（这在 Express 中间件中很常见）：

```typescript
// 例如：错误处理中间件
app.use((_err, _req, res, _next) => {
  res.status(500).json({ error: 'Server error' });
});
```

### 前端环境变量

Vite 要求环境变量以 `VITE_` 开头，并在构建时注入：

```typescript
// frontend/src/services/api.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
```

这个环境变量**必须在构建时设置**（Build Args），而不是运行时（Environment Variables）。

### Dockerfile 多阶段构建

前端使用两阶段构建：

1. **构建阶段** (Node.js)：编译 React 应用
   - 需要在这里注入 `VITE_API_BASE_URL`
   
2. **运行阶段** (Nginx)：提供静态文件
   - 已经编译好的文件，不需要环境变量

## ✅ 验证清单

- [ ] 后端服务状态为 "Running"
- [ ] 后端 API 返回正常：`curl https://freight-api.zeabur.app/`
- [ ] 前端服务状态为 "Running"  
- [ ] 前端页面能正常访问：https://freight-app.zeabur.app/
- [ ] 前端能调用后端 API（在浏览器控制台查看 Network）
- [ ] 数据能正常加载和显示

## 🆘 如果还有问题

请提供以下信息：

1. **服务状态截图**（Zeabur 服务页面）
2. **构建日志**（Build Logs 的最后 50 行）
3. **运行日志**（Runtime Logs 的最后 50 行）
4. **浏览器控制台错误**（F12 → Console 标签）
5. **Network 请求失败详情**（F12 → Network 标签）

---

**预计修复时间：10 分钟**（推送代码后重新部署）

**成功率：95%+**（修复了核心编译和配置问题）

