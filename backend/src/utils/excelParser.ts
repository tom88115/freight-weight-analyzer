import * as XLSX from 'xlsx';
import { FreightRecord } from '../types';
import { getWeightRange } from './weightRangeCalculator';

/**
 * 解析 Excel 文件并提取运费数据
 * @param filePath Excel 文件路径
 * @returns 运费记录数组
 */
export function parseExcelFile(filePath: string): FreightRecord[] {
  try {
    // 读取 Excel 文件
    const workbook = XLSX.readFile(filePath);
    
    // 获取第一个工作表
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // 将工作表转换为 JSON
    const rawData: any[] = XLSX.utils.sheet_to_json(worksheet);
    
    // 映射并处理数据
    const records: FreightRecord[] = rawData.map((row, index) => {
      // 尝试从不同的列名中提取数据（支持中英文列名）
      const weight = parseFloat(
        row['重量'] || row['重量(kg)'] || row['weight'] || row['Weight'] || 0
      );
      const cost = parseFloat(
        row['运费'] || row['费用'] || row['cost'] || row['Cost'] || 0
      );
      const date = row['日期'] || row['date'] || row['Date'] || new Date();
      
      return {
        id: `record_${Date.now()}_${index}`,
        orderNumber: row['订单号'] || row['orderNumber'] || undefined,
        weight,
        cost,
        destination: row['目的地'] || row['destination'] || undefined,
        carrier: row['承运商'] || row['carrier'] || undefined,
        date: new Date(date),
        weightRange: getWeightRange(weight),
        remarks: row['备注'] || row['remarks'] || undefined,
      };
    });
    
    return records.filter(r => r.weight > 0 && r.cost > 0);
  } catch (error) {
    throw new Error(`Excel 文件解析失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 导出数据到 Excel
 * @param records 运费记录数组
 * @param filePath 输出文件路径
 */
export function exportToExcel(records: FreightRecord[], filePath: string): void {
  try {
    // 准备导出数据
    const exportData = records.map(record => ({
      '订单号': record.orderNumber || '',
      '重量(kg)': record.weight,
      '运费': record.cost,
      '重量段': record.weightRange,
      '目的地': record.destination || '',
      '承运商': record.carrier || '',
      '日期': record.date.toLocaleDateString('zh-CN'),
      '备注': record.remarks || '',
    }));
    
    // 创建工作簿
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '运费数据');
    
    // 写入文件
    XLSX.writeFile(workbook, filePath);
  } catch (error) {
    throw new Error(`Excel 导出失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

