import { useState, useEffect, useMemo } from 'react';
import { Table, Spin, message, Statistic, Progress } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { LoadingOutlined } from '@ant-design/icons';
import * as echarts from 'echarts';
import axios from 'axios';
import dayjs from 'dayjs';

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
  weightDistributions: any[];
}

interface TableDataRow {
  key: string;
  date: string;
  dateDisplay: string;
  [key: string]: any; // 动态渠道字段
}

// ===================== 主组件 =====================
const OperationsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState('初始化...');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  // 渲染运费占比趋势图
  useEffect(() => {
    if (data && data.channelTrends.length > 0) {
      renderFreightRatioTrend();
    }
  }, [data]);

  const fetchData = async () => {
    setLoading(true);
    setLoadingProgress(0);
    setLoadingStep('正在连接服务器...');
    
    try {
      setLoadingProgress(30);
      setLoadingStep('正在获取数据...');
      
      const response = await axios.get('http://localhost:3000/api/dashboard', {
        timeout: 30000,
      });
      
      setLoadingProgress(70);
      setLoadingStep('正在处理数据...');
      
      if (response.data.success) {
        setData(response.data.data);
        setLoadingProgress(100);
        setLoadingStep('加载完成！');
        message.success(`成功加载 ${response.data.data.summary.orderCount.toLocaleString()} 条订单数据`);
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
      setTimeout(() => setLoading(false), 500);
    }
  };

  // 渲染运费占比趋势图
  const renderFreightRatioTrend = () => {
    const chartDom = document.getElementById('freight-ratio-trend');
    if (!chartDom || !data) return;

    const myChart = echarts.init(chartDom);
    
    const dates = data.channelTrends.map(t => dayjs(t.date).format('MM-DD'));
    const channels = data.channelSummaries.map(s => s.channel);
    
    const series = channels.map(channel => ({
      name: channel,
      type: 'line',
      smooth: true,
      symbolSize: 6,
      data: data.channelTrends.map(t => {
        const channelData = t.channels[channel];
        return channelData ? Number(channelData.freightRatio.toFixed(2)) : null;
      }),
    }));

    const option = {
      title: {
        text: '各渠道运费占比趋势',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
        },
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          let result = `<b>${params[0].axisValue}</b><br/>`;
          params.forEach((param: any) => {
            if (param.value !== null) {
              const color = param.value > 20 ? '#ff4d4f' : param.value > 15 ? '#faad14' : '#52c41a';
              result += `<span style="color:${color}">●</span> ${param.seriesName}: <b>${param.value}%</b><br/>`;
            }
          });
          return result;
        },
      },
      legend: {
        top: 35,
        data: channels,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: 70,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: dates,
        axisLabel: {
          rotate: 45,
        },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: '{value}%',
        },
        min: 0,
        max: 25,
        splitLine: {
          lineStyle: {
            type: 'dashed',
          },
        },
      },
      series,
      visualMap: {
        show: false,
        pieces: [
          { gte: 20, color: '#ff4d4f' },
          { gte: 15, lt: 20, color: '#faad14' },
          { lt: 15, color: '#52c41a' },
        ],
        outOfRange: {
          color: '#999',
        },
      },
    };

    myChart.setOption(option);
    
    // 自适应窗口大小
    const resizeHandler = () => myChart.resize();
    window.addEventListener('resize', resizeHandler);
    
    return () => {
      window.removeEventListener('resize', resizeHandler);
      myChart.dispose();
    };
  };

  // 构建表格数据
  const tableData = useMemo(() => {
    if (!data || !data.channelTrends.length) return [];

    return data.channelTrends.map(trend => {
      const row: TableDataRow = {
        key: trend.date,
        date: trend.date,
        dateDisplay: dayjs(trend.date).format('MM-DD (ddd)'),
      };

      // 为每个渠道添加数据
      Object.keys(trend.channels).forEach(channel => {
        const channelData = trend.channels[channel];
        row[channel] = {
          orderAmount: channelData.orderAmount,
          freight: channelData.freight,
          freightRatio: channelData.freightRatio,
          orderCount: channelData.orderCount,
        };
      });

      return row;
    });
  }, [data]);

  // 构建表格列
  const columns: ColumnsType<TableDataRow> = useMemo(() => {
    if (!data || !data.channelSummaries.length) return [];

    const baseColumns: ColumnsType<TableDataRow> = [
      {
        title: '日期',
        dataIndex: 'dateDisplay',
        key: 'date',
        fixed: 'left',
        width: 120,
        sorter: (a, b) => a.date.localeCompare(b.date),
      },
    ];

    // 为每个渠道创建列组
    const channelColumns = data.channelSummaries.map(summary => ({
      title: `${summary.channel} (${summary.salesRatio.toFixed(1)}%)`,
      key: summary.channel,
      children: [
        {
          title: '订单金额',
          key: `${summary.channel}_orderAmount`,
          width: 100,
          align: 'right' as const,
          render: (_: any, record: TableDataRow) => {
            const channelData = record[summary.channel];
            if (!channelData) return '-';
            return `¥${(channelData.orderAmount / 1000).toFixed(1)}K`;
          },
        },
        {
          title: '运费',
          key: `${summary.channel}_freight`,
          width: 90,
          align: 'right' as const,
          render: (_: any, record: TableDataRow) => {
            const channelData = record[summary.channel];
            if (!channelData) return '-';
            return `¥${(channelData.freight / 1000).toFixed(1)}K`;
          },
        },
        {
          title: '占比',
          key: `${summary.channel}_freightRatio`,
          width: 70,
          align: 'right' as const,
          render: (_: any, record: TableDataRow) => {
            const channelData = record[summary.channel];
            if (!channelData) return '-';
            const ratio = channelData.freightRatio;
            const color = ratio > 20 ? '#ff4d4f' : ratio > 15 ? '#faad14' : '#52c41a';
            return (
              <span style={{ color, fontWeight: 'bold' }}>
                {ratio.toFixed(1)}%
              </span>
            );
          },
          sorter: (a, b) => {
            const aData = a[summary.channel];
            const bData = b[summary.channel];
            if (!aData || !bData) return 0;
            return aData.freightRatio - bData.freightRatio;
          },
        },
        {
          title: '订单数',
          key: `${summary.channel}_orderCount`,
          width: 80,
          align: 'right' as const,
          render: (_: any, record: TableDataRow) => {
            const channelData = record[summary.channel];
            if (!channelData) return '-';
            return channelData.orderCount.toLocaleString();
          },
        },
      ],
    }));

    return [...baseColumns, ...channelColumns];
  }, [data]);

  // 渲染整体汇总统计
  const renderSummary = () => {
    if (!data) return null;

    return (
      <div style={{ 
        display: 'flex', 
        gap: '24px', 
        padding: '16px 24px', 
        background: '#fff',
        borderBottom: '1px solid #f0f0f0',
      }}>
        <Statistic
          title="总订单金额"
          value={data.summary.totalOrderAmount}
          precision={0}
          prefix="¥"
          valueStyle={{ fontSize: 20, color: '#1890ff' }}
        />
        <Statistic
          title="总运费"
          value={data.summary.totalFreight}
          precision={0}
          prefix="¥"
          valueStyle={{ fontSize: 20, color: '#cf1322' }}
        />
        <Statistic
          title="整体运费占比"
          value={data.summary.overallFreightRatio}
          precision={2}
          suffix="%"
          valueStyle={{ 
            fontSize: 20, 
            color: data.summary.overallFreightRatio > 20 ? '#ff4d4f' 
              : data.summary.overallFreightRatio > 15 ? '#faad14' 
              : '#52c41a' 
          }}
        />
        <Statistic
          title="订单总数"
          value={data.summary.orderCount}
          valueStyle={{ fontSize: 20, color: '#52c41a' }}
        />
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', color: '#999' }}>
          <span style={{ fontSize: 12 }}>
            数据范围：{dayjs(data.summary.dateRange.start).format('YYYY-MM-DD')} 至{' '}
            {dayjs(data.summary.dateRange.end).format('YYYY-MM-DD')}
          </span>
        </div>
      </div>
    );
  };

  // 加载界面
  if (loading) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '100px 50px',
        maxWidth: 600,
        margin: '0 auto'
      }}>
        <Spin 
          indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
          size="large" 
        />
        <div style={{ marginTop: 32 }}>
          <h2 style={{ color: '#1890ff', marginBottom: 16 }}>
            {loadingStep}
          </h2>
          <Progress 
            percent={loadingProgress} 
            status="active"
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
          />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <p>暂无数据</p>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f0f2f5' }}>
      {/* 顶部汇总统计 */}
      {renderSummary()}

      {/* 趋势图 */}
      <div style={{ padding: '16px 24px', background: '#fff', marginBottom: 1 }}>
        <div id="freight-ratio-trend" style={{ width: '100%', height: 280 }}></div>
      </div>

      {/* 数据表格 */}
      <div style={{ flex: 1, padding: '0 24px 24px 24px', overflow: 'hidden' }}>
        <Table
          columns={columns}
          dataSource={tableData}
          pagination={{
            pageSize: 50,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 天数据`,
            pageSizeOptions: ['20', '50', '100'],
          }}
          scroll={{ x: 'max-content', y: 'calc(100vh - 560px)' }}
          size="small"
          bordered
          sticky
          style={{ background: '#fff' }}
        />
      </div>
    </div>
  );
};

export default OperationsDashboard;
