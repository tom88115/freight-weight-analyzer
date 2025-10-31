import { useState, useEffect, useMemo } from 'react';
import { Table, Spin, message, Card, Row, Col, Statistic, Progress, Divider, Button, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { LoadingOutlined, LineChartOutlined, SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons';
import * as echarts from 'echarts';
import axios from 'axios';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

dayjs.locale('zh-cn');

// ===================== 渠道Logo映射（使用可靠的SVG图标） =====================
const CHANNEL_LOGOS: { [key: string]: string } = {
  '拼多多': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHJ4PSI2IiBmaWxsPSIjRTAyRTI0Ii8+PHRleHQgeD0iNTAlIiB5PSI1NSUiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+5ou8PC90ZXh0Pjwvc3ZnPg==',
  '淘宝天猫': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHJ4PSI2IiBmaWxsPSIjRkY2NjAwIi8+PHRleHQgeD0iNTAlIiB5PSI1NSUiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+5reYPC90ZXh0Pjwvc3ZnPg==',
  '抖音': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHJ4PSI2IiBmaWxsPSIjMDAwMDAwIi8+PHRleHQgeD0iNTAlIiB5PSI1NSUiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+5oqWPC90ZXh0Pjwvc3ZnPg==',
  '京东商城': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHJ4PSI2IiBmaWxsPSIjRTMwMDFCIi8+PHRleHQgeD0iNTAlIiB5PSI1NSUiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+5LqsPC90ZXh0Pjwvc3ZnPg==',
};

// ===================== 公斤段定义 =====================
const WEIGHT_SEGMENTS = [
  { key: '2.4-2.6', label: '2.4-2.6kg', min: 2.4, max: 2.6, desc: '单包猫砂' },
  { key: '4.6-5.2', label: '4.6-5.2kg', min: 4.6, max: 5.2, desc: '双包猫砂' },
  { key: '9.6-11', label: '9.6-11kg', min: 9.6, max: 11, desc: '四包猫砂' },
  { key: '14-16', label: '14-16kg', min: 14, max: 16, desc: '六包猫砂' },
];

// ===================== 类型定义 =====================
interface ChannelTrendDay {
  date: string;
  channels: {
    [channel: string]: {
      freightRatio: number;
      orderAmount: number;
      freight: number;
      orderCount: number;
    };
  };
}

interface ChannelSummary {
  channel: string;
  salesRatio: number;
  totalOrderAmount: number;
  totalFreight: number;
  avgFreightRatio: number;
  orderCount: number;
}

interface DashboardData {
  summary: {
    totalOrderAmount: number;
    totalFreight: number;
    overallFreightRatio: number;
    orderCount: number;
    dateRange: { start: string; end: string };
  };
  channelTrends: ChannelTrendDay[];
  channelSummaries: ChannelSummary[];
}

interface TableDataRow {
  key: string;
  date: string;
  dateDisplay: string;
  weekday: string;
  [key: string]: any;
}

// ===================== 工具函数 =====================
/**
 * 数字格式化：万元显示（保留一位小数）或添加千位符
 */
const formatCurrency = (value: number, channel?: string): string => {
  if (!value) return '-';
  
  // 京东商城：直接显示数字 + 千位符
  if (channel === '京东商城') {
    return value.toLocaleString('zh-CN', { maximumFractionDigits: 0 });
  }
  
  // 其他渠道：万元显示（保留一位小数）
  if (value >= 10000) {
    return `${(value / 10000).toFixed(1)}万`;
  }
  return value.toLocaleString('zh-CN', { maximumFractionDigits: 0 });
};

/**
 * 订单数格式化：添加千位符
 */
const formatOrderCount = (value: number): string => {
  if (!value) return '-';
  return value.toLocaleString('zh-CN');
};

/**
 * 获取星期几（中文）
 */
const getWeekday = (dateStr: string): string => {
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const date = dayjs(dateStr);
  return weekdays[date.day()];
};

/**
 * 获取渠道内运费占比的颜色（基于该渠道的百分位数）- 优化对比度
 */
const getChannelFreightRatioColor = (ratio: number, allRatios: number[]): string => {
  if (allRatios.length === 0) return '#389e0d'; // 深绿色
  
  const sorted = [...allRatios].sort((a, b) => a - b);
  const p33 = sorted[Math.floor(sorted.length * 0.33)];
  const p66 = sorted[Math.floor(sorted.length * 0.66)];
  
  if (ratio <= p33) return '#389e0d'; // 深绿色：低于33%分位
  if (ratio <= p66) return '#d48806'; // 深黄色：33%-66%分位
  return '#cf1322'; // 红色：高于66%分位
};

/**
 * 获取渠道内运费占比的背景色
 */
const getChannelFreightRatioBgColor = (ratio: number, allRatios: number[]): string => {
  if (allRatios.length === 0) return '#f6ffed';
  
  const sorted = [...allRatios].sort((a, b) => a - b);
  const p33 = sorted[Math.floor(sorted.length * 0.33)];
  const p66 = sorted[Math.floor(sorted.length * 0.66)];
  
  if (ratio <= p33) return '#f6ffed'; // 浅绿背景
  if (ratio <= p66) return '#fffbe6'; // 浅黄背景
  return '#fff1f0'; // 浅红背景
};

// ===================== 主组件 =====================
const OperationsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState('初始化...');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [data, setData] = useState<DashboardData | null>(null);
  const [rawRecords, setRawRecords] = useState<any[]>([]); // 存储原始记录用于筛选
  const [dateOrder, setDateOrder] = useState<'asc' | 'desc'>('desc'); // 默认倒序
  const [selectedWeightSegment, setSelectedWeightSegment] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setLoadingProgress(0);
    setLoadingStep('正在连接服务器...');
    
    try {
      setLoadingProgress(30);
      setLoadingStep('正在获取数据...');
      
      // 获取仪表板数据
      const dashboardResponse = await axios.get('http://localhost:3000/api/dashboard', {
        timeout: 30000,
      });
      
      setLoadingProgress(60);
      setLoadingStep('正在获取原始记录...');
      
      // 获取原始记录用于公斤段筛选（不分页，获取所有记录）
      const recordsResponse = await axios.get('http://localhost:3000/api/analytics/records', {
        params: { limit: 999999 }, // 获取所有记录
        timeout: 30000,
      });
      
      setLoadingProgress(80);
      setLoadingStep('正在处理数据...');
      
      if (dashboardResponse.data.success) {
        setData(dashboardResponse.data.data);
        if (recordsResponse.data.success) {
          setRawRecords(recordsResponse.data.data || []);
        }
        setLoadingProgress(100);
        setLoadingStep('加载完成！');
        message.success(`成功加载 ${dashboardResponse.data.data.summary.orderCount.toLocaleString()} 条订单数据`);
      } else {
        message.error('获取数据失败');
      }
    } catch (error: any) {
      console.error('获取数据错误:', error);
      if (error.code === 'ECONNABORTED') {
        message.error('请求超时，请检查后端服务');
      } else {
        message.error('无法连接到后端服务');
      }
    } finally {
      setLoading(false);
    }
  };

  // ==================== 按公斤段筛选数据 ====================
  const filteredData = useMemo(() => {
    if (!data || !selectedWeightSegment) return data;
    
    const segment = WEIGHT_SEGMENTS.find(s => s.key === selectedWeightSegment);
    if (!segment || rawRecords.length === 0) return data;

    // 需要排除的渠道
    const excludedChannels = ['微盟', '微商城', '微盟微商城', '易订货', '微信视频号', '小红书', '快手电商'];
    
    // 首先统计每个渠道在所有公斤段的总订单数（用于计算订单比例）
    const allChannelDailyTotalOrders = new Map<string, Map<string, number>>(); // date -> channel -> totalOrderCount
    rawRecords.forEach((record: any) => {
      const platform = record.platform || '未知';
      if (excludedChannels.includes(platform)) return;
      
      let channel = platform;
      if (channel === '头条放心购') channel = '抖音';
      
      const date = new Date(record.date).toISOString().split('T')[0];
      
      if (!allChannelDailyTotalOrders.has(date)) {
        allChannelDailyTotalOrders.set(date, new Map());
      }
      const channelMap = allChannelDailyTotalOrders.get(date)!;
      channelMap.set(channel, (channelMap.get(channel) || 0) + 1);
    });
    
    // 筛选符合公斤段的记录，并排除不需要的渠道
    const filteredRecords = rawRecords.filter((record: any) => {
      const weight = record.weight;
      const platform = record.platform || '未知';
      
      // 排除不需要的渠道
      if (excludedChannels.includes(platform)) return false;
      
      // 筛选公斤段
      return weight >= segment.min && weight <= segment.max;
    });

    if (filteredRecords.length === 0) {
      message.warning(`${segment.label} 暂无数据`);
      return data;
    }

    // 重新计算该公斤段的统计数据
    const dateMap = new Map<string, Map<string, { orderAmount: number; freight: number; orderCount: number }>>();
    const channelTotals = new Map<string, { orderAmount: number; freight: number; orderCount: number }>();
    let totalOrderAmount = 0;
    let totalFreight = 0;
    let totalOrderCount = 0;

    filteredRecords.forEach((record: any) => {
      const date = new Date(record.date).toISOString().split('T')[0];
      let channel = record.platform || '未知';
      
      // 重命名"头条放心购"为"抖音"
      if (channel === '头条放心购') {
        channel = '抖音';
      }
      
      const orderAmount = record.orderAmount || 0;
      const freight = record.cost || 0;

      // 按日期和渠道分组
      if (!dateMap.has(date)) {
        dateMap.set(date, new Map());
      }
      const channelMap = dateMap.get(date)!;
      if (!channelMap.has(channel)) {
        channelMap.set(channel, { orderAmount: 0, freight: 0, orderCount: 0 });
      }
      const stats = channelMap.get(channel)!;
      stats.orderAmount += orderAmount;
      stats.freight += freight;
      stats.orderCount += 1;

      // 渠道总计
      if (!channelTotals.has(channel)) {
        channelTotals.set(channel, { orderAmount: 0, freight: 0, orderCount: 0 });
      }
      const channelTotal = channelTotals.get(channel)!;
      channelTotal.orderAmount += orderAmount;
      channelTotal.freight += freight;
      channelTotal.orderCount += 1;

      // 全局总计
      totalOrderAmount += orderAmount;
      totalFreight += freight;
      totalOrderCount += 1;
    });

    // 构建新的 channelTrends（包含订单数占比）
    const newChannelTrends: ChannelTrendDay[] = [];
    const sortedDates = Array.from(dateMap.keys()).sort();
    
    for (const date of sortedDates) {
      const channelMap = dateMap.get(date)!;
      const channels: { [key: string]: any } = {};
      
      for (const [channel, stats] of channelMap) {
        // 获取该渠道当天所有公斤段的总订单数
        const channelTotalOrderCount = allChannelDailyTotalOrders.get(date)?.get(channel) || 0;
        
        channels[channel] = {
          orderAmount: stats.orderAmount,
          freight: stats.freight,
          orderCount: stats.orderCount,
          freightRatio: stats.orderAmount > 0 ? (stats.freight / stats.orderAmount) * 100 : 0,
          orderCountRatio: channelTotalOrderCount > 0 ? (stats.orderCount / channelTotalOrderCount) * 100 : 0, // 新增：订单数占比
        };
      }
      
      newChannelTrends.push({ date, channels });
    }

    // 构建新的 channelSummaries
    const newChannelSummaries: ChannelSummary[] = [];
    for (const [channel, totals] of channelTotals) {
      newChannelSummaries.push({
        channel,
        salesRatio: totalOrderAmount > 0 ? (totals.orderAmount / totalOrderAmount) * 100 : 0,
        totalOrderAmount: totals.orderAmount,
        totalFreight: totals.freight,
        avgFreightRatio: totals.orderAmount > 0 ? (totals.freight / totals.orderAmount) * 100 : 0,
        orderCount: totals.orderCount,
      });
    }

    // 按销售额占比排序
    newChannelSummaries.sort((a, b) => b.salesRatio - a.salesRatio);

    return {
      summary: {
        totalOrderAmount,
        totalFreight,
        overallFreightRatio: totalOrderAmount > 0 ? (totalFreight / totalOrderAmount) * 100 : 0,
        orderCount: totalOrderCount,
        dateRange: data.summary.dateRange,
      },
      channelTrends: newChannelTrends,
      channelSummaries: newChannelSummaries,
    };
  }, [data, selectedWeightSegment, rawRecords]);

  // ==================== 计算表格数据 ====================
  const tableData = useMemo(() => {
    if (!filteredData) return [];

    const { channelTrends } = filteredData;
    const tableData: TableDataRow[] = [];

    for (const trend of channelTrends) {
      const row: TableDataRow = {
        key: trend.date,
        date: trend.date,
        dateDisplay: dayjs(trend.date).format('MM-DD'),
        weekday: getWeekday(trend.date),
      };

      for (const [channel, stats] of Object.entries(trend.channels)) {
        row[`${channel}_orderAmount`] = stats.orderAmount;
        row[`${channel}_freight`] = stats.freight;
        row[`${channel}_freightRatio`] = stats.freightRatio;
        row[`${channel}_orderCount`] = stats.orderCount;
      }

      tableData.push(row);
    }

    // 日期排序
    return tableData.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }, [filteredData, dateOrder]);

  // ==================== 计算表格列 ====================
  const tableColumns = useMemo((): ColumnsType<TableDataRow> => {
    if (!filteredData) return [];

    const columns: ColumnsType<TableDataRow> = [
      {
        title: (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>日期</span>
            <Button
              type="link"
              size="small"
              icon={dateOrder === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
              onClick={() => setDateOrder(dateOrder === 'asc' ? 'desc' : 'asc')}
            />
          </div>
        ),
        dataIndex: 'dateDisplay',
        key: 'date',
        fixed: 'left',
        width: 100,
        align: 'center',
        render: (text: string, record: TableDataRow) => (
          <div style={{ lineHeight: '1.3' }}>
            {text} 周{record.weekday}
          </div>
        ),
      },
    ];

    const sortedChannels = [...filteredData.channelSummaries].sort((a, b) => b.salesRatio - a.salesRatio);

    for (const summary of sortedChannels) {
      const channel = summary.channel;
      
      const channelRatios = filteredData.channelTrends
        .map(t => t.channels[channel]?.freightRatio)
        .filter((r): r is number => r !== undefined);

      columns.push({
        title: (
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
              <img 
                src={CHANNEL_LOGOS[channel]} 
                alt={channel} 
                style={{ width: 24, height: 24, marginRight: 6 }}
              />
              <strong style={{ fontSize: '14px' }}>{channel}</strong>
            </div>
            {/* 横向排列两个数据 */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '12px',
              fontSize: '12px',
              color: '#666',
              marginBottom: 6,
            }}>
              <span>销售额占比 {summary.salesRatio.toFixed(1)}%</span>
              <span>月均运费占比 {summary.avgFreightRatio.toFixed(2)}%</span>
            </div>
            {/* 运费占比趋势图 */}
            <div style={{ marginBottom: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '11px', color: '#999', textAlign: 'center', marginBottom: 2 }}>运费占比趋势</div>
              <div 
                id={`freight-ratio-trend-${channel}-${selectedWeightSegment || 'total'}`}
                style={{ width: '260px', height: 50, position: 'relative' }}
              />
            </div>
            {/* 订单金额趋势图 */}
            <div style={{ marginBottom: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '11px', color: '#999', textAlign: 'center', marginBottom: 2 }}>订单金额趋势</div>
              <div 
                id={`order-amount-trend-${channel}-${selectedWeightSegment || 'total'}`}
                style={{ width: '260px', height: 50, position: 'relative' }}
              />
            </div>
            {/* 渠道内运单占比趋势图（仅在公斤段筛选时显示） */}
            {selectedWeightSegment && (
              <div style={{ marginBottom: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: '11px', color: '#999', textAlign: 'center', marginBottom: 2 }}>渠道内运单占比趋势</div>
                <div 
                  id={`order-count-ratio-trend-${channel}-${selectedWeightSegment}`}
                  style={{ width: '260px', height: 50, position: 'relative' }}
                />
              </div>
            )}
          </div>
        ),
        key: channel,
        align: 'center',
        children: [
          {
            title: '订单金额',
            dataIndex: `${channel}_orderAmount`,
            key: `${channel}_orderAmount`,
            align: 'right',
            width: 90,
            render: (value: number) => formatCurrency(value, channel),
          },
          {
            title: '运费',
            dataIndex: `${channel}_freight`,
            key: `${channel}_freight`,
            align: 'right',
            width: 80,
            render: (value: number) => formatCurrency(value, channel),
          },
          {
            title: '运费占比',
            dataIndex: `${channel}_freightRatio`,
            key: `${channel}_freightRatio`,
            align: 'center',
            width: 90,
            render: (ratio: number) => {
              if (!ratio) return '-';
              const color = getChannelFreightRatioColor(ratio, channelRatios);
              const bgColor = getChannelFreightRatioBgColor(ratio, channelRatios);
              return (
                <span style={{ 
                  color, 
                  fontWeight: 'bold',
                  padding: '3px 8px',
                  borderRadius: 4,
                  backgroundColor: bgColor,
                  display: 'inline-block',
                  minWidth: '60px',
                }}>
                  {ratio.toFixed(2)}%
                </span>
              );
            },
          },
          {
            title: '订单数',
            dataIndex: `${channel}_orderCount`,
            key: `${channel}_orderCount`,
            align: 'center',
            width: 70,
            render: (value: number) => formatOrderCount(value),
          },
        ],
      });
    }

    return columns;
  }, [filteredData, dateOrder, selectedWeightSegment]);

  // ==================== 渲染趋势图 ====================
  useEffect(() => {
    if (!filteredData || !filteredData.channelTrends.length) return;

    const sortedChannels = [...filteredData.channelSummaries].sort((a, b) => b.salesRatio - a.salesRatio);

    setTimeout(() => {
      sortedChannels.forEach(summary => {
        const channel = summary.channel;
        const dates = filteredData.channelTrends.map(t => dayjs(t.date).format('MM-DD'));
        const ratios = filteredData.channelTrends.map(t => t.channels[channel]?.freightRatio || 0);
        const orderAmounts = filteredData.channelTrends.map(t => t.channels[channel]?.orderAmount || 0);

        // ========== 1. 运费占比趋势图（优化波动展示） ==========
        const freightRatioContainerId = `freight-ratio-trend-${channel}-${selectedWeightSegment || 'total'}`;
        const freightRatioContainer = document.getElementById(freightRatioContainerId);
        
        if (freightRatioContainer) {
          const freightRatioChart = echarts.init(freightRatioContainer);
          
          // 计算运费占比的最小值和最大值，以优化Y轴范围，突出波动
          const validRatios = ratios.filter(r => r > 0);
          const minRatio = validRatios.length > 0 ? Math.min(...validRatios) : 0;
          const maxRatio = validRatios.length > 0 ? Math.max(...validRatios) : 10;
          const padding = (maxRatio - minRatio) * 0.2; // 留出20%的空间
          const yMin = Math.max(0, minRatio - padding); // 最小值不小于0
          const yMax = maxRatio + padding;

          const freightRatioOption = {
            grid: {
              left: 8,
              right: 8,
              top: 8,
              bottom: 8,
            },
            xAxis: {
              type: 'category',
              data: dates,
              show: false,
            },
            yAxis: {
              type: 'value',
              show: false,
              min: yMin,
              max: yMax,
            },
            series: [
              {
                data: ratios,
                type: 'line',
                smooth: true,
                showSymbol: false,
                lineStyle: {
                  width: 2.5,
                  color: '#ff7a45', // 橙红色，更醒目
                },
                areaStyle: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: 'rgba(255, 122, 69, 0.4)' },
                    { offset: 1, color: 'rgba(255, 122, 69, 0.05)' },
                  ]),
                },
              },
            ],
            tooltip: {
              trigger: 'axis',
              formatter: (params: any) => {
                const param = params[0];
                return `${param.name}<br/>运费占比: ${param.value.toFixed(2)}%`;
              },
            },
          };

          freightRatioChart.setOption(freightRatioOption);
        }

        // ========== 2. 订单金额趋势图 ==========
        const orderAmountContainerId = `order-amount-trend-${channel}-${selectedWeightSegment || 'total'}`;
        const orderAmountContainer = document.getElementById(orderAmountContainerId);
        
        if (orderAmountContainer) {
          const orderAmountChart = echarts.init(orderAmountContainer);

          const orderAmountOption = {
            grid: {
              left: 8,
              right: 8,
              top: 8,
              bottom: 8,
            },
            xAxis: {
              type: 'category',
              data: dates,
              show: false,
            },
            yAxis: {
              type: 'value',
              show: false,
            },
            series: [
              {
                data: orderAmounts,
                type: 'line',
                smooth: true,
                showSymbol: false,
                lineStyle: {
                  width: 2.5,
                  color: '#52c41a', // 绿色
                },
                areaStyle: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: 'rgba(82, 196, 26, 0.4)' },
                    { offset: 1, color: 'rgba(82, 196, 26, 0.05)' },
                  ]),
                },
              },
            ],
            tooltip: {
              trigger: 'axis',
              formatter: (params: any) => {
                const param = params[0];
                return `${param.name}<br/>订单金额: ¥${param.value.toLocaleString()}`;
              },
            },
          };

          orderAmountChart.setOption(orderAmountOption);
        }

        // ========== 3. 订单数占比趋势图（仅在公斤段筛选时显示） ==========
        if (selectedWeightSegment) {
          const orderCountRatioContainerId = `order-count-ratio-trend-${channel}-${selectedWeightSegment}`;
          const orderCountRatioContainer = document.getElementById(orderCountRatioContainerId);
          
          if (orderCountRatioContainer) {
            const orderCountRatios = filteredData.channelTrends.map(t => t.channels[channel]?.orderCountRatio || 0);
            const orderCountRatioChart = echarts.init(orderCountRatioContainer);

            // 计算订单数占比的最小值和最大值，以优化Y轴范围
            const validOrderCountRatios = orderCountRatios.filter(r => r > 0);
            const minOrderCountRatio = validOrderCountRatios.length > 0 ? Math.min(...validOrderCountRatios) : 0;
            const maxOrderCountRatio = validOrderCountRatios.length > 0 ? Math.max(...validOrderCountRatios) : 10;
            const orderCountRatioPadding = (maxOrderCountRatio - minOrderCountRatio) * 0.2;
            const orderCountRatioYMin = Math.max(0, minOrderCountRatio - orderCountRatioPadding);
            const orderCountRatioYMax = maxOrderCountRatio + orderCountRatioPadding;

            const orderCountRatioOption = {
              grid: {
                left: 8,
                right: 8,
                top: 8,
                bottom: 8,
              },
              xAxis: {
                type: 'category',
                data: dates,
                show: false,
              },
              yAxis: {
                type: 'value',
                show: false,
                min: orderCountRatioYMin,
                max: orderCountRatioYMax,
              },
              series: [
                {
                  data: orderCountRatios,
                  type: 'line',
                  smooth: true,
                  showSymbol: false,
                  lineStyle: {
                    width: 2.5,
                    color: '#722ed1', // 紫色
                  },
                  areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                      { offset: 0, color: 'rgba(114, 46, 209, 0.4)' },
                      { offset: 1, color: 'rgba(114, 46, 209, 0.05)' },
                    ]),
                  },
                },
              ],
              tooltip: {
                trigger: 'axis',
                formatter: (params: any) => {
                  const param = params[0];
                  return `${param.name}<br/>订单数占比: ${param.value.toFixed(2)}%`;
                },
              },
            };

            orderCountRatioChart.setOption(orderCountRatioOption);
          }
        }
      });
    }, 100);
  }, [filteredData, selectedWeightSegment]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: 'calc(100vh - 64px)',
        padding: 50,
      }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} size="large" />
        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <h2 style={{ color: '#1890ff', marginBottom: 16 }}>{loadingStep}</h2>
          <Progress
            percent={loadingProgress}
            status="active"
            strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
            style={{ maxWidth: 400 }}
          />
        </div>
      </div>
    );
  }

  if (!filteredData) {
    return <div style={{ textAlign: 'center', padding: 50 }}>暂无数据</div>;
  }

  return (
    <div style={{ padding: 24, backgroundColor: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
      {/* 汇总卡片 */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Statistic 
              title="总订单金额" 
              value={filteredData.summary.totalOrderAmount} 
              precision={0}
              suffix="元"
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="总运费" 
              value={filteredData.summary.totalFreight} 
              precision={0}
              suffix="元"
              valueStyle={{ color: '#cf1322' }}
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="整体运费占比" 
              value={filteredData.summary.overallFreightRatio} 
              precision={2}
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="订单总数" 
              value={filteredData.summary.orderCount} 
              precision={0}
            />
          </Col>
        </Row>
      </Card>

      {/* 公斤段卡片选择 */}
      <Card title="公斤段分析" style={{ marginBottom: 24 }}>
        <Space size="large" wrap>
          <Card
            hoverable
            style={{
              width: 200,
              border: selectedWeightSegment === null ? '2px solid #1890ff' : '1px solid #d9d9d9',
              cursor: 'pointer',
            }}
            onClick={() => setSelectedWeightSegment(null)}
          >
            <Statistic
              title="总运费明细"
              value="全部"
              valueStyle={{ color: selectedWeightSegment === null ? '#1890ff' : '#000' }}
            />
            <div style={{ marginTop: 8, fontSize: '12px', color: '#999' }}>
              查看所有重量段数据
            </div>
          </Card>
          
          {WEIGHT_SEGMENTS.map(segment => (
            <Card
              key={segment.key}
              hoverable
              style={{
                width: 200,
                border: selectedWeightSegment === segment.key ? '2px solid #1890ff' : '1px solid #d9d9d9',
                cursor: 'pointer',
              }}
              onClick={() => setSelectedWeightSegment(segment.key)}
            >
            <Statistic
              title={segment.label}
              value={`${segment.desc}重量范围`}
              valueStyle={{ 
                fontSize: '16px',
                color: selectedWeightSegment === segment.key ? '#1890ff' : '#000',
              }}
            />
            <div style={{ marginTop: 8, fontSize: '12px', color: '#999' }}>
              点击查看该重量范围数据
            </div>
            </Card>
          ))}
        </Space>
      </Card>

      {/* 数据明细表格 */}
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <LineChartOutlined style={{ marginRight: 8, fontSize: 18 }} />
            <span style={{ fontSize: 16, fontWeight: 'bold' }}>
              {selectedWeightSegment 
                ? (() => {
                    const segment = WEIGHT_SEGMENTS.find(s => s.key === selectedWeightSegment);
                    return segment ? `${segment.desc} → ${segment.label}` : '公斤段明细';
                  })()
                : `总运费明细`} 
              ({filteredData.summary.dateRange.start} 至 {filteredData.summary.dateRange.end})
            </span>
          </div>
        }
      >
        <Table
          columns={tableColumns}
          dataSource={tableData}
          bordered
          size="small"
          pagination={false}
          scroll={{ x: 'max-content' }}
        />
      </Card>
    </div>
  );
};

export default OperationsDashboard;
