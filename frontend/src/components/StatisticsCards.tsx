import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import {
  FileTextOutlined,
  DollarOutlined,
  AverageOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { AnalysisResult } from '../types';
import dayjs from 'dayjs';

interface StatisticsCardsProps {
  data: AnalysisResult | null;
}

const StatisticsCards: React.FC<StatisticsCardsProps> = ({ data }) => {
  if (!data) {
    return null;
  }

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="总记录数"
            value={data.totalRecords}
            prefix={<FileTextOutlined />}
            valueStyle={{ color: '#3f8600' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="总运费"
            value={data.totalCost}
            precision={2}
            prefix={<DollarOutlined />}
            suffix="元"
            valueStyle={{ color: '#cf1322' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="平均运费"
            value={data.averageCost}
            precision={2}
            prefix={<AverageOutlined />}
            suffix="元"
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="数据时间范围"
            value={
              data.dateRange
                ? `${dayjs(data.dateRange.start).format('MM/DD')} - ${dayjs(
                    data.dateRange.end
                  ).format('MM/DD')}`
                : '-'
            }
            prefix={<CalendarOutlined />}
            valueStyle={{ fontSize: '16px' }}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default StatisticsCards;

