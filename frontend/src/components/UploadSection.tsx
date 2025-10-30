import React, { useState } from 'react';
import { Upload, Button, message, Card } from 'antd';
import { InboxOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { uploadExcelFile } from '../services/api';

const { Dragger } = Upload;

interface UploadSectionProps {
  onUploadSuccess?: () => void;
}

const UploadSection: React.FC<UploadSectionProps> = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const response = await uploadExcelFile(file);
      if (response.success) {
        message.success(`成功上传！处理了 ${response.recordsProcessed} 条记录`);
        onUploadSuccess?.();
      } else {
        message.error(response.message || '上传失败');
      }
    } catch (error: any) {
      console.error('上传错误:', error);
      message.error(error.response?.data?.message || '上传失败，请重试');
    } finally {
      setUploading(false);
    }
    return false; // 阻止默认上传行为
  };

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    accept: '.xlsx,.xls',
    beforeUpload: handleUpload,
    showUploadList: false,
  };

  return (
    <Card title="📤 上传运费数据" className="upload-card">
      <Dragger {...uploadProps} disabled={uploading}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined style={{ color: '#1890ff' }} />
        </p>
        <p className="ant-upload-text">点击或拖拽 Excel 文件到此区域上传</p>
        <p className="ant-upload-hint">
          支持 .xlsx 和 .xls 格式的文件，单个文件不超过 10MB
        </p>
        <p className="ant-upload-hint" style={{ fontSize: '12px', color: '#999' }}>
          文件应包含：重量、运费、日期等字段
        </p>
      </Dragger>
      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <Button
          type="primary"
          icon={<UploadOutlined />}
          loading={uploading}
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.xlsx,.xls';
            input.onchange = (e: any) => {
              const file = e.target?.files?.[0];
              if (file) handleUpload(file);
            };
            input.click();
          }}
        >
          {uploading ? '上传中...' : '选择文件上传'}
        </Button>
      </div>
    </Card>
  );
};

export default UploadSection;

