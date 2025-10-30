import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import uploadRoutes from './routes/uploadRoutes';
import analyticsRoutes from './routes/analyticsRoutes';

// 加载环境变量
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.use('/api/upload', uploadRoutes);
app.use('/api/analytics', analyticsRoutes);

// 健康检查
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// 根路径
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: '运费公斤段分析系统 API',
    version: '1.0.0',
    endpoints: {
      upload: '/api/upload',
      analytics: '/api/analytics',
      records: '/api/analytics/records',
      health: '/health',
    },
  });
});

// 错误处理中间件
app.use((err: any, _req: Request, res: Response, _next: any) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    success: false,
    message: err.message || '服务器内部错误',
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
  console.log(`📊 API 文档: http://localhost:${PORT}/`);
  console.log(`💾 使用内存存储（数据不会持久化）`);
});

export default app;

