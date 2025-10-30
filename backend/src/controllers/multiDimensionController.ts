import { Request, Response } from 'express';
import { memoryStorage } from '../storage/memoryStorage';
import { analyzeMultiDimension, analyzeDailyPlatformOverall } from '../utils/multiDimensionAnalyzer';

/**
 * 获取多维度分析数据
 * GET /api/multi-dimension
 * 
 * 返回：
 * - 汇总数据（全公斤段）
 * - 各公斤段的每日平台统计
 */
export const getMultiDimensionAnalysis = async (_req: Request, res: Response): Promise<void> => {
  try {
    // 从内存存储获取所有记录
    const allRecords = await memoryStorage.find();
    
    if (allRecords.length === 0) {
      res.json({
        success: true,
        message: '暂无数据',
        data: {
          summary: {
            totalOrders: 0,
            totalFreight: 0,
            totalOrderAmount: 0,
            overallFreightRatio: 0,
          },
          overall: [],
          byWeightRange: [],
          dateRange: {
            start: new Date().toISOString().split('T')[0],
            end: new Date().toISOString().split('T')[0],
          },
        },
      });
      return;
    }
    
    // 执行多维度分析
    const multiDimension = analyzeMultiDimension(allRecords);
    
    // 获取汇总（全公斤段）的每日平台统计
    const overallStats = analyzeDailyPlatformOverall(allRecords);
    
    res.json({
      success: true,
      data: {
        summary: multiDimension.summary,
        overall: overallStats,           // 汇总：全公斤段的每日平台数据
        byWeightRange: multiDimension.byWeightRange,  // 各公斤段明细
        dateRange: multiDimension.dateRange,
      },
    });
  } catch (error) {
    console.error('多维度分析错误:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '多维度分析失败',
    });
  }
};

/**
 * 获取指定重量段的分析数据
 * GET /api/multi-dimension/weight-range/:range
 */
export const getWeightRangeAnalysis = async (req: Request, res: Response): Promise<void> => {
  try {
    const { range } = req.params;
    
    const allRecords = await memoryStorage.find();
    const rangeRecords = allRecords.filter(r => r.weightRange === range);
    
    if (rangeRecords.length === 0) {
      res.json({
        success: true,
        message: `重量段 ${range} 暂无数据`,
        data: {
          weightRange: range,
          stats: [],
          subtotal: {
            orderCount: 0,
            totalFreight: 0,
            totalOrderAmount: 0,
            freightRatio: 0,
          },
        },
      });
      return;
    }
    
    const dailyStats = analyzeDailyPlatformOverall(rangeRecords);
    
    const subtotal = {
      orderCount: rangeRecords.length,
      totalFreight: rangeRecords.reduce((sum, r) => sum + r.cost, 0),
      totalOrderAmount: rangeRecords.reduce((sum, r) => sum + (r.orderAmount || 0), 0),
      freightRatio: 0,
    };
    subtotal.freightRatio = subtotal.totalOrderAmount > 0 
      ? (subtotal.totalFreight / subtotal.totalOrderAmount) * 100 
      : 0;
    
    res.json({
      success: true,
      data: {
        weightRange: range,
        stats: dailyStats,
        subtotal,
      },
    });
  } catch (error) {
    console.error('重量段分析错误:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '重量段分析失败',
    });
  }
};

