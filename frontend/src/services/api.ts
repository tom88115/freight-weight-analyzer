import axios from 'axios';
import { ApiResponse, AnalysisResult, FreightRecord } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 上传 Excel 文件
 */
export const uploadExcelFile = async (file: File): Promise<ApiResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<ApiResponse>('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

/**
 * 获取分析数据
 */
export const getAnalytics = async (params?: {
  startDate?: string;
  endDate?: string;
  carrier?: string;
}): Promise<AnalysisResult> => {
  const response = await api.get<ApiResponse<AnalysisResult>>('/api/analytics', {
    params,
  });

  return response.data.data!;
};

/**
 * 获取所有记录
 */
export const getAllRecords = async (params?: {
  page?: number;
  limit?: number;
  carrier?: string;
  startDate?: string;
  endDate?: string;
}): Promise<ApiResponse<FreightRecord[]>> => {
  const response = await api.get<ApiResponse<FreightRecord[]>>('/api/analytics/records', {
    params,
  });

  return response.data;
};

/**
 * 清空所有记录
 */
export const clearAllRecords = async (): Promise<ApiResponse> => {
  const response = await api.delete<ApiResponse>('/api/analytics/records');
  return response.data;
};

export default api;

