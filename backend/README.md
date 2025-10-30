# 运费分析系统 - 后端 API

基于 Node.js + Express + TypeScript + MongoDB 的运费分析后端服务。

## 功能特性

- 📤 Excel 文件上传和解析
- 📊 运费数据分析和统计
- 🔍 多维度数据筛选
- 💾 MongoDB 数据持久化
- 📈 按重量段自动分类

## 技术栈

- Node.js
- Express.js
- TypeScript
- MongoDB + Mongoose
- Multer（文件上传）
- xlsx（Excel 处理）

## 安装依赖

```bash
npm install
```

## 环境配置

创建 `.env` 文件：

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/freight-analyzer
CORS_ORIGIN=http://localhost:5173
```

## 启动开发服务器

```bash
npm run dev
```

## API 端点

### 上传文件
- **POST** `/api/upload`
- 上传 Excel 文件并解析运费数据

### 获取分析结果
- **GET** `/api/analytics`
- 查询参数：`startDate`, `endDate`, `carrier`

### 获取所有记录
- **GET** `/api/analytics/records`
- 查询参数：`page`, `limit`, `carrier`, `startDate`, `endDate`

### 清空记录
- **DELETE** `/api/analytics/records`

## 数据模型

### FreightRecord

```typescript
{
  orderNumber?: string;     // 订单号
  weight: number;           // 重量（公斤）
  cost: number;             // 运费
  destination?: string;     // 目的地
  carrier?: string;         // 承运商
  date: Date;              // 日期
  weightRange: string;     // 重量段（自动计算）
  remarks?: string;        // 备注
}
```

## 重量段划分

- 0-1kg
- 1-2kg
- 2-5kg
- 5-10kg
- 10-20kg
- 20-50kg
- 50kg以上

## 开发说明

### 项目结构

```
backend/
├── src/
│   ├── controllers/      # 控制器
│   ├── models/          # 数据模型
│   ├── routes/          # 路由
│   ├── middleware/      # 中间件
│   ├── utils/           # 工具函数
│   ├── types/           # TypeScript 类型定义
│   └── index.ts         # 入口文件
├── uploads/             # 文件上传目录
└── package.json
```

## 生产部署

```bash
# 构建项目
npm run build

# 启动生产服务器
npm start
```

