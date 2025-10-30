/**
 * 运费数据记录接口
 */
export interface FreightRecord {
  _id?: string;
  orderNumber?: string;
  weight: number;
  cost: number;
  destination?: string;
  carrier?: string;
  date: string;
  weightRange?: string;
  remarks?: string;
}

/**
 * 重量段统计接口
 */
export interface WeightRangeStats {
  range: string;
  count: number;
  totalCost: number;
  averageCost: number;
  percentage: number;
}

/**
 * 分析结果接口
 */
export interface AnalysisResult {
  totalRecords: number;
  totalCost: number;
  averageCost: number;
  weightRanges: WeightRangeStats[];
  dateRange?: {
    start: string;
    end: string;
  };
}

/**
 * API 响应接口
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  recordsProcessed?: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

