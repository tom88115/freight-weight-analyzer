import React, { useState, useEffect } from 'react';
import { Table, Card, message, Space, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { FreightRecord } from '../types';
import { getAllRecords } from '../services/api';
import dayjs from 'dayjs';

const DataTable: React.FC = () => {
  const [data, setData] = useState<FreightRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchData = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await getAllRecords({
        page,
        limit: pageSize,
      });
      setData(response.data || []);
      setPagination({
        current: response.pagination?.page || 1,
        pageSize: response.pagination?.limit || 10,
        total: response.pagination?.total || 0,
      });
    } catch (error: any) {
      console.error('获取数据错误:', error);
      message.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns: ColumnsType<FreightRecord> = [
    {
      title: '订单号',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: 120,
      render: (text) => text || '-',
    },
    {
      title: '重量 (kg)',
      dataIndex: 'weight',
      key: 'weight',
      width: 100,
      sorter: (a, b) => a.weight - b.weight,
      render: (value) => value.toFixed(2),
    },
    {
      title: '运费 (元)',
      dataIndex: 'cost',
      key: 'cost',
      width: 100,
      sorter: (a, b) => a.cost - b.cost,
      render: (value) => `¥${value.toFixed(2)}`,
    },
    {
      title: '重量段',
      dataIndex: 'weightRange',
      key: 'weightRange',
      width: 100,
      filters: [
        { text: '0-1kg', value: '0-1kg' },
        { text: '1-2kg', value: '1-2kg' },
        { text: '2-5kg', value: '2-5kg' },
        { text: '5-10kg', value: '5-10kg' },
        { text: '10-20kg', value: '10-20kg' },
        { text: '20-50kg', value: '20-50kg' },
        { text: '50kg以上', value: '50kg以上' },
      ],
      onFilter: (value, record) => record.weightRange === value,
    },
    {
      title: '目的地',
      dataIndex: 'destination',
      key: 'destination',
      width: 120,
      render: (text) => text || '-',
    },
    {
      title: '承运商',
      dataIndex: 'carrier',
      key: 'carrier',
      width: 120,
      render: (text) => text || '-',
    },
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      render: (date) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '备注',
      dataIndex: 'remarks',
      key: 'remarks',
      ellipsis: true,
      render: (text) => text || '-',
    },
  ];

  const handleTableChange = (newPagination: any) => {
    fetchData(newPagination.current, newPagination.pageSize);
  };

  return (
    <Card
      title="📋 运费数据列表"
      extra={
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchData(pagination.current, pagination.pageSize)}
          >
            刷新
          </Button>
        </Space>
      }
    >
      <Table
        columns={columns}
        dataSource={data}
        rowKey="_id"
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
        scroll={{ x: 1000 }}
      />
    </Card>
  );
};

export default DataTable;

