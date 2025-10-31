# 🚀 立即部署到 Zeabur - 快速操作指引

## ✅ 准备工作已完成

- ✅ 正确的 Dockerfile 已创建
- ✅ 配置文件已创建
- ✅ 代码已推送到 GitHub

## 📋 现在开始部署（5分钟完成）

### 步骤 1: 访问 Zeabur 项目

打开：https://zeabur.com/projects/690451d7a4e6b6517feafe6b

### 步骤 2: 重新部署后端

1. 点击 **`backend`** 服务卡片
2. 点击右上角的 **"Redeploy"** 按钮
3. 选择 **"Redeploy with latest code"**
4. 等待部署完成（约 2-3 分钟）
5. ⚠️ **记住后端域名**（例如：`https://backend-xxx.zeabur.app`）

### 步骤 3: 配置前端环境变量

1. 点击 **`frontend`** 服务卡片
2. 点击 **"Settings"** 标签
3. 向下滚动找到 **"Build Args"** 部分
4. 点击 **"Add Build Arg"** 按钮
5. 添加：
   ```
   Key: VITE_API_URL
   Value: https://freight-api.zeabur.app
   ```
   （或使用步骤 2 中记住的后端域名）
6. 点击 **"Save"** 保存

### 步骤 4: 重新部署前端

1. 在 frontend 服务页面
2. 点击右上角的 **"Redeploy"** 按钮
3. 选择 **"Redeploy with latest code"**
4. 等待部署完成（约 2-3 分钟）

## ✅ 验证部署

### 测试后端

打开新标签页访问：https://freight-api.zeabur.app/

应该看到类似这样的 JSON：
```json
{
  "message": "运费分析系统 API",
  "version": "1.0.0"
}
```

### 测试前端

打开新标签页访问：https://freight-app.zeabur.app/

应该看到：
- ✅ 运营分析仪表板页面
- ✅ 数据正常加载
- ✅ 无错误提示

## ⚠️ 如果还是失败

### 方案 A: 查看日志

1. 在服务页面点击 **"Logs"** 标签
2. 查看错误信息
3. 截图发给我

### 方案 B: 完全重建服务

如果上面的方法不行，请执行以下步骤：

#### 1. 删除现有服务
- 在项目页面，分别点击 `backend` 和 `frontend` 服务
- 点击 **"Settings"** → 拉到最下面
- 点击 **"Delete Service"** 按钮

#### 2. 重新创建后端服务

点击 **"Add Service"** → **"Git"**

配置：
- **Repository**: `tom88115/freight-weight-analyzer`
- **Service Name**: `backend`
- **Root Directory**: `backend`
- **Branch**: `main`

环境变量（Variables）：
```
PORT=8080
NODE_ENV=production
```

点击 **"Deploy"**

#### 3. 等待后端部署完成并获取域名

在 **"Domains"** 标签复制域名，例如：
```
https://backend-abc123.zeabur.app
```

#### 4. 重新创建前端服务

点击 **"Add Service"** → **"Git"**

配置：
- **Repository**: `tom88115/freight-weight-analyzer`
- **Service Name**: `frontend`
- **Root Directory**: `frontend`
- **Branch**: `main`

⚠️ **重要**：在 **"Build Args"** 部分添加：
```
VITE_API_URL=<步骤3中复制的后端域名>
```

点击 **"Deploy"**

## 📊 部署时间参考

- 后端构建：约 2-3 分钟
- 前端构建：约 3-5 分钟
- 总共：约 5-8 分钟

## 🆘 需要帮助？

如果遇到问题：
1. 截图 Zeabur 的日志页面
2. 截图浏览器控制台（F12 → Console）
3. 告诉我具体的错误信息

---

**记得部署完成后测试一下功能！** 🎉

