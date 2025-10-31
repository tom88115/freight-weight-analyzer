import { useState, useEffect, useMemo } from 'react';
import { Table, Spin, message, Card, Row, Col, Statistic, Progress, Divider, Button, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { LoadingOutlined, LineChartOutlined, SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons';
import * as echarts from 'echarts';
import axios from 'axios';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

dayjs.locale('zh-cn');

// ===================== 渠道Logo映射 =====================
const CHANNEL_LOGOS: { [key: string]: string } = {
  '拼多多': 'https://commimg.pddpic.com/pdd_dj/2022-08-08/8c13da93-fa82-455a-9ef5-c1945540c375.png',
  '淘宝天猫': 'https://img.alicdn.com/imgextra/i4/O1CN01EYTRnM1aJ5ETFTKJK_!!6000000003303-2-tps-100-100.png',
  '抖音': 'https://lf-cdn-tos.bytescm.com/obj/static/xitu_extension/static/icon.png',
  '京东商城': 'https://storage.360buyimg.com/jdvideo-activity-bucket/pc_top_logo_new_1654851342699.png',
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

interface WeightDistribution {
  channel: string;
  weights: {
    [weightRange: string]: {
      freight: number;
      freightRatio: number;
      orderCount: number;
      avgFreight: number;
    };
  };
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
  weightDistributions: WeightDistribution[];
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
 * 数字格式化：万元显示
 */
const formatCurrency = (value: number): string => {
  if (value >= 10000) {
    return `${Math.round(value / 10000)}万`;
  }
  return Math.round(value).toString();
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
 * 获取渠道内运费占比的颜色（基于该渠道的百分位数）
 */
const getChannelFreightRatioColor = (ratio: number, allRatios: number[]): string => {
  if (allRatios.length === 0) return '#52c41a';
  
  const sorted = [...allRatios].sort((a, b) => a - b);
  const p33 = sorted[Math.floor(sorted.length * 0.33)];
  const p66 = sorted[Math.floor(sorted.length * 0.66)];
  
  if (ratio <= p33) return '#52c41a'; // 绿色：低于33%分位
  if (ratio <= p66) return '#faad14'; // 黄色：33%-66%分位
  return '#ff4d4f'; // 红色：高于66%分位
};

/**
 * 判断重量是否在指定公斤段范围内
 */
const isInWeightSegment = (weightRange: string, segmentKey: string): boolean => {
  const segment = WEIGHT_SEGMENTS.find(s => s.key === segmentKey);
  if (!segment) return false;
  
  // 从weightRange中提取数字范围，例如 "2-3kg" -> [2, 3]
  const match = weightRange.match(/(\d+\.?\d*)-(\d+\.?\d*)/);
  if (!match) return false;
  
  const rangeMin = parseFloat(match[1]);
  const rangeMax = parseFloat(match[2]);
  
  // 判断是否有重叠
  return !(rangeMax <= segment.min || rangeMin >= segment.max);
};

// ===================== 主组件 =====================
const OperationsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState('初始化...');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [data, setData] = useState<DashboardData | null>(null);
  const [dateOrder, setDateOrder] = useState<'asc' | 'desc'>('asc'); // 日期排序
  const [selectedWeightSegment, setSelectedWeightSegment] = useState<string | null>(null); // 选中的公斤段

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
      setLoading(false);
    }
  };

  // ==================== 计算表格数据（总运费或分公斤段） ====================
  const tableData = useMemo(() => {
    if (!data) return [];

    const { channelTrends } = data;
    let filteredTrends = channelTrends;

    // 如果选中了公斤段，则需要从原始数据中筛选
    // 注意：这里需要后端提供更详细的数据，暂时使用全量数据
    
    const tableData: TableDataRow[] = [];

    for (const trend of filteredTrends) {
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
  }, [data, dateOrder, selectedWeightSegment]);

  // ==================== 计算表格列 ====================
  const tableColumns = useMemo((): ColumnsType<TableDataRow> => {
    if (!data) return [];

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
          <div>
            <div>{text}</div>
            <div style={{ fontSize: '12px', color: '#999' }}>周{record.weekday}</div>
          </div>
        ),
      },
    ];

    // 按销售额占比排序的渠道
    const sortedChannels = [...data.channelSummaries].sort((a, b) => b.salesRatio - a.salesRatio);

    for (const summary of sortedChannels) {
      const channel = summary.channel;
      
      // 获取该渠道所有日期的运费占比，用于颜色编码
      const channelRatios = data.channelTrends
        .map(t => t.channels[channel]?.freightRatio)
        .filter((r): r is number => r !== undefined);

      columns.push({
        title: (
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
              {CHANNEL_LOGOS[channel] && (
                <img 
                  src={CHANNEL_LOGOS[channel]} 
                  alt={channel} 
                  style={{ width: 24, height: 24, marginRight: 6, objectFit: 'contain' }}
                />
              )}
              <strong>{channel}</strong>
            </div>
            <div style={{ fontSize: '12px', color: '#999', marginBottom: 4 }}>
              销售额占比 {summary.salesRatio.toFixed(1)}%
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              月平均运费占比 {summary.avgFreightRatio.toFixed(2)}%
            </div>
            {/* 渠道运费占比趋势图 */}
            <div 
              id={`trend-${channel}-${selectedWeightSegment || 'total'}`}
              style={{ width: '100%', height: 60, marginTop: 8 }}
            />
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
            render: (value: number) => value ? formatCurrency(value) : '-',
          },
          {
            title: '运费',
            dataIndex: `${channel}_freight`,
            key: `${channel}_freight`,
            align: 'right',
            width: 80,
            render: (value: number) => value ? formatCurrency(value) : '-',
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
              return (
                <span style={{ 
                  color, 
                  fontWeight: 'bold',
                  padding: '2px 8px',
                  borderRadius: 4,
                  backgroundColor: `${color}20`,
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
            render: (value: number) => value || '-',
          },
        ],
      });
    }

    return columns;
  }, [data, dateOrder, selectedWeightSegment]);

  // ==================== 渲染趋势图 ====================
  useEffect(() => {
    if (!data || !data.channelTrends.length) return;

    const sortedChannels = [...data.channelSummaries].sort((a, b) => b.salesRatio - a.salesRatio);

    // 为每个渠道渲染趋势图
    setTimeout(() => {
      sortedChannels.forEach(summary => {
        const channel = summary.channel;
        const containerId = `trend-${channel}-${selectedWeightSegment || 'total'}`;
        const container = document.getElementById(containerId);
        
        if (!container) return;

        const myChart = echarts.init(container);
        
        const dates = data.channelTrends.map(t => dayjs(t.date).format('MM-DD'));
        const ratios = data.channelTrends.map(t => t.channels[channel]?.freightRatio || 0);

        const option = {
          grid: {
            left: 10,
            right: 10,
            top: 10,
            bottom: 10,
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
              data: ratios,
              type: 'line',
              smooth: true,
              showSymbol: false,
              lineStyle: {
                width: 2,
                color: '#1890ff',
              },
              areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
                  { offset: 1, color: 'rgba(24, 144, 255, 0.05)' },
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

        myChart.setOption(option);
      });
    }, 100);
  }, [data, selectedWeightSegment]);

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

  if (!data) {
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
              value={data.summary.totalOrderAmount} 
              precision={0}
              suffix="元"
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="总运费" 
              value={data.summary.totalFreight} 
              precision={0}
              suffix="元"
              valueStyle={{ color: '#cf1322' }}
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="整体运费占比" 
              value={data.summary.overallFreightRatio} 
              precision={2}
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="订单总数" 
              value={data.summary.orderCount} 
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
                value={segment.desc}
                valueStyle={{ 
                  fontSize: '16px',
                  color: selectedWeightSegment === segment.key ? '#1890ff' : '#000',
                }}
              />
              <div style={{ marginTop: 8, fontSize: '12px', color: '#999' }}>
                点击查看该公斤段数据
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
                ? `${WEIGHT_SEGMENTS.find(s => s.key === selectedWeightSegment)?.label} 明细`
                : `总运费明细`} 
              ({data.summary.dateRange.start} 至 {data.summary.dateRange.end})
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
