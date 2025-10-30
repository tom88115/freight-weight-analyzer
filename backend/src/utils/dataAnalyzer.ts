import { FreightRecord, WeightRangeStats, AnalysisResult } from '../types';
import { getAllWeightRangeLabels } from './weightRangeCalculator';

/**
 * 分析运费数据
 * @param records 运费记录数组
 * @returns 分析结果
 */
export function analyzeFreightData(records: FreightRecord[]): AnalysisResult {
  if (records.length === 0) {
    return {
      totalRecords: 0,
      totalCost: 0,
      averageCost: 0,
      weightRanges: [],
    };
  }

  // 计算总计和平均值
  const totalRecords = records.length;
  const totalCost = records.reduce((sum, r) => sum + r.cost, 0);
  const averageCost = totalCost / totalRecords;

  // 按重量段分组统计
  const rangeMap = new Map<string, FreightRecord[]>();
  records.forEach((record) => {
    const range = record.weightRange || '未知';
    if (!rangeMap.has(range)) {
      rangeMap.set(range, []);
    }
    rangeMap.get(range)!.push(record);
  });

  // 计算每个重量段的统计数据
  const weightRanges: WeightRangeStats[] = getAllWeightRangeLabels().map((label) => {
    const rangeRecords = rangeMap.get(label) || [];
    const count = rangeRecords.length;
    const rangeTotalCost = rangeRecords.reduce((sum, r) => sum + r.cost, 0);
    const rangeAvgCost = count > 0 ? rangeTotalCost / count : 0;
    const percentage = (count / totalRecords) * 100;

    return {
      range: label,
      count,
      totalCost: rangeTotalCost,
      averageCost: rangeAvgCost,
      percentage,
    };
  });

  // 获取日期范围（优化大数据量处理）
  let minTimestamp = Infinity;
  let maxTimestamp = 0;
  for (const record of records) {
    const timestamp = record.date.getTime();
    if (timestamp < minTimestamp) minTimestamp = timestamp;
    if (timestamp > maxTimestamp) maxTimestamp = timestamp;
  }
  const dateRange = {
    start: new Date(minTimestamp),
    end: new Date(maxTimestamp),
  };

  return {
    totalRecords,
    totalCost,
    averageCost,
    weightRanges: weightRanges.filter((r) => r.count > 0),
    dateRange,
  };
}

/**
 * 按日期范围筛选数据
 * @param records 运费记录数组
 * @param startDate 开始日期
 * @param endDate 结束日期
 * @returns 筛选后的记录
 */
export function filterByDateRange(
  records: FreightRecord[],
  startDate?: Date,
  endDate?: Date
): FreightRecord[] {
  return records.filter((record) => {
    const recordDate = record.date.getTime();
    if (startDate && recordDate < startDate.getTime()) return false;
    if (endDate && recordDate > endDate.getTime()) return false;
    return true;
  });
}

/**
 * 按承运商筛选数据
 * @param records 运费记录数组
 * @param carrier 承运商名称
 * @returns 筛选后的记录
 */
export function filterByCarrier(
  records: FreightRecord[],
  carrier: string
): FreightRecord[] {
  return records.filter((record) => record.carrier === carrier);
}

