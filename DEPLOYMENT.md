# 🚀 快速部署清单

## ✅ 阶段一：准备工作（已完成）

- [x] 代码已推送到 GitHub: `https://github.com/tom88115/freight-weight-analyzer`
- [x] 项目文档已完善
- [x] 生产配置已优化
- [x] 部署指南已准备

## 📋 阶段二：Zeabur 部署操作

### 1. 访问 Zeabur

打开浏览器，访问：https://zeabur.com/

### 2. 使用 GitHub 登录

1. 点击 **"Sign in with GitHub"**
2. 授权 Zeabur 访问您的 GitHub 账号
3. 选择授权访问 `freight-weight-analyzer` 仓库

### 3. 创建新项目

1. 点击 **"New Project"**
2. 输入项目名称：`freight-analysis`
3. 选择区域：**Hong Kong (ap-east-1)** 或 **Tokyo (ap-northeast-1)**
4. 点击 **"Create"**

### 4. 部署后端服务

#### 4.1 添加服务
1. 在项目页面点击 **"Add Service"**
2. 选择 **"Git"**
3. 选择仓库：`tom88115/freight-weight-analyzer`
4. Zeabur 会自动检测到项目

#### 4.2 配置后端
- **Service Name**: `backend`
- **Root Directory**: 选择 `backend`
- **Port**: `3000` (会自动检测)

#### 4.3 添加环境变量
点击 **"Environment Variables"**，添加：
```
PORT=3000
NODE_ENV=production
```

#### 4.4 开始部署
点击 **"Deploy"**，等待部署完成（约2-3分钟）

#### 4.5 获取后端域名
部署完成后，在 **"Domains"** 标签中，复制分配的域名，例如：
```
https://backend-xxx-yyy.zeabur.app
```

### 5. 部署前端服务

#### 5.1 添加服务
1. 返回项目页面
2. 再次点击 **"Add Service"**
3. 选择 **"Git"**
4. 选择同一个仓库

#### 5.2 配置前端
- **Service Name**: `frontend`
- **Root Directory**: 选择 `frontend`
- **Port**: `4173` (会自动检测)

#### 5.3 添加环境变量
**重要**：使用步骤 4.5 中复制的后端域名

点击 **"Environment Variables"**，添加：
```
VITE_API_URL=https://backend-xxx-yyy.zeabur.app
```

**注意**：将 `backend-xxx-yyy` 替换为您实际的后端域名

#### 5.4 开始部署
点击 **"Deploy"**，等待部署完成（约2-3分钟）

#### 5.5 获取前端域名
部署完成后，在 **"Domains"** 标签中，复制前端域名：
```
https://frontend-aaa-bbb.zeabur.app
```

### 6. 验证部署

#### 6.1 测试后端
打开后端域名，应该看到：
```json
{
  "message": "运费分析系统 API",
  "version": "1.0.0"
}
```

#### 6.2 测试前端
1. 打开前端域名
2. 应该看到"运营分析"页面
3. 检查数据是否正常加载

#### 6.3 测试功能
- [ ] 运营分析仪表板数据显示正常
- [ ] 公斤段筛选功能正常
- [ ] 趋势图显示正常
- [ ] 数据排序功能正常

## 🎯 部署完成后

### 记录您的访问地址

**前端地址**：`https://_____________________.zeabur.app`

**后端地址**：`https://_____________________.zeabur.app`

### 配置自定义域名（可选）

如果您有自己的域名，可以在 Zeabur 的 **"Domains"** 标签中绑定。

## 📊 监控和维护

### 查看日志
1. 在 Zeabur Dashboard 中选择服务
2. 点击 **"Logs"** 标签
3. 实时查看运行日志

### 查看资源使用
1. 点击 **"Metrics"** 标签
2. 查看 CPU、内存使用情况

### 重新部署
如果代码有更新：
1. 推送到 GitHub
2. Zeabur 会自动触发重新部署
3. 或手动点击 **"Redeploy"** 按钮

## ⚠️ 常见问题速查

### 前端显示"无法连接到服务器"
**解决方案**：
1. 检查前端环境变量 `VITE_API_URL` 是否正确
2. 确认后端服务正在运行
3. 查看浏览器控制台错误信息

### 后端部署失败
**解决方案**：
1. 查看 Zeabur 构建日志
2. 确认 `backend` 目录中有 `package.json`
3. 检查 TypeScript 编译是否成功

### 数据上传失败
**当前限制**：
- 文件大小限制：50MB
- 支持格式：Excel (.xlsx, .xls), CSV (.csv)

**解决方案**：
1. 检查文件格式
2. 减小文件大小
3. 查看后端日志了解详细错误

## 📚 相关文档

- 📖 [产品功能总结](./docs/产品功能总结.md)
- 🚀 [Zeabur 部署详细指南](./docs/Zeabur部署指南.md)
- 📝 [项目 README](./README.md)

## 🆘 需要帮助？

1. 查看 [Zeabur 官方文档](https://zeabur.com/docs)
2. 检查项目 `docs` 目录中的详细文档
3. 查看 GitHub Issues

---

**祝您部署顺利！** 🎉

如有问题，请参考详细的 [Zeabur部署指南.md](./docs/Zeabur部署指南.md)

