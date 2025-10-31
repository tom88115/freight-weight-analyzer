/**
 * 重量段计算工具
 * 根据猫砂产品特性定义重量段：
 * - 2kg以内：小件商品
 * - 2-3kg：单包猫砂（2.4-2.6kg含包装）
 * - 4-6kg：双包猫砂（约4.8-5.2kg）
 * - 9-11kg：四包猫砂（约9.6-10.4kg）
 * - 14-16kg：六包猫砂（约14.4-15.6kg）
 * - 其他：不在以上范围的订单
 */

export const WEIGHT_RANGES = [
  { min: 0, max: 2, label: '2kg以内', description: '小件商品' },
  { min: 2, max: 3, label: '2-3kg', description: '单包猫砂' },
  { min: 4, max: 6, label: '4-6kg', description: '双包猫砂' },
  { min: 9, max: 11, label: '9-11kg', description: '四包猫砂' },
  { min: 14, max: 16, label: '14-16kg', description: '六包猫砂' },
  { min: -1, max: -1, label: '其他', description: '其他重量' }, // 特殊标记，用于不匹配的重量
];

/**
 * 根据重量获取对应的重量段
 * @param weight 重量（公斤）
 * @returns 重量段标签
 */
export function getWeightRange(weight: number): string {
  // 按顺序查找匹配的重量段
  for (const range of WEIGHT_RANGES) {
    if (range.min === -1) continue; // 跳过"其他"
    if (weight >= range.min && weight < range.max) {
      return range.label;
    }
  }
  // 如果没有匹配到任何范围，返回"其他"
  return '其他';
}

/**
 * 获取所有重量段标签
 * @returns 重量段标签数组
 */
export function getAllWeightRangeLabels(): string[] {
  return WEIGHT_RANGES.map((r) => r.label);
}

