import { FreightRecord } from '../types';

// 内存存储（用于没有 MongoDB 的情况）
let records: FreightRecord[] = [];

/**
 * 生成记录的唯一键
 * 使用：物流单号 + 日期 作为唯一标识
 */
function getRecordKey(record: FreightRecord): string {
  const dateStr = new Date(record.date).toISOString().split('T')[0];
  return `${record.orderNumber}_${dateStr}`;
}

export const memoryStorage = {
  /**
   * 批量插入记录（带去重）
   * @param data 要插入的记录数组
   * @param skipDuplicates 是否跳过重复记录（默认 true）
   * @returns 实际插入的记录和去重统计
   */
  async insertMany(
    data: FreightRecord[], 
    skipDuplicates: boolean = true
  ): Promise<FreightRecord[]> {
    const newRecords = data.map((record, index) => ({
      ...record,
      id: record.id || `mem_${Date.now()}_${index}`,
    }));
    
    if (!skipDuplicates) {
      // 不去重，直接插入
      for (const record of newRecords) {
        records.push(record);
      }
      return newRecords;
    }
    
    // 去重逻辑
    const existingKeys = new Set<string>();
    for (const record of records) {
      existingKeys.add(getRecordKey(record));
    }
    
    const uniqueRecords: FreightRecord[] = [];
    const duplicateRecords: FreightRecord[] = [];
    
    for (const record of newRecords) {
      const key = getRecordKey(record);
      if (existingKeys.has(key)) {
        duplicateRecords.push(record);
      } else {
        existingKeys.add(key);
        uniqueRecords.push(record);
        records.push(record);
      }
    }
    
    console.log(`📊 数据导入统计:`);
    console.log(`  - 总记录数: ${newRecords.length}`);
    console.log(`  - 新增记录: ${uniqueRecords.length}`);
    console.log(`  - 重复记录: ${duplicateRecords.length}`);
    
    return uniqueRecords;
  },
  
  /**
   * 检查重复记录
   * @param data 要检查的记录数组
   * @returns 重复的记录
   */
  async findDuplicates(data: FreightRecord[]): Promise<{
    duplicates: FreightRecord[];
    unique: FreightRecord[];
  }> {
    const existingKeys = new Set<string>();
    for (const record of records) {
      existingKeys.add(getRecordKey(record));
    }
    
    const duplicates: FreightRecord[] = [];
    const unique: FreightRecord[] = [];
    
    for (const record of data) {
      const key = getRecordKey(record);
      if (existingKeys.has(key)) {
        duplicates.push(record);
      } else {
        unique.push(record);
      }
    }
    
    return { duplicates, unique };
  },

  async find(query: any = {}): Promise<FreightRecord[]> {
    let filteredRecords = [...records];

    // 简单的日期筛选
    if (query.date) {
      if (query.date.$gte) {
        const startDate = new Date(query.date.$gte).getTime();
        filteredRecords = filteredRecords.filter(
          (r) => new Date(r.date).getTime() >= startDate
        );
      }
      if (query.date.$lte) {
        const endDate = new Date(query.date.$lte).getTime();
        filteredRecords = filteredRecords.filter(
          (r) => new Date(r.date).getTime() <= endDate
        );
      }
    }

    // 承运商筛选
    if (query.carrier) {
      filteredRecords = filteredRecords.filter((r) => r.carrier === query.carrier);
    }

    return filteredRecords;
  },

  async countDocuments(query: any = {}): Promise<number> {
    const filtered = await this.find(query);
    return filtered.length;
  },

  async deleteMany(): Promise<{ deletedCount: number }> {
    const count = records.length;
    records = [];
    return { deletedCount: count };
  },
  
  /**
   * 获取当前数据的统计信息
   */
  async getStats(): Promise<{
    totalRecords: number;
    dateRange: { min: string; max: string } | null;
    platforms: string[];
  }> {
    if (records.length === 0) {
      return {
        totalRecords: 0,
        dateRange: null,
        platforms: [],
      };
    }
    
    const dates = records.map(r => new Date(r.date).getTime());
    const minDate = new Date(Math.min(...dates)).toISOString().split('T')[0];
    const maxDate = new Date(Math.max(...dates)).toISOString().split('T')[0];
    
    const platformSet = new Set<string>();
    for (const record of records) {
      if (record.platform) {
        platformSet.add(record.platform);
      }
    }
    
    return {
      totalRecords: records.length,
      dateRange: { min: minDate, max: maxDate },
      platforms: Array.from(platformSet),
    };
  },
};
