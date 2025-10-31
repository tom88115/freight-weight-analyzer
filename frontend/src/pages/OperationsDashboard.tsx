import { useState, useEffect } from 'react';
import { Card, Row, Col, Spin, message, Statistic, Tag, Tooltip, Progress } from 'antd';
import { 
  LineChartOutlined, 
  DollarOutlined, 
  ShoppingOutlined,
  LoadingOutlined 
} from '@ant-design/icons';
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

// ===================== 主组件 =====================
const OperationsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState('初始化...');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  // 渲染趋势图
  useEffect(() => {
    if (data && data.channelTrends.length > 0) {
      renderFreightRatioTrend();
      renderWeightDistribution();
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
        message.success('数据加载成功');
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
      data: data.channelTrends.map(t => {
        const channelData = t.channels[channel];
        return channelData ? channelData.freightRatio.toFixed(2) : null;
      }),
      markLine: {
        silent: true,
        lineStyle: {
          color: '#faad14',
          type: 'dashed',
        },
        data: [{ yAxis: 15, label: { formatter: '目标线: 15%' } }],
      },
    }));

    const option = {
      title: {
        text: '各渠道运费占比趋势',
        subtext: '运费/销售额（%）',
        left: 'center',
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
        top: 40,
        data: channels,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: 80,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: dates,
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: '{value}%',
        },
        min: 0,
        max: 25,
      },
      series,
    };

    myChart.setOption(option);
    window.addEventListener('resize', () => myChart.resize());
  };

  // 渲染公斤段分布图
  const renderWeightDistribution = () => {
    const chartDom = document.getElementById('weight-distribution');
    if (!chartDom || !data) return;

    const myChart = echarts.init(chartDom);
    
    const channels = data.weightDistributions.map(d => d.channel);
    
    // 获取所有公斤段
    const allWeights = new Set<string>();
    data.weightDistributions.forEach(d => {
      Object.keys(d.weights).forEach(w => allWeights.add(w));
    });
    const weightRanges = Array.from(allWeights);

    // 为每个公斤段创建一个系列
    const series = weightRanges.map(weightRange => ({
      name: weightRange,
      type: 'bar',
      stack: 'total',
      label: {
        show: true,
        formatter: (params: any) => {
          return params.value > 5 ? `${params.value.toFixed(1)}%` : '';
        },
      },
      data: channels.map(channel => {
        const channelData = data.weightDistributions.find(d => d.channel === channel);
        return channelData?.weights[weightRange]?.freightRatio.toFixed(2) || 0;
      }),
    }));

    const option = {
      title: {
        text: '各渠道公斤段运费分布',
        subtext: '占该渠道总运费的比例（%）',
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params: any) => {
          let result = `<b>${params[0].axisValue}</b><br/>`;
          params.forEach((param: any) => {
            if (param.value > 0) {
              result += `${param.marker} ${param.seriesName}: <b>${param.value}%</b><br/>`;
            }
          });
          return result;
        },
      },
      legend: {
        top: 40,
        data: weightRanges,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: 80,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: channels,
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: '{value}%',
        },
        max: 100,
      },
      series,
    };

    myChart.setOption(option);
    window.addEventListener('resize', () => myChart.resize());
  };

  // 获取运费占比的颜色
  const getFreightRatioColor = (ratio: number) => {
    if (ratio > 20) return '#ff4d4f';
    if (ratio > 15) return '#faad14';
    return '#52c41a';
  };

  // 优化的加载界面
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
          <p style={{ marginTop: 16, color: '#666' }}>
            正在加载运营分析数据...
          </p>
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
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* 整体汇总 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总订单金额"
              value={data.summary.totalOrderAmount}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#1890ff' }}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总运费"
              value={data.summary.totalFreight}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#cf1322' }}
              prefix={<ShoppingOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="整体运费占比"
              value={data.summary.overallFreightRatio}
              precision={2}
              suffix="%"
              valueStyle={{ color: getFreightRatioColor(data.summary.overallFreightRatio) }}
              prefix={<LineChartOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="订单总数"
              value={data.summary.orderCount}
              valueStyle={{ color: '#52c41a' }}
            />
            <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
              {dayjs(data.summary.dateRange.start).format('YYYY-MM-DD')} 至{' '}
              {dayjs(data.summary.dateRange.end).format('YYYY-MM-DD')}
            </div>
          </Card>
        </Col>
      </Row>

      {/* 渠道销售额占比卡片 */}
      <Card 
        title="各渠道销售额占比与运费分析" 
        style={{ marginBottom: 24 }}
        extra={<Tag color="blue">按销售额排序</Tag>}
      >
        <Row gutter={16}>
          {data.channelSummaries.map(channel => (
            <Col span={6} key={channel.channel} style={{ marginBottom: 16 }}>
              <Card 
                size="small" 
                style={{ 
                  background: '#fafafa',
                  border: `2px solid ${getFreightRatioColor(channel.avgFreightRatio)}`,
                }}
              >
                <div style={{ textAlign: 'center', marginBottom: 12 }}>
                  <h3 style={{ margin: 0, fontSize: 18 }}>{channel.channel}</h3>
                </div>
                
                <div style={{ marginBottom: 12 }}>
                  <div style={{ color: '#666', fontSize: 12, marginBottom: 4 }}>销售额占比</div>
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
                    {channel.salesRatio.toFixed(1)}%
                  </div>
                </div>

                <div style={{ marginBottom: 8, padding: '8px 0', borderTop: '1px solid #eee' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ color: '#666', fontSize: 12 }}>订单金额</span>
                    <span style={{ fontWeight: 'bold' }}>¥{channel.totalOrderAmount.toFixed(0)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ color: '#666', fontSize: 12 }}>运费</span>
                    <span style={{ fontWeight: 'bold', color: '#cf1322' }}>¥{channel.totalFreight.toFixed(0)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#666', fontSize: 12 }}>订单数</span>
                    <span>{channel.orderCount}</span>
                  </div>
                </div>

                <Tooltip title="运费/订单金额">
                  <Tag 
                    color={channel.avgFreightRatio > 20 ? 'red' : channel.avgFreightRatio > 15 ? 'orange' : 'green'}
                    style={{ width: '100%', textAlign: 'center', fontSize: 14, padding: '4px 0' }}
                  >
                    运费占比: {channel.avgFreightRatio.toFixed(2)}%
                  </Tag>
                </Tooltip>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* 运费占比趋势图 */}
      <Card style={{ marginBottom: 24 }}>
        <div id="freight-ratio-trend" style={{ width: '100%', height: 400 }}></div>
      </Card>

      {/* 公斤段分布图 */}
      <Card>
        <div id="weight-distribution" style={{ width: '100%', height: 400 }}></div>
      </Card>
    </div>
  );
};

export default OperationsDashboard;

