import { Request, Response } from 'express';
import FreightModel from '../models/FreightModel';
import { analyzeFreightData, filterByDateRange, filterByCarrier } from '../utils/dataAnalyzer';
import { FreightRecord } from '../types';

/**
 * 获取运费数据分析结果
 */
export const getAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, carrier } = req.query;

    // 从数据库获取所有记录
    let records = await FreightModel.find().lean();

    // 转换为 FreightRecord 类型
    const freightRecords: FreightRecord[] = records.map((r: any) => ({
      id: r._id.toString(),
      orderNumber: r.orderNumber,
      weight: r.weight,
      cost: r.cost,
      destination: r.destination,
      carrier: r.carrier,
      date: new Date(r.date),
      weightRange: r.weightRange,
      remarks: r.remarks,
    }));

    // 应用筛选条件
    let filteredRecords = freightRecords;

    if (startDate || endDate) {
      filteredRecords = filterByDateRange(
        filteredRecords,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
    }

    if (carrier) {
      filteredRecords = filterByCarrier(filteredRecords, carrier as string);
    }

    // 执行数据分析
    const analysis = analyzeFreightData(filteredRecords);

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error('分析数据错误:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '数据分析失败',
    });
  }
};

/**
 * 获取所有运费记录
 */
export const getAllRecords = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 50, carrier, startDate, endDate } = req.query;

    const query: any = {};

    if (carrier) {
      query.carrier = carrier;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate as string);
      if (endDate) query.date.$lte = new Date(endDate as string);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [records, total] = await Promise.all([
      FreightModel.find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      FreightModel.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: records,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('获取记录错误:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '获取数据失败',
    });
  }
};

/**
 * 删除所有记录（仅用于开发/测试）
 */
export const clearAllRecords = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await FreightModel.deleteMany({});
    res.json({
      success: true,
      message: `已删除 ${result.deletedCount} 条记录`,
    });
  } catch (error) {
    console.error('删除记录错误:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '删除失败',
    });
  }
};

