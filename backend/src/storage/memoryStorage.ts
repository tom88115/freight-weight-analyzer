import { FreightRecord } from '../types';

// 内存存储（用于没有 MongoDB 的情况）
let records: FreightRecord[] = [];

export const memoryStorage = {
  async insertMany(data: FreightRecord[]): Promise<FreightRecord[]> {
    const newRecords = data.map((record, index) => ({
      ...record,
      id: record.id || `mem_${Date.now()}_${index}`,
    }));
    records.push(...newRecords);
    return newRecords;
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
};

