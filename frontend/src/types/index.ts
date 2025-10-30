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

export interface WeightRangeStats {
  range: string;
  count: number;
  totalCost: number;
  averageCost: number;
  percentage: number;
}

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
