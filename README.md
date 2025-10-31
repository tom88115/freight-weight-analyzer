# 运费公斤段分析系统

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-19.1.1-61dafb.svg)

专为电商运营打造的精细化运费分析工具

[功能总结](./docs/产品功能总结.md) • [快速部署](./DEPLOYMENT.md) • [部署指南](./docs/Zeabur部署指南.md)

</div>

---

## 📋 项目简介

运费公斤段分析系统是一款专业的电商运费数据分析工具，通过多维度数据分析和可视化，帮助运营团队：

- 🎯 **精准识别**高运费占比订单，发现成本优化空间
- 📊 **数据驱动**决策，通过趋势分析引导订单结构优化
- ⚡ **实时监控**运费异常，及时调整运营策略
- 🔄 **横向对比**各渠道运费表现，优化资源配置

## ✨ 核心功能

### 🎨 运营分析仪表板
- **一目了然的数据展示**：汇总数据、每日明细、渠道对比
- **智能趋势分析**：订单交付费比、销售额、运单占比三维度趋势图
- **灵活公斤段筛选**：支持5个预定义重量段快速切换
- **渠道特定阈值**：基于各渠道历史数据的智能预警

### 📊 多维度分析
- 按日期、平台、重量范围交叉分析
- 自定义日期范围筛选
- 可视化图表展示（ECharts）

### 📈 详细报表
- 交叉表格式，平台×日期展示
- 支持按重量段分组
- 小计和总计自动计算

### 📤 数据管理
- 支持 Excel (.xlsx, .xls) 和 CSV 格式导入
- 大批量数据处理（16万+记录）
- 原始数据查看和导出

## 🚀 快速开始

### 方式一：本地运行

#### 前置要求
- Node.js >= 18.0.0
- npm 或 pnpm

#### 1. 克隆项目
```bash
git clone https://github.com/tom88115/freight-weight-analyzer.git
cd freight-weight-analyzer
```

#### 2. 安装依赖

**后端**：
```bash
cd backend
npm install
```

**前端**：
```bash
cd frontend
npm install
```

#### 3. 启动服务

**后端**（在 `backend` 目录）：
```bash
npm run dev
```
后端将运行在 http://localhost:3000

**前端**（在 `frontend` 目录，新终端）：
```bash
npm run dev
```
前端将运行在 http://localhost:5173

#### 4. 访问系统

打开浏览器访问：http://localhost:5173

### 方式二：部署到 Zeabur

详细步骤请查看：[快速部署清单](./DEPLOYMENT.md)

简要步骤：
1. 访问 [Zeabur](https://zeabur.com/)
2. 使用 GitHub 登录
3. 创建新项目并选择本仓库
4. 分别部署 `backend` 和 `frontend`
5. 配置环境变量并完成部署

## 📊 技术栈

### 前端
- **React 18** - 现代化 UI 框架
- **TypeScript** - 类型安全
- **Ant Design** - 企业级 UI 组件
- **ECharts** - 专业图表库
- **Vite** - 快速构建工具
- **React Router** - 路由管理
- **Axios** - HTTP 客户端
- **dayjs** - 日期处理

### 后端
- **Node.js** - 运行环境
- **Express** - Web 框架
- **TypeScript** - 类型安全
- **Multer** - 文件上传
- **XLSX/ExcelJS** - Excel 文件处理
- **内存存储** - 快速原型（可切换到 MongoDB）

## 📸 系统截图

### 运营分析仪表板
展示每日各渠道运费数据，支持公斤段筛选和趋势分析

### 多维度分析
交叉维度数据分析，支持自定义筛选条件

## 📁 项目结构

```
freight-weight-analyzer/
├── backend/                 # 后端服务
│   ├── src/
│   │   ├── controllers/     # 控制器
│   │   ├── routes/          # 路由
│   │   ├── utils/           # 工具函数
│   │   ├── storage/         # 数据存储
│   │   ├── types/           # 类型定义
│   │   └── startup.ts       # 启动文件
│   ├── package.json
│   └── tsconfig.json
├── frontend/                # 前端应用
│   ├── src/
│   │   ├── components/      # 组件
│   │   ├── pages/           # 页面
│   │   ├── types/           # 类型定义
│   │   ├── App.tsx          # 主应用
│   │   └── main.tsx         # 入口文件
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── docs/                    # 文档
│   ├── 产品功能总结.md
│   ├── Zeabur部署指南.md
│   └── 运营分析系统优化说明.md
├── DEPLOYMENT.md            # 快速部署清单
└── README.md                # 本文件
```

## 📈 数据处理能力

- **记录处理**：支持 16万+ 条数据记录
- **加载性能**：<3秒 完成数据加载
- **渲染性能**：<5秒 完成页面渲染
- **文件上传**：支持最大 50MB 文件

## 🎯 业务场景

### 场景 1：日常运营监控
每日查看各渠道运费占比，快速识别异常

### 场景 2：月度运营复盘
完整查看整月数据，分析运费趋势

### 场景 3：促销活动评估
对比活动前后运费占比变化，优化活动策略

### 场景 4：渠道运营优化
横向对比各渠道表现，识别问题渠道

## 🔧 配置说明

### 后端环境变量
```bash
PORT=3000                    # 服务端口
NODE_ENV=production          # 运行环境
# MONGODB_URI=mongodb://...  # MongoDB 连接（可选）
```

### 前端环境变量
```bash
VITE_API_URL=http://localhost:3000  # 后端 API 地址
```

## 📝 开发指南

### 后端开发
```bash
cd backend
npm run dev          # 启动开发服务器（含数据）
npm run dev:empty    # 启动开发服务器（空数据）
npm run build        # 构建生产版本
npm start            # 运行生产版本
```

### 前端开发
```bash
cd frontend
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run preview      # 预览生产版本
```

## 🐛 问题排查

### 前端无法连接后端
1. 检查后端是否正常运行（http://localhost:3000）
2. 检查前端 `VITE_API_URL` 环境变量
3. 查看浏览器控制台错误信息

### 数据加载缓慢
1. 检查数据量大小
2. 查看后端日志
3. 考虑启用 MongoDB 持久化

### 文件上传失败
1. 确认文件格式（支持 .xlsx, .xls, .csv）
2. 检查文件大小（<50MB）
3. 查看后端日志了解详细错误

## 📚 文档

- [产品功能总结](./docs/产品功能总结.md) - 完整的功能介绍和业务价值
- [快速部署清单](./DEPLOYMENT.md) - 一步步部署指南
- [Zeabur 部署详细指南](./docs/Zeabur部署指南.md) - 详细的部署配置
- [系统优化说明](./docs/运营分析系统优化说明.md) - 性能优化记录

## 🛣️ 未来规划

### 短期（1-2周）
- [ ] MongoDB 持久化存储
- [ ] 数据导出功能
- [ ] 更多渠道支持
- [ ] 自定义重量段

### 中期（1-2个月）
- [ ] 用户权限管理
- [ ] 数据对比（同比、环比）
- [ ] 预警通知
- [ ] 移动端适配

### 长期（3-6个月）
- [ ] AI 预测功能
- [ ] 自动化报告
- [ ] SaaS 化改造
- [ ] ERP 系统对接

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License - 详见 [LICENSE](./LICENSE) 文件

## 👨‍💻 作者

**tom88115**
- GitHub: [@tom88115](https://github.com/tom88115)

## 🌟 Star History

如果这个项目对您有帮助，请给它一个 ⭐️ Star！

---

<div align="center">

Made with ❤️ by tom88115

[⬆ 回到顶部](#运费公斤段分析系统)

</div>
