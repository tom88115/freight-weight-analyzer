import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import uploadRoutes from './routes/uploadRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import multiDimensionRoutes from './routes/multiDimensionRoutes';
import * as XLSX from 'xlsx';
import { memoryStorage } from './storage/memoryStorage';
import { FreightRecord } from './types';

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
app.use('/api/multi-dimension', multiDimensionRoutes);

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

/**
 * 导入初始数据
 */
async function loadInitialData() {
  console.log('\n📦 正在加载初始数据...');
  
  try {
    const filePath = '../docs/报表运费10月.xlsx';
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData: any[] = XLSX.utils.sheet_to_json(worksheet);
    
    const records: FreightRecord[] = rawData
      .map((row, index): FreightRecord | null => {
        const weight = parseFloat(row['计算重量'] || row['订单商品重量'] || 0);
        const cost = parseFloat(row['运费'] || 0);
        
        if (weight <= 0 || cost <= 0 || isNaN(weight) || isNaN(cost)) {
          return null;
        }
        
        let date: Date;
        const excelDate = row['出库单时间'];
        if (typeof excelDate === 'number') {
          date = new Date((excelDate - 25569) * 86400 * 1000);
        } else {
          date = new Date(excelDate || '2024-10-01');
        }
        
        const province = row['系统收货省份'] || '';
        const city = row['系统收货城市'] || '';
        const destination = province && city ? `${province}-${city}` : (province || city || '未知');
        
        const orderAmount = parseFloat(row['订单金额'] || 0);
        
        return {
          id: `record_${Date.now()}_${index}`,
          orderNumber: String(row['物流单号'] || row['内部订单号'] || ''),
          weight,
          cost,
          destination,
          carrier: row['物流公司'] || '未知',
          date,
          weightRange: row['公斤段'] || '未知',
          platform: row['平台'] || '未知',
          orderAmount: orderAmount >= 0 ? orderAmount : 0,
          remarks: [
            row['店铺'] && `店铺:${row['店铺']}`,
            row['订单类型'] && `类型:${row['订单类型']}`,
          ].filter(Boolean).join(' | '),
        };
      })
      .filter((r: FreightRecord | null): r is FreightRecord => r !== null);
    
    await memoryStorage.insertMany(records);
    
    console.log(`✅ 成功加载 ${records.length.toLocaleString()} 条记录`);
    
    // 快速统计
    const totalCost = records.reduce((sum, r) => sum + r.cost, 0);
    console.log(`💰 总运费: ¥${totalCost.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`);
    
  } catch (error) {
    console.error('⚠️  初始数据加载失败:', error);
    console.log('💡 服务器将以空数据启动');
  }
}

// 启动服务器
async function startServer() {
  // 先加载数据
  await loadInitialData();
  
  // 然后启动服务器
  app.listen(PORT, () => {
    console.log(`\n🚀 服务器运行在 http://localhost:${PORT}`);
    console.log(`📊 API 文档: http://localhost:${PORT}/`);
    console.log(`💾 数据已加载到内存\n`);
  });
}

startServer();

export default app;

