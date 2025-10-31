import React, { useState } from 'react';
import {
  Card,
  Upload,
  Button,
  message,
  Space,
  Statistic,
  Row,
  Col,
  Typography,
  Alert,
  Table,
  Tag,
  Modal,
  Progress,
  Divider,
  Steps,
  Result,
} from 'antd';
import {
  UploadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;

interface ValidationResult {
  file: {
    totalRecords: number;
    uniqueRecords: number;
    duplicateRecords: number;
    dateRange: { min: string; max: string };
    platforms: { [key: string]: number };
  };
  currentDatabase: {
    totalRecords: number;
    dateRange: { min: string; max: string } | null;
    platforms: string[];
  };
  duplicateSamples: Array<{
    orderNumber: string;
    date: string;
    platform: string;
    cost: number;
  }>;
}

interface UploadResult {
  imported: number;
  duplicates: number;
  total: number;
  currentDatabase: {
    totalRecords: number;
    dateRange: { min: string; max: string } | null;
    platforms: string[];
  };
}

const UploadData: React.FC = () => {
  const navigate = useNavigate();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

  // 验证文件
  const handleValidate = async (file: File) => {
    setIsValidating(true);
    setUploadProgress(0);
    setCurrentStep(1);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API_BASE_URL}/api/upload/validate`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percent);
          }
        },
      });

      if (response.data.success) {
        setValidationResult(response.data.data);
        setCurrentStep(2);
        message.success('文件验证完成！');
      }
    } catch (error: any) {
      console.error('验证失败:', error);
      message.error(`验证失败: ${error.response?.data?.message || error.message}`);
      setCurrentStep(0);
    } finally {
      setIsValidating(false);
      setUploadProgress(0);
    }
  };

  // 确认上传
  const handleConfirmUpload = async () => {
    if (fileList.length === 0) {
      message.error('请先选择文件');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setCurrentStep(3);

    try {
      const formData = new FormData();
      formData.append('file', fileList[0] as any);

      const response = await axios.post(`${API_BASE_URL}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percent);
          }
        },
      });

      if (response.data.success) {
        setUploadResult(response.data.data);
        setCurrentStep(4);
        
        // 显示成功提示
        Modal.success({
          title: '数据上传成功！',
          content: (
            <div>
              <p>✅ 成功导入 <strong>{response.data.data.imported}</strong> 条新记录</p>
              {response.data.data.duplicates > 0 && (
                <p>⚠️ 跳过 <strong>{response.data.data.duplicates}</strong> 条重复记录</p>
              )}
              <p>📊 当前数据库共有 <strong>{response.data.data.currentDatabase.totalRecords.toLocaleString()}</strong> 条记录</p>
            </div>
          ),
          onOk: () => {
            // 3秒后自动跳转到首页
            setTimeout(() => {
              navigate('/');
            }, 1000);
          },
          okText: '查看数据分析',
        });
      }
    } catch (error: any) {
      console.error('上传失败:', error);
      message.error(`上传失败: ${error.response?.data?.message || error.message}`);
      setCurrentStep(2);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // 重新开始
  const handleReset = () => {
    setFileList([]);
    setValidationResult(null);
    setUploadResult(null);
    setCurrentStep(0);
  };

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    maxCount: 1,
    fileList,
    accept: '.xlsx,.xls,.csv',
    beforeUpload: (file) => {
      const isExcel =
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'application/vnd.ms-excel' ||
        file.type === 'text/csv';

      if (!isExcel) {
        message.error('只能上传 Excel 或 CSV 文件！');
        return false;
      }

      const isLt50M = file.size / 1024 / 1024 < 50;
      if (!isLt50M) {
        message.error('文件大小不能超过 50MB！');
        return false;
      }

      setFileList([file as any]);
      handleValidate(file);
      return false;
    },
    onRemove: () => {
      setFileList([]);
      setValidationResult(null);
      setCurrentStep(0);
    },
  };

  // 重复记录表格
  const duplicateColumns = [
    {
      title: '物流单号',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: 200,
    },
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      width: 120,
    },
    {
      title: '平台',
      dataIndex: 'platform',
      key: 'platform',
      width: 120,
    },
    {
      title: '运费',
      dataIndex: 'cost',
      key: 'cost',
      width: 100,
      render: (cost: number) => `¥${cost.toFixed(2)}`,
    },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: 1400, margin: '0 auto' }}>
      <Title level={2}>
        <UploadOutlined /> 数据上传
      </Title>
      <Paragraph type="secondary">
        上传运费数据文件，系统会自动进行去重处理，确保数据的准确性。
      </Paragraph>

      {/* 步骤指示器 */}
      <Card style={{ marginBottom: 24 }}>
        <Steps
          current={currentStep}
          items={[
            {
              title: '选择文件',
              icon: <UploadOutlined />,
            },
            {
              title: '验证数据',
              icon: isValidating ? <ReloadOutlined spin /> : <CheckCircleOutlined />,
            },
            {
              title: '查看结果',
              icon: <EyeOutlined />,
            },
            {
              title: '导入数据',
              icon: isUploading ? <ReloadOutlined spin /> : <CheckCircleOutlined />,
            },
            {
              title: '完成',
              icon: <CheckCircleOutlined />,
            },
          ]}
        />
      </Card>

      {/* 上传进度 */}
      {(isValidating || isUploading) && (
        <Card style={{ marginBottom: 24 }}>
          <Progress
            percent={uploadProgress}
            status="active"
            strokeColor={{ from: '#108ee9', to: '#87d068' }}
          />
          <Text type="secondary">
            {isValidating ? '正在验证文件...' : '正在导入数据...'}
          </Text>
        </Card>
      )}

      {/* 上传区域 */}
      {!validationResult && !uploadResult && (
        <Card>
          <Dragger {...uploadProps} disabled={isValidating}>
            <p className="ant-upload-drag-icon">
              <UploadOutlined style={{ fontSize: 48, color: '#1890ff' }} />
            </p>
            <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
            <p className="ant-upload-hint">
              支持 Excel (.xlsx, .xls) 和 CSV (.csv) 格式，文件大小不超过 50MB
            </p>
            <p className="ant-upload-hint" style={{ marginTop: 16, color: '#faad14' }}>
              <InfoCircleOutlined /> 系统会自动检测并跳过重复记录，确保数据唯一性
            </p>
          </Dragger>
        </Card>
      )}

      {/* 验证结果 */}
      {validationResult && !uploadResult && (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Alert
            message="文件验证完成"
            description="请查看以下验证结果，确认无误后点击"确认导入"按钮。"
            type="success"
            showIcon
          />

          {/* 统计卡片 */}
          <Row gutter={16}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="文件总记录数"
                  value={validationResult.file.totalRecords}
                  prefix={<InfoCircleOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="新增记录"
                  value={validationResult.file.uniqueRecords}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="重复记录"
                  value={validationResult.file.duplicateRecords}
                  prefix={<CloseCircleOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="当前数据库"
                  value={validationResult.currentDatabase.totalRecords}
                  suffix="条"
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
          </Row>

          {/* 详细信息 */}
          <Row gutter={16}>
            <Col span={12}>
              <Card title="文件信息" size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text strong>日期范围：</Text>
                    <Tag color="blue">{validationResult.file.dateRange.min}</Tag>
                    <Text>至</Text>
                    <Tag color="blue">{validationResult.file.dateRange.max}</Tag>
                  </div>
                  <div>
                    <Text strong>平台分布：</Text>
                    <div style={{ marginTop: 8 }}>
                      {Object.entries(validationResult.file.platforms).map(([platform, count]) => (
                        <Tag key={platform} color="green">
                          {platform}: {count} 条
                        </Tag>
                      ))}
                    </div>
                  </div>
                </Space>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="当前数据库" size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text strong>数据范围：</Text>
                    {validationResult.currentDatabase.dateRange ? (
                      <>
                        <Tag color="purple">{validationResult.currentDatabase.dateRange.min}</Tag>
                        <Text>至</Text>
                        <Tag color="purple">{validationResult.currentDatabase.dateRange.max}</Tag>
                      </>
                    ) : (
                      <Text type="secondary">暂无数据</Text>
                    )}
                  </div>
                  <div>
                    <Text strong>已有平台：</Text>
                    <div style={{ marginTop: 8 }}>
                      {validationResult.currentDatabase.platforms.map((platform) => (
                        <Tag key={platform} color="cyan">
                          {platform}
                        </Tag>
                      ))}
                    </div>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>

          {/* 重复记录详情 */}
          {validationResult.file.duplicateRecords > 0 && (
            <Card title={`重复记录详情 (显示前 ${validationResult.duplicateSamples.length} 条)`} size="small">
              <Alert
                message="这些记录已存在于数据库中，将被自动跳过"
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Table
                columns={duplicateColumns}
                dataSource={validationResult.duplicateSamples}
                rowKey="orderNumber"
                size="small"
                pagination={false}
              />
            </Card>
          )}

          {/* 操作按钮 */}
          <Card>
            <Space size="large">
              <Button
                type="primary"
                size="large"
                icon={<UploadOutlined />}
                onClick={handleConfirmUpload}
                loading={isUploading}
              >
                确认导入
              </Button>
              <Button size="large" onClick={handleReset}>
                重新选择文件
              </Button>
            </Space>
          </Card>
        </Space>
      )}

      {/* 上传成功结果 */}
      {uploadResult && (
        <Result
          status="success"
          title="数据导入成功！"
          subTitle={
            <Space direction="vertical" size="large" style={{ marginTop: 24 }}>
              <div>
                <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 24, marginRight: 8 }} />
                <Text strong style={{ fontSize: 16 }}>
                  成功导入 {uploadResult.imported.toLocaleString()} 条新记录
                </Text>
              </div>
              {uploadResult.duplicates > 0 && (
                <div>
                  <InfoCircleOutlined style={{ color: '#faad14', fontSize: 24, marginRight: 8 }} />
                  <Text style={{ fontSize: 16 }}>
                    跳过 {uploadResult.duplicates.toLocaleString()} 条重复记录
                  </Text>
                </div>
              )}
              <Divider />
              <Row gutter={16} justify="center">
                <Col>
                  <Statistic
                    title="当前数据库总记录数"
                    value={uploadResult.currentDatabase.totalRecords}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
                <Col>
                  <Statistic
                    title="数据日期范围"
                    value={
                      uploadResult.currentDatabase.dateRange
                        ? `${uploadResult.currentDatabase.dateRange.min} ~ ${uploadResult.currentDatabase.dateRange.max}`
                        : '暂无'
                    }
                    valueStyle={{ fontSize: 16 }}
                  />
                </Col>
              </Row>
            </Space>
          }
          extra={[
            <Button type="primary" size="large" key="dashboard" onClick={() => navigate('/')}>
              查看运营分析
            </Button>,
            <Button size="large" key="upload" onClick={handleReset}>
              继续上传
            </Button>,
          ]}
        />
      )}

      {/* 使用说明 */}
      {!validationResult && !uploadResult && (
        <Card title="使用说明" style={{ marginTop: 24 }} size="small">
          <Space direction="vertical" size="small">
            <Text>📌 <strong>去重规则：</strong>系统使用"物流单号 + 日期"作为唯一标识</Text>
            <Text>📌 <strong>文件格式：</strong>支持 Excel (.xlsx, .xls) 和 CSV (.csv)</Text>
            <Text>📌 <strong>文件大小：</strong>不超过 50MB</Text>
            <Text>📌 <strong>必需字段：</strong>物流单号、出库单时间、计算重量、运费、平台、订单金额</Text>
            <Text>📌 <strong>查看数据：</strong>上传成功后，点击"查看运营分析"或直接刷新首页即可查看最新数据</Text>
          </Space>
        </Card>
      )}
    </div>
  );
};

export default UploadData;

