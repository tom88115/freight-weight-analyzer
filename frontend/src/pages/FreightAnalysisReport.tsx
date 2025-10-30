import { useState, useEffect } from 'react';
import { Card, Table, Select, Spin, message, Statistic, Row, Col, Tag, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';
import dayjs from 'dayjs';

const { Option } = Select;

interface PlatformMetrics {
  salesRatio: number;          // 销售额占比
  orderAmount: number;          // 订单金额
  freight: number;              // 运费
  freightRatio: number;         // 交付占比（运费/订单金额）
  orderCount: number;           // 订单数（新增）
  remarks?: string;             // 备注
}

interface DailyReport {
  date: string;                 // 日期
  weightRange: string;          // 重量段
  platforms: {
    [platform: string]: PlatformMetrics;
  };
}

interface ReportSummary {
  totalOrderAmount: number;
  totalFreight: number;
  overallFreightRatio: number;
  platformSummary: {
    [platform: string]: {
      orderAmount: number;
      freight: number;
      salesRatio: number;
      freightRatio: number;
    };
  };
}

const FreightAnalysisReport = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DailyReport[]>([]);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [selectedRange, setSelectedRange] = useState<string>('全公斤段');
  const [weightRanges, setWeightRanges] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3000/api/freight-report');
      if (response.data.success) {
        setData(response.data.data.dailyReports);
        setSummary(response.data.data.summary);
        
        // 提取所有重量段
        const ranges = ['全公斤段', ...new Set(
          response.data.data.dailyReports
            .map((r: DailyReport) => r.weightRange)
            .filter((r: string) => r !== '全公斤段')
        )];
        setWeightRanges(ranges);
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

  // 筛选数据
  const filteredData = data.filter(item => 
    selectedRange === '全公斤段' || item.weightRange === selectedRange
  );

  // 获取所有平台名称
  const allPlatforms = data.length > 0 
    ? Array.from(new Set(data.flatMap(d => Object.keys(d.platforms))))
    : [];

  // 构建表格列
  const columns: ColumnsType<DailyReport> = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      fixed: 'left',
      width: 120,
      render: (text: string) => dayjs(text).format('MM-DD'),
      sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    },
    {
      title: '重量段',
      dataIndex: 'weightRange',
      key: 'weightRange',
      fixed: 'left',
      width: 110,
    },
    ...allPlatforms.flatMap(platform => [
      {
        title: platform,
        children: [
          {
            title: <Tooltip title="该平台占当日总销售额的比例">销售额占比</Tooltip>,
            key: `${platform}_salesRatio`,
            width: 90,
            align: 'right' as const,
            render: (_: any, record: DailyReport) => {
              const metrics = record.platforms[platform];
              if (!metrics) return '-';
              return <span style={{ color: '#1890ff' }}>
                {(metrics.salesRatio * 100).toFixed(1)}%
              </span>;
            },
          },
          {
            title: '订单金额',
            key: `${platform}_orderAmount`,
            width: 110,
            align: 'right' as const,
            render: (_: any, record: DailyReport) => {
              const metrics = record.platforms[platform];
              if (!metrics) return '-';
              return `¥${metrics.orderAmount.toFixed(2)}`;
            },
          },
          {
            title: '运费',
            key: `${platform}_freight`,
            width: 100,
            align: 'right' as const,
            render: (_: any, record: DailyReport) => {
              const metrics = record.platforms[platform];
              if (!metrics) return '-';
              return <span style={{ color: '#cf1322' }}>
                ¥{metrics.freight.toFixed(2)}
              </span>;
            },
          },
          {
            title: <Tooltip title="运费/订单金额">交付占比</Tooltip>,
            key: `${platform}_freightRatio`,
            width: 90,
            align: 'right' as const,
            render: (_: any, record: DailyReport) => {
              const metrics = record.platforms[platform];
              if (!metrics) return '-';
              const ratio = metrics.freightRatio * 100;
              const color = ratio > 20 ? 'red' : ratio > 15 ? 'orange' : 'green';
              return <Tag color={color}>{ratio.toFixed(2)}%</Tag>;
            },
          },
          {
            title: '备注',
            key: `${platform}_remarks`,
            width: 180,
            ellipsis: true,
            render: (_: any, record: DailyReport) => {
              const metrics = record.platforms[platform];
              if (!metrics || !metrics.remarks) return '-';
              return <Tooltip title={metrics.remarks}>
                <span style={{ color: '#faad14' }}>
                  <InfoCircleOutlined /> {metrics.remarks.slice(0, 15)}...
                </span>
              </Tooltip>;
            },
          },
        ],
      },
    ]),
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="加载数据中..." />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ marginBottom: 16 }}>运费分析报表</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>
        按日期+重量段+平台的多维度对比分析
      </p>

      {/* 汇总统计 */}
      {summary && (
        <Card title="整体汇总" style={{ marginBottom: 24 }}>
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={8}>
              <Statistic 
                title="总订单金额" 
                value={summary.totalOrderAmount} 
                precision={2}
                prefix="¥"
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col span={8}>
              <Statistic 
                title="总运费" 
                value={summary.totalFreight} 
                precision={2}
                prefix="¥"
                valueStyle={{ color: '#cf1322' }}
              />
            </Col>
            <Col span={8}>
              <Statistic 
                title="整体交付占比" 
                value={summary.overallFreightRatio * 100} 
                precision={2}
                suffix="%"
                valueStyle={{ 
                  color: summary.overallFreightRatio > 0.2 ? '#cf1322' : 
                         summary.overallFreightRatio > 0.15 ? '#faad14' : '#3f8600'
                }}
              />
            </Col>
          </Row>

          {/* 各平台汇总 */}
          <Row gutter={16}>
            {Object.entries(summary.platformSummary).map(([platform, metrics]) => (
              <Col span={6} key={platform}>
                <Card size="small" title={platform} style={{ textAlign: 'center' }}>
                  <Statistic
                    title="销售额占比"
                    value={metrics.salesRatio * 100}
                    precision={1}
                    suffix="%"
                    valueStyle={{ fontSize: 20 }}
                  />
                  <div style={{ marginTop: 12, fontSize: 12, color: '#666' }}>
                    订单金额: ¥{metrics.orderAmount.toFixed(0)}<br/>
                    运费: ¥{metrics.freight.toFixed(0)}<br/>
                    交付占比: <Tag color={
                      metrics.freightRatio > 0.2 ? 'red' : 
                      metrics.freightRatio > 0.15 ? 'orange' : 'green'
                    }>
                      {(metrics.freightRatio * 100).toFixed(2)}%
                    </Tag>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )}

      {/* 筛选器 */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <span style={{ marginRight: 8 }}>重量段筛选：</span>
        <Select
          value={selectedRange}
          onChange={setSelectedRange}
          style={{ width: 200 }}
        >
          {weightRanges.map(range => (
            <Option key={range} value={range}>{range}</Option>
          ))}
        </Select>
        <span style={{ marginLeft: 16, color: '#999' }}>
          共 {filteredData.length} 条数据
        </span>
      </Card>

      {/* 数据表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey={(record) => `${record.date}_${record.weightRange}`}
          scroll={{ x: 1800, y: 600 }}
          pagination={{
            pageSize: 50,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
            pageSizeOptions: ['20', '50', '100', '200'],
          }}
          size="small"
          bordered
        />
      </Card>
    </div>
  );
};

export default FreightAnalysisReport;

