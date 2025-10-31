import { Request, Response } from 'express';
import { parseExcelFile } from '../utils/excelParser';
import { memoryStorage } from '../storage/memoryStorage';
import { UploadResponse, ValidationResponse } from '../types';

/**
 * 处理 Excel 文件上传（带去重）
 */
export const uploadExcel = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: '没有上传文件',
      } as UploadResponse);
      return;
    }

    // 解析 Excel 文件
    const records = parseExcelFile(req.file.path);

    if (records.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Excel 文件中没有有效数据',
      } as UploadResponse);
      return;
    }

    console.log(`\n📦 开始处理上传文件...`);
    console.log(`  - 文件名: ${req.file.originalname}`);
    console.log(`  - 解析记录数: ${records.length}`);

    // 先检查重复
    const { duplicates, unique } = await memoryStorage.findDuplicates(records);
    
    console.log(`\n🔍 去重检查结果:`);
    console.log(`  - 重复记录: ${duplicates.length}`);
    console.log(`  - 唯一记录: ${unique.length}`);

    // 如果有重复，显示一些示例
    if (duplicates.length > 0) {
      console.log(`\n⚠️  重复记录示例 (前5条):`);
      duplicates.slice(0, 5).forEach((record, index) => {
        const dateStr = new Date(record.date).toISOString().split('T')[0];
        console.log(`  ${index + 1}. ${record.orderNumber} | ${dateStr} | ${record.platform} | ¥${record.cost}`);
      });
    }

    // 保存到内存存储（自动去重）
    const savedRecords = await memoryStorage.insertMany(records, true);
    
    // 获取当前数据库统计
    const stats = await memoryStorage.getStats();

    res.json({
      success: true,
      message: `成功导入 ${savedRecords.length} 条新记录${duplicates.length > 0 ? `，跳过 ${duplicates.length} 条重复记录` : ''}`,
      recordsProcessed: savedRecords.length,
      data: {
        imported: savedRecords.length,
        duplicates: duplicates.length,
        total: records.length,
        currentDatabase: stats,
      },
    } as UploadResponse);
  } catch (error) {
    console.error('❌ 上传处理错误:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '文件处理失败',
    } as UploadResponse);
  }
};

/**
 * 验证待上传文件（不实际导入）
 */
export const validateExcel = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: '没有上传文件',
      });
      return;
    }

    // 解析 Excel 文件
    const records = parseExcelFile(req.file.path);

    if (records.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Excel 文件中没有有效数据',
      });
      return;
    }

    // 检查重复
    const { duplicates, unique } = await memoryStorage.findDuplicates(records);
    
    // 获取当前数据库统计
    const stats = await memoryStorage.getStats();
    
    // 分析日期范围
    const dates = records.map(r => new Date(r.date).getTime());
    const fileMinDate = new Date(Math.min(...dates)).toISOString().split('T')[0];
    const fileMaxDate = new Date(Math.max(...dates)).toISOString().split('T')[0];
    
    // 统计平台分布
    const platformCounts: { [key: string]: number } = {};
    records.forEach(r => {
      platformCounts[r.platform || '未知'] = (platformCounts[r.platform || '未知'] || 0) + 1;
    });

    res.json({
      success: true,
      message: '文件验证完成',
      data: {
        file: {
          totalRecords: records.length,
          uniqueRecords: unique.length,
          duplicateRecords: duplicates.length,
          dateRange: { min: fileMinDate, max: fileMaxDate },
          platforms: platformCounts,
        },
        currentDatabase: stats,
        duplicateSamples: duplicates.slice(0, 10).map(r => ({
          orderNumber: r.orderNumber,
          date: new Date(r.date).toISOString().split('T')[0],
          platform: r.platform,
          cost: r.cost,
        })),
      },
    });
  } catch (error) {
    console.error('❌ 验证处理错误:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '文件验证失败',
    });
  }
};
