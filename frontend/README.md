# 运费分析系统 - 前端

基于 React + TypeScript + Vite + Ant Design 的运费分析前端应用。

## 功能特性

- 📤 Excel 文件拖拽上传
- 📊 数据可视化图表（柱状图、饼图、折线图）
- 📈 实时数据分析统计
- 🔍 多条件数据筛选
- 📋 数据表格展示与排序
- 🎨 美观的现代化 UI 设计

## 技术栈

- React 18
- TypeScript
- Vite
- Ant Design 5
- ECharts
- Axios
- Day.js

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

应用将在 http://localhost:5173 启动

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 项目结构

```
frontend/
├── src/
│   ├── components/      # React 组件
│   │   ├── UploadSection.tsx
│   │   ├── StatisticsCards.tsx
│   │   ├── WeightRangeChart.tsx
│   │   └── DataTable.tsx
│   ├── pages/          # 页面
│   │   └── Dashboard.tsx
│   ├── services/       # API 服务
│   │   └── api.ts
│   ├── types/          # TypeScript 类型定义
│   │   └── index.ts
│   ├── App.tsx         # 主应用组件
│   ├── main.tsx        # 入口文件
│   └── index.css       # 全局样式
├── public/             # 静态资源
└── package.json
```

## 主要功能模块

### 1. 文件上传模块
- 支持拖拽上传
- 文件格式验证
- 上传进度显示
- 实时反馈

### 2. 数据统计模块
- 总记录数统计
- 总运费统计
- 平均运费计算
- 数据时间范围

### 3. 数据可视化模块
- 重量段订单分布柱状图
- 重量段占比饼图
- 运费趋势折线图
- 响应式图表设计

### 4. 数据表格模块
- 分页展示
- 排序功能
- 筛选功能
- 数据刷新

## 环境配置

创建 `.env.development` 文件：

```env
VITE_API_BASE_URL=http://localhost:3000
```

创建 `.env.production` 文件：

```env
VITE_API_BASE_URL=https://your-api-domain.com
```

## UI 特性

- 🎨 渐变色 Header 设计
- 💫 卡片悬浮效果
- 📱 完全响应式布局
- 🌈 Ant Design 主题定制
- ⚡ 流畅的动画效果

## 浏览器支持

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)

## 开发说明

### 代码规范

项目使用 ESLint 进行代码检查：

```bash
npm run lint
```

### 类型检查

项目使用 TypeScript 进行类型检查，确保类型安全。

## 部署

### Vercel 部署

```bash
npm run build
vercel --prod
```

### Netlify 部署

```bash
npm run build
netlify deploy --prod
```

## 性能优化

- 使用 Vite 进行快速构建
- 组件懒加载
- 图表按需加载
- 资源压缩优化

## License

MIT
