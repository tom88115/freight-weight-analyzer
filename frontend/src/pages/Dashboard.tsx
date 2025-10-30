import React, { useState, useEffect } from 'react';
import { Layout, Space, DatePicker, Select, Button, message } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import UploadSection from '../components/UploadSection';
import StatisticsCards from '../components/StatisticsCards';
import WeightRangeChart from '../components/WeightRangeChart';
import DataTable from '../components/DataTable';
import { AnalysisResult } from '../types';
import { getAnalytics } from '../services/api';
import dayjs from 'dayjs';

const { Header, Content } = Layout;
const { RangePicker } = DatePicker;

const Dashboard: React.FC = () => {
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const [carrier, setCarrier] = useState<string | undefined>(undefined);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (dateRange) {
        params.startDate = dateRange[0];
        params.endDate = dateRange[1];
      }
      if (carrier) {
        params.carrier = carrier;
      }

      const data = await getAnalytics(params);
      setAnalysisData(data);
    } catch (error: any) {
      console.error('获取分析数据错误:', error);
      message.error('获取分析数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleDateChange = (dates: any) => {
    if (dates) {
      setDateRange([dates[0].format('YYYY-MM-DD'), dates[1].format('YYYY-MM-DD')]);
    } else {
      setDateRange(null);
    }
  };

  const handleSearch = () => {
    fetchAnalytics();
  };

  const handleReset = () => {
    setDateRange(null);
    setCarrier(undefined);
    fetchAnalytics();
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <h1 style={{ color: 'white', margin: 0, fontSize: '24px' }}>
          📦 运费公斤段分析系统
        </h1>
      </Header>
      <Content style={{ padding: '24px', background: '#f0f2f5' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* 上传区域 */}
          <UploadSection onUploadSuccess={fetchAnalytics} />

          {/* 筛选区域 */}
          <div
            style={{
              background: 'white',
              padding: '16px',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          >
            <Space wrap>
              <RangePicker
                value={dateRange ? [dayjs(dateRange[0]), dayjs(dateRange[1])] : null}
                onChange={handleDateChange}
                placeholder={['开始日期', '结束日期']}
              />
              <Select
                placeholder="选择承运商"
                style={{ width: 200 }}
                allowClear
                value={carrier}
                onChange={setCarrier}
              >
                <Select.Option value="顺丰">顺丰</Select.Option>
                <Select.Option value="韵达">韵达</Select.Option>
                <Select.Option value="圆通">圆通</Select.Option>
                <Select.Option value="中通">中通</Select.Option>
                <Select.Option value="申通">申通</Select.Option>
              </Select>
              <Button type="primary" onClick={handleSearch} loading={loading}>
                查询
              </Button>
              <Button onClick={handleReset}>重置</Button>
              <Button icon={<ReloadOutlined />} onClick={fetchAnalytics}>
                刷新
              </Button>
            </Space>
          </div>

          {/* 统计卡片 */}
          <StatisticsCards data={analysisData} />

          {/* 图表 */}
          <WeightRangeChart data={analysisData} />

          {/* 数据表格 */}
          <DataTable />
        </Space>
      </Content>
    </Layout>
  );
};

export default Dashboard;

