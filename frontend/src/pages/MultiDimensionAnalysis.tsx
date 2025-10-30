import { useState, useEffect } from 'react';
import { Card, Table, Statistic, Row, Col, Spin, message, Collapse, Tag } from 'antd';
import { DollarOutlined, ShoppingOutlined, PercentageOutlined, CalendarOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';

const { Panel } = Collapse;

interface DailyPlatformStats {
  date: string;
  platform: string;
  orderCount: number;
  totalFreight: number;
  totalOrderAmount: number;
  freightRatio: number;
  weightRange?: string;
}

interface WeightRangeData {
  weightRange: string;
  stats: DailyPlatformStats[];
  subtotal: {
    orderCount: number;
    totalFreight: number;
    totalOrderAmount: number;
    freightRatio: number;
  };
}

interface MultiDimensionData {
  summary: {
    totalOrders: number;
    totalFreight: number;
    totalOrderAmount: number;
    overallFreightRatio: number;
  };
  overall: DailyPlatformStats[];
  byWeightRange: WeightRangeData[];
  dateRange: {
    start: string;
    end: string;
  };
}

const MultiDimensionAnalysis = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MultiDimensionData | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3000/api/multi-dimension');
      if (response.data.success) {
        setData(response.data.data);
      } else {
        message.error('获取数据失败');
      }
    } catch (error) {
      console.error('获取数据错误:', error);
      message.error('网络错误，请检查后端服务');
    } finally {
      setLoading(false);
    }
  };

  // 表格列定义
  const columns: ColumnsType<DailyPlatformStats> = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      fixed: 'left',
      width: 120,
      sorter: (a, b) => a.date.localeCompare(b.date),
    },
    {
      title: '平台',
      dataIndex: 'platform',
      key: 'platform',
      width: 130,
      filters: Array.from(new Set(data?.overall.map(item => item.platform) || [])).map(p => ({
        text: p,
        value: p,
      })),
      onFilter: (value, record) => record.platform === value,
    },
    {
      title: '订单数',
      dataIndex: 'orderCount',
      key: 'orderCount',
      width: 100,
      align: 'right',
      sorter: (a, b) => a.orderCount - b.orderCount,
      render: (value: number) => value.toLocaleString(),
    },
    {
      title: '运费绝对值 (¥)',
      dataIndex: 'totalFreight',
      key: 'totalFreight',
      width: 140,
      align: 'right',
      sorter: (a, b) => a.totalFreight - b.totalFreight,
      render: (value: number) => `¥${value.toFixed(2)}`,
    },
    {
      title: '订单金额 (¥)',
      dataIndex: 'totalOrderAmount',
      key: 'totalOrderAmount',
      width: 140,
      align: 'right',
      sorter: (a, b) => a.totalOrderAmount - b.totalOrderAmount,
      render: (value: number) => `¥${value.toFixed(2)}`,
    },
    {
      title: '运费占比 (%)',
      dataIndex: 'freightRatio',
      key: 'freightRatio',
      width: 130,
      align: 'right',
      sorter: (a, b) => a.freightRatio - b.freightRatio,
      render: (value: number) => {
        const color = value > 20 ? 'red' : value > 15 ? 'orange' : 'green';
        return <Tag color={color}>{value.toFixed(2)}%</Tag>;
      },
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="加载数据中..." />
      </div>
    );
  }

  if (!data) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>暂无数据</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ marginBottom: 24 }}>多维度运费分析</h1>

      {/* 汇总统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总订单数"
              value={data.summary.totalOrders}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#3f8600' }}
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
              suffix=""
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总订单金额"
              value={data.summary.totalOrderAmount}
              precision={2}
              prefix="¥"
              suffix=""
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="整体运费占比"
              value={data.summary.overallFreightRatio}
              precision={2}
              prefix={<PercentageOutlined />}
              suffix="%"
              valueStyle={{ 
                color: data.summary.overallFreightRatio > 20 ? '#cf1322' : 
                       data.summary.overallFreightRatio > 15 ? '#faad14' : '#3f8600'
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* 日期范围 */}
      <Card size="small" style={{ marginBottom: 24 }}>
        <CalendarOutlined /> 数据时间范围：
        <Tag color="blue">{data.dateRange.start}</Tag> 至 
        <Tag color="blue">{data.dateRange.end}</Tag>
      </Card>

      {/* 汇总：全公斤段的每日平台数据 */}
      <Card 
        title={
          <span>
            <DollarOutlined /> 汇总 - 全公斤段每日平台数据
          </span>
        } 
        style={{ marginBottom: 24 }}
      >
        <Table
          columns={columns}
          dataSource={data.overall}
          rowKey={(record) => `${record.date}_${record.platform}`}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          scroll={{ x: 900 }}
          size="small"
        />
      </Card>

      {/* 各公斤段明细 */}
      <Card title="各公斤段明细">
        <Collapse accordion>
          {data.byWeightRange.map((range) => (
            <Panel
              header={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold', fontSize: 16 }}>
                    {range.weightRange}
                  </span>
                  <span style={{ fontSize: 12, color: '#666' }}>
                    订单数: {range.subtotal.orderCount.toLocaleString()} | 
                    运费: ¥{range.subtotal.totalFreight.toFixed(2)} | 
                    占比: <Tag color={range.subtotal.freightRatio > 20 ? 'red' : range.subtotal.freightRatio > 15 ? 'orange' : 'green'}>
                      {range.subtotal.freightRatio.toFixed(2)}%
                    </Tag>
                  </span>
                </div>
              }
              key={range.weightRange}
            >
              <Table
                columns={columns}
                dataSource={range.stats}
                rowKey={(record) => `${record.date}_${record.platform}_${range.weightRange}`}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  size: 'small',
                }}
                scroll={{ x: 900 }}
                size="small"
              />
              
              {/* 小计行 */}
              <Card size="small" style={{ marginTop: 16, background: '#f0f2f5' }}>
                <Row gutter={16}>
                  <Col span={6}>
                    <Statistic 
                      title="小计 - 订单数" 
                      value={range.subtotal.orderCount} 
                      valueStyle={{ fontSize: 16 }}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic 
                      title="小计 - 运费" 
                      value={range.subtotal.totalFreight} 
                      precision={2}
                      prefix="¥"
                      valueStyle={{ fontSize: 16 }}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic 
                      title="小计 - 订单金额" 
                      value={range.subtotal.totalOrderAmount} 
                      precision={2}
                      prefix="¥"
                      valueStyle={{ fontSize: 16 }}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic 
                      title="小计 - 运费占比" 
                      value={range.subtotal.freightRatio} 
                      precision={2}
                      suffix="%"
                      valueStyle={{ 
                        fontSize: 16,
                        color: range.subtotal.freightRatio > 20 ? '#cf1322' : 
                               range.subtotal.freightRatio > 15 ? '#faad14' : '#3f8600'
                      }}
                    />
                  </Col>
                </Row>
              </Card>
            </Panel>
          ))}
        </Collapse>
      </Card>
    </div>
  );
};

export default MultiDimensionAnalysis;

