import { FreightRecord, DailyPlatformStats, MultiDimensionAnalysis } from '../types';
import { getAllWeightRangeLabels } from './weightRangeCalculator';

/**
 * 多维度分析：按日期、平台、公斤段
 */
export function analyzeMultiDimension(records: FreightRecord[]): MultiDimensionAnalysis {
  if (records.length === 0) {
    return {
      summary: {
        totalOrders: 0,
        totalFreight: 0,
        totalOrderAmount: 0,
        overallFreightRatio: 0,
      },
      byWeightRange: [],
      dateRange: {
        start: new Date().toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
      },
    };
  }

  // 计算总体数据
  let totalOrders = records.length;
  let totalFreight = 0;
  let totalOrderAmount = 0;
  let minDate = new Date();
  let maxDate = new Date(0);

  for (const record of records) {
    totalFreight += record.cost;
    totalOrderAmount += record.orderAmount || 0;
    
    const recordDate = new Date(record.date);
    if (recordDate < minDate) minDate = recordDate;
    if (recordDate > maxDate) maxDate = recordDate;
  }

  const overallFreightRatio = totalOrderAmount > 0 
    ? (totalFreight / totalOrderAmount) * 100 
    : 0;

  // 按重量段分组
  const weightRanges = getAllWeightRangeLabels();
  const byWeightRange = weightRanges.map(weightRange => {
    // 筛选该重量段的记录
    const rangeRecords = records.filter(r => r.weightRange === weightRange);
    
    if (rangeRecords.length === 0) {
      return {
        weightRange,
        stats: [],
        subtotal: {
          orderCount: 0,
          totalFreight: 0,
          totalOrderAmount: 0,
          freightRatio: 0,
        },
      };
    }

    // 按日期+平台分组统计
    const dailyPlatformMap = new Map<string, DailyPlatformStats>();
    
    for (const record of rangeRecords) {
      const dateStr = new Date(record.date).toISOString().split('T')[0];
      const platform = record.platform || '未知';
      const key = `${dateStr}_${platform}`;
      
      if (!dailyPlatformMap.has(key)) {
        dailyPlatformMap.set(key, {
          date: dateStr,
          platform,
          orderCount: 0,
          totalFreight: 0,
          totalOrderAmount: 0,
          freightRatio: 0,
          weightRange,
        });
      }
      
      const stat = dailyPlatformMap.get(key)!;
      stat.orderCount++;
      stat.totalFreight += record.cost;
      stat.totalOrderAmount += record.orderAmount || 0;
    }
    
    // 计算每个统计项的运费占比
    const stats = Array.from(dailyPlatformMap.values()).map(stat => ({
      ...stat,
      freightRatio: stat.totalOrderAmount > 0 
        ? (stat.totalFreight / stat.totalOrderAmount) * 100 
        : 0,
    }));
    
    // 按日期排序
    stats.sort((a, b) => a.date.localeCompare(b.date));
    
    // 计算小计
    const subtotalOrderCount = rangeRecords.length;
    const subtotalFreight = rangeRecords.reduce((sum, r) => sum + r.cost, 0);
    const subtotalOrderAmount = rangeRecords.reduce((sum, r) => sum + (r.orderAmount || 0), 0);
    const subtotalFreightRatio = subtotalOrderAmount > 0 
      ? (subtotalFreight / subtotalOrderAmount) * 100 
      : 0;
    
    return {
      weightRange,
      stats,
      subtotal: {
        orderCount: subtotalOrderCount,
        totalFreight: subtotalFreight,
        totalOrderAmount: subtotalOrderAmount,
        freightRatio: subtotalFreightRatio,
      },
    };
  }).filter(item => item.stats.length > 0); // 只返回有数据的重量段

  return {
    summary: {
      totalOrders,
      totalFreight,
      totalOrderAmount,
      overallFreightRatio,
    },
    byWeightRange,
    dateRange: {
      start: minDate.toISOString().split('T')[0],
      end: maxDate.toISOString().split('T')[0],
    },
  };
}

/**
 * 汇总全公斤段的每日平台统计（不分重量段）
 */
export function analyzeDailyPlatformOverall(records: FreightRecord[]): DailyPlatformStats[] {
  const dailyPlatformMap = new Map<string, DailyPlatformStats>();
  
  for (const record of records) {
    const dateStr = new Date(record.date).toISOString().split('T')[0];
    const platform = record.platform || '未知';
    const key = `${dateStr}_${platform}`;
    
    if (!dailyPlatformMap.has(key)) {
      dailyPlatformMap.set(key, {
        date: dateStr,
        platform,
        orderCount: 0,
        totalFreight: 0,
        totalOrderAmount: 0,
        freightRatio: 0,
      });
    }
    
    const stat = dailyPlatformMap.get(key)!;
    stat.orderCount++;
    stat.totalFreight += record.cost;
    stat.totalOrderAmount += record.orderAmount || 0;
  }
  
  // 计算运费占比并排序
  const stats = Array.from(dailyPlatformMap.values()).map(stat => ({
    ...stat,
    freightRatio: stat.totalOrderAmount > 0 
      ? (stat.totalFreight / stat.totalOrderAmount) * 100 
      : 0,
  }));
  
  stats.sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.platform.localeCompare(b.platform);
  });
  
  return stats;
}

