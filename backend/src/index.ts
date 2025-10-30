import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
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
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// 根路径
app.get('/', (req: Request, res: Response) => {
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
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    success: false,
    message: err.message || '服务器内部错误',
  });
});

// 数据库连接
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/freight-analyzer';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB 连接成功');
  } catch (error) {
    console.error('❌ MongoDB 连接失败:', error);
    // 即使数据库连接失败，服务器也可以启动（用于测试）
    console.log('⚠️  服务器将在没有数据库的情况下运行');
  }
};

// 启动服务器
const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
    console.log(`📊 API 文档: http://localhost:${PORT}/`);
  });
};

startServer();

export default app;

