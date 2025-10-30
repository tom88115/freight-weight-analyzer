import { Request, Response } from 'express';
import { parseExcelFile } from '../utils/excelParser';
import { memoryStorage } from '../storage/memoryStorage';
import { UploadResponse } from '../types';

/**
 * 处理 Excel 文件上传
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

    // 保存到内存存储
    const savedRecords = await memoryStorage.insertMany(records);

    res.json({
      success: true,
      message: `成功导入 ${savedRecords.length} 条记录`,
      recordsProcessed: savedRecords.length,
      data: savedRecords,
    } as UploadResponse);
  } catch (error) {
    console.error('上传处理错误:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '文件处理失败',
    } as UploadResponse);
  }
};

