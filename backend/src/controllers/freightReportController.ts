import { Request, Response } from 'express';
import { memoryStorage } from '../storage/memoryStorage';
import { getAllWeightRangeLabels } from '../utils/weightRangeCalculator';

interface PlatformMetrics {
  salesRatio: number;
  orderAmount: number;
  freight: number;
  freightRatio: number;
  orderCount: number;
  remarks?: string;
}

interface DailyReport {
  date: string;
  weightRange: string;
  platforms: {
    [platform: string]: PlatformMetrics;
  };
}

// 简单的内存缓存
let reportCache: {
  data: any;
  timestamp: number;
  recordCount: number;
} | null = null;

const CACHE_TTL = 60000; // 缓存60秒

/**
 * 生成运费分析报表
 * GET /api/freight-report
 * 
 * 按日期+重量段+平台展示，类似Excel模板
 * 支持缓存机制提升性能
 */
export const getFreightReport = async (_req: Request, res: Response): Promise<void> => {
  try {
    const allRecords = await memoryStorage.find();
    
    if (allRecords.length === 0) {
      res.json({
        success: true,
        message: '暂无数据',
        data: {
          dailyReports: [],
          summary: null,
        },
      });
      return;
    }

    // 检查缓存是否有效
    const now = Date.now();
    if (
      reportCache && 
      reportCache.recordCount === allRecords.length &&
      (now - reportCache.timestamp) < CACHE_TTL
    ) {
      console.log('✅ 使用缓存数据，剩余有效期:', Math.floor((CACHE_TTL - (now - reportCache.timestamp)) / 1000), '秒');
      res.json({
        success: true,
        data: reportCache.data,
        cached: true,
      });
      return;
    }

    console.log('🔄 缓存失效或数据已更新，重新计算报表...');

    // 获取所有平台
    const allPlatforms = Array.from(new Set(allRecords.map(r => r.platform || '未知')));
    
    // 获取所有日期
    const allDates = Array.from(new Set(
      allRecords.map(r => new Date(r.date).toISOString().split('T')[0])
    )).sort();
    
    // 获取所有重量段（包括"全公斤段"）
    const weightRanges = ['全公斤段', ...getAllWeightRangeLabels()];
    
    // 计算总订单金额和总运费（用于计算销售额占比）
    const dailyTotals = new Map<string, { orderAmount: number; freight: number }>();
    
    for (const record of allRecords) {
      const dateStr = new Date(record.date).toISOString().split('T')[0];
      if (!dailyTotals.has(dateStr)) {
        dailyTotals.set(dateStr, { orderAmount: 0, freight: 0 });
      }
      const daily = dailyTotals.get(dateStr)!;
      daily.orderAmount += record.orderAmount || 0;
      daily.freight += record.cost;
    }
    
    // 生成每日报表
    const dailyReports: DailyReport[] = [];
    
    for (const date of allDates) {
      for (const weightRange of weightRanges) {
        const report: DailyReport = {
          date,
          weightRange,
          platforms: {},
        };
        
        // 筛选该日期的记录
        const dateRecords = allRecords.filter(r => 
          new Date(r.date).toISOString().split('T')[0] === date
        );
        
        // 进一步筛选重量段
        const rangeRecords = weightRange === '全公斤段'
          ? dateRecords
          : dateRecords.filter(r => r.weightRange === weightRange);
        
        if (rangeRecords.length === 0) continue;
        
        const dayTotal = dailyTotals.get(date)!;
        
        // 按平台统计
        for (const platform of allPlatforms) {
          const platformRecords = rangeRecords.filter(r => 
            (r.platform || '未知') === platform
          );
          
          if (platformRecords.length === 0) continue;
          
          const orderAmount = platformRecords.reduce((sum, r) => sum + (r.orderAmount || 0), 0);
          const freight = platformRecords.reduce((sum, r) => sum + r.cost, 0);
          const orderCount = platformRecords.length;
          
          report.platforms[platform] = {
            salesRatio: dayTotal.orderAmount > 0 ? orderAmount / dayTotal.orderAmount : 0,
            orderAmount,
            freight,
            freightRatio: orderAmount > 0 ? freight / orderAmount : 0,
            orderCount,
          };
        }
        
        dailyReports.push(report);
      }
    }
    
    // 计算汇总数据
    const totalOrderAmount = allRecords.reduce((sum, r) => sum + (r.orderAmount || 0), 0);
    const totalFreight = allRecords.reduce((sum, r) => sum + r.cost, 0);
    const overallFreightRatio = totalOrderAmount > 0 ? totalFreight / totalOrderAmount : 0;
    
    // 各平台汇总
    const platformSummary: {
      [platform: string]: {
        orderAmount: number;
        freight: number;
        salesRatio: number;
        freightRatio: number;
      };
    } = {};
    
    for (const platform of allPlatforms) {
      const platformRecords = allRecords.filter(r => 
        (r.platform || '未知') === platform
      );
      
      const orderAmount = platformRecords.reduce((sum, r) => sum + (r.orderAmount || 0), 0);
      const freight = platformRecords.reduce((sum, r) => sum + r.cost, 0);
      
      platformSummary[platform] = {
        orderAmount,
        freight,
        salesRatio: totalOrderAmount > 0 ? orderAmount / totalOrderAmount : 0,
        freightRatio: orderAmount > 0 ? freight / orderAmount : 0,
      };
    }
    
    const responseData = {
      dailyReports,
      summary: {
        totalOrderAmount,
        totalFreight,
        overallFreightRatio,
        platformSummary,
      },
    };

    // 更新缓存
    reportCache = {
      data: responseData,
      timestamp: Date.now(),
      recordCount: allRecords.length,
    };
    
    console.log('✅ 报表计算完成，已缓存，有效期:', CACHE_TTL / 1000, '秒');

    res.json({
      success: true,
      data: responseData,
      cached: false,
    });
  } catch (error) {
    console.error('生成运费报表错误:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '生成报表失败',
    });
  }
};

