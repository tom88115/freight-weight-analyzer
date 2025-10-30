/**
 * 运费数据记录接口
 */
export interface FreightRecord {
  id?: string;
  orderNumber?: string;           // 订单号
  weight: number;                  // 重量（公斤）
  cost: number;                    // 运费成本
  destination?: string;            // 目的地
  carrier?: string;                // 承运商
  date: Date;                      // 日期
  weightRange?: string;            // 重量段（自动计算）
  remarks?: string;                // 备注
}

/**
 * 重量段统计接口
 */
export interface WeightRangeStats {
  range: string;                   // 重量段范围，如 "0-1kg", "1-5kg"
  count: number;                   // 该重量段的订单数量
  totalCost: number;               // 该重量段的总运费
  averageCost: number;             // 该重量段的平均运费
  percentage: number;              // 占总订单的百分比
}

/**
 * 分析结果接口
 */
export interface AnalysisResult {
  totalRecords: number;            // 总记录数
  totalCost: number;               // 总运费
  averageCost: number;             // 平均运费
  weightRanges: WeightRangeStats[]; // 各重量段统计
  dateRange?: {
    start: Date;
    end: Date;
  };
}

/**
 * Excel 上传响应接口
 */
export interface UploadResponse {
  success: boolean;
  message: string;
  recordsProcessed?: number;
  data?: FreightRecord[];
}

