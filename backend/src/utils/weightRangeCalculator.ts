/**
 * 重量段计算工具
 * 根据重量自动分配到对应的重量段
 */

export const WEIGHT_RANGES = [
  { min: 0, max: 1, label: '0-1kg' },
  { min: 1, max: 2, label: '1-2kg' },
  { min: 2, max: 5, label: '2-5kg' },
  { min: 5, max: 10, label: '5-10kg' },
  { min: 10, max: 20, label: '10-20kg' },
  { min: 20, max: 50, label: '20-50kg' },
  { min: 50, max: Infinity, label: '50kg以上' },
];

/**
 * 根据重量获取对应的重量段
 * @param weight 重量（公斤）
 * @returns 重量段标签
 */
export function getWeightRange(weight: number): string {
  const range = WEIGHT_RANGES.find(
    (r) => weight >= r.min && weight < r.max
  );
  return range ? range.label : '未知';
}

/**
 * 获取所有重量段标签
 * @returns 重量段标签数组
 */
export function getAllWeightRangeLabels(): string[] {
  return WEIGHT_RANGES.map((r) => r.label);
}

