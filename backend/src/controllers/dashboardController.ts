import { Request, Response } from 'express';
import { memoryStorage } from '../storage/memoryStorage';
import { getWeightRange } from '../utils/weightRangeCalculator';

/**
 * 渠道趋势数据（每个渠道每天的运费占比）
 */
interface ChannelTrend {
  date: string;
  channels: {
    [channel: string]: {
      freightRatio: number;      // 运费占比（%）
      orderAmount: number;        // 订单金额
      freight: number;            // 运费
      orderCount: number;         // 订单数
    };
  };
}

/**
 * 渠道汇总数据
 */
interface ChannelSummary {
  channel: string;
  salesRatio: number;            // 销售额占比（%）
  totalOrderAmount: number;      // 总订单金额
  totalFreight: number;          // 总运费
  avgFreightRatio: number;       // 平均运费占比（%）
  orderCount: number;            // 订单数
}

/**
 * 公斤段分布（每个渠道的公斤段运费占比）
 */
interface WeightDistribution {
  channel: string;
  weights: {
    [weightRange: string]: {
      freight: number;           // 该公斤段运费
      freightRatio: number;      // 占该渠道总运费的比例（%）
      orderCount: number;        // 订单数
      avgFreight: number;        // 平均运费
    };
  };
}

/**
 * 仪表板数据响应
 */
interface DashboardData {
  summary: {
    totalOrderAmount: number;
    totalFreight: number;
    overallFreightRatio: number;
    orderCount: number;
    dateRange: { start: string; end: string };
  };
  channelTrends: ChannelTrend[];
  channelSummaries: ChannelSummary[];
  weightDistributions: WeightDistribution[];
}

// 简单缓存
let dashboardCache: {
  data: DashboardData;
  timestamp: number;
  recordCount: number;
} | null = null;

const CACHE_TTL = 60000; // 60秒

/**
 * 获取仪表板数据
 * GET /api/dashboard
 * 
 * 返回运营分析所需的核心数据：
 * 1. 渠道趋势（多天运费占比变化）
 * 2. 渠道汇总（销售额占比、平均运费占比）
 * 3. 公斤段分布（各渠道的公斤段运费占比）
 */
export const getDashboardData = async (_req: Request, res: Response): Promise<void> => {
  try {
    console.time('⏱️  仪表板数据计算');
    
    const allRecords = await memoryStorage.find();
    
    if (allRecords.length === 0) {
      res.json({
        success: true,
        message: '暂无数据',
        data: null,
      });
      return;
    }

    // 检查缓存
    const now = Date.now();
    if (
      dashboardCache && 
      dashboardCache.recordCount === allRecords.length &&
      (now - dashboardCache.timestamp) < CACHE_TTL
    ) {
      console.log('✅ 使用缓存数据');
      console.timeEnd('⏱️  仪表板数据计算');
      res.json({
        success: true,
        data: dashboardCache.data,
        cached: true,
      });
      return;
    }

    console.log('🔄 计算仪表板数据...');

    // ==================== 第一步：数据预处理 ====================
    // 排除指定渠道，并重命名"头条放心购"为"抖音"
    const excludedPlatforms = ['微盟', '微商城', '一定货'];
    const records = allRecords
      .filter(r => {
        const platform = r.platform || '未知';
        return !excludedPlatforms.includes(platform);
      })
      .map(r => {
        let platform = r.platform || '未知';
        // 重命名"头条放心购"为"抖音"
        if (platform === '头条放心购') {
          platform = '抖音';
        }
        return {
          platform,
          date: new Date(r.date).toISOString().split('T')[0],
          cost: r.cost,
          orderAmount: r.orderAmount || 0,
          weightRange: r.weightRange || getWeightRange(r.weight),
        };
      });

    // 获取所有唯一渠道
    const allChannels = Array.from(new Set(records.map(r => r.platform)));
    
    // 获取所有唯一日期并排序
    const allDates = Array.from(new Set(records.map(r => r.date))).sort();

    // ==================== 第二步：计算渠道趋势 ====================
    const channelTrends: ChannelTrend[] = [];
    
    for (const date of allDates) {
      const dateRecords = records.filter(r => r.date === date);
      const trend: ChannelTrend = {
        date,
        channels: {},
      };

      for (const channel of allChannels) {
        const channelRecords = dateRecords.filter(r => r.platform === channel);
        if (channelRecords.length === 0) continue;

        const orderAmount = channelRecords.reduce((sum, r) => sum + r.orderAmount, 0);
        const freight = channelRecords.reduce((sum, r) => sum + r.cost, 0);

        trend.channels[channel] = {
          freightRatio: orderAmount > 0 ? (freight / orderAmount) * 100 : 0,
          orderAmount,
          freight,
          orderCount: channelRecords.length,
        };
      }

      channelTrends.push(trend);
    }

    // ==================== 第三步：计算渠道汇总 ====================
    const totalOrderAmount = records.reduce((sum, r) => sum + r.orderAmount, 0);
    const channelSummaries: ChannelSummary[] = [];

    for (const channel of allChannels) {
      const channelRecords = records.filter(r => r.platform === channel);
      const orderAmount = channelRecords.reduce((sum, r) => sum + r.orderAmount, 0);
      const freight = channelRecords.reduce((sum, r) => sum + r.cost, 0);

      channelSummaries.push({
        channel,
        salesRatio: totalOrderAmount > 0 ? (orderAmount / totalOrderAmount) * 100 : 0,
        totalOrderAmount: orderAmount,
        totalFreight: freight,
        avgFreightRatio: orderAmount > 0 ? (freight / orderAmount) * 100 : 0,
        orderCount: channelRecords.length,
      });
    }

    // 按销售额占比排序
    channelSummaries.sort((a, b) => b.salesRatio - a.salesRatio);

    // ==================== 第四步：计算公斤段分布 ====================
    const weightDistributions: WeightDistribution[] = [];

    for (const channel of allChannels) {
      const channelRecords = records.filter(r => r.platform === channel);
      const totalChannelFreight = channelRecords.reduce((sum, r) => sum + r.cost, 0);

      const distribution: WeightDistribution = {
        channel,
        weights: {},
      };

      // 按重量段分组
      const weightGroups = new Map<string, typeof records>();
      for (const record of channelRecords) {
        const range = record.weightRange;
        if (!weightGroups.has(range)) {
          weightGroups.set(range, []);
        }
        weightGroups.get(range)!.push(record);
      }

      // 计算每个公斤段的统计
      for (const [weightRange, rangeRecords] of weightGroups) {
        const freight = rangeRecords.reduce((sum, r) => sum + r.cost, 0);
        
        distribution.weights[weightRange] = {
          freight,
          freightRatio: totalChannelFreight > 0 ? (freight / totalChannelFreight) * 100 : 0,
          orderCount: rangeRecords.length,
          avgFreight: rangeRecords.length > 0 ? freight / rangeRecords.length : 0,
        };
      }

      weightDistributions.push(distribution);
    }

    // ==================== 第五步：整体汇总 ====================
    const totalFreight = records.reduce((sum, r) => sum + r.cost, 0);
    const dashboardData: DashboardData = {
      summary: {
        totalOrderAmount,
        totalFreight,
        overallFreightRatio: totalOrderAmount > 0 ? (totalFreight / totalOrderAmount) * 100 : 0,
        orderCount: records.length,
        dateRange: {
          start: allDates[0],
          end: allDates[allDates.length - 1],
        },
      },
      channelTrends,
      channelSummaries,
      weightDistributions,
    };

    // 更新缓存
    dashboardCache = {
      data: dashboardData,
      timestamp: Date.now(),
      recordCount: allRecords.length,
    };

    console.log('✅ 仪表板数据计算完成');
    console.timeEnd('⏱️  仪表板数据计算');

    res.json({
      success: true,
      data: dashboardData,
      cached: false,
    });
  } catch (error) {
    console.error('生成仪表板数据错误:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '生成仪表板数据失败',
    });
  }
};

