import * as XLSX from 'xlsx';
import { memoryStorage } from '../storage/memoryStorage';
import { FreightRecord } from '../types';

/**
 * 从 Excel 导入数据到内存存储
 */
async function importExcelData() {
  console.log('🚀 开始导入 Excel 数据...');
  
  try {
    // 读取 Excel 文件
    const filePath = '../docs/报表运费10月.xlsx';
    console.log('📖 读取文件:', filePath);
    const workbook = XLSX.readFile(filePath);
    
    console.log('📋 工作表列表:', workbook.SheetNames);
    
    // 读取第一个工作表（data）
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData: any[] = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`📊 总记录数: ${rawData.length.toLocaleString()} 条`);
    
    // 数据转换和清洗
    let validCount = 0;
    let invalidCount = 0;
    
    const records: FreightRecord[] = rawData
      .map((row, index) => {
        try {
          // 提取并转换数据
          const weight = parseFloat(row['计算重量'] || row['订单商品重量'] || 0);
          const cost = parseFloat(row['运费'] || 0);
          
          // 数据验证：重量和运费必须大于0
          if (weight <= 0 || cost <= 0 || isNaN(weight) || isNaN(cost)) {
            invalidCount++;
            return null;
          }
          
          validCount++;
          
          // 转换日期（Excel 日期是从1900年1月1日开始的天数）
          let date: Date;
          const excelDate = row['出库单时间'];
          if (typeof excelDate === 'number') {
            // Excel 日期转换
            date = new Date((excelDate - 25569) * 86400 * 1000);
          } else if (excelDate) {
            date = new Date(excelDate);
          } else {
            date = new Date('2024-10-01'); // 默认日期
          }
          
          // 构建目的地字符串
          const province = row['系统收货省份'] || '';
          const city = row['系统收货城市'] || '';
          const destination = province && city ? `${province}-${city}` : (province || city || '未知');
          
          const record: FreightRecord = {
            id: `record_${Date.now()}_${index}`,
            orderNumber: String(row['物流单号'] || row['内部订单号'] || ''),
            weight,
            cost,
            destination,
            carrier: row['物流公司'] || '未知',
            date,
            weightRange: row['公斤段'] || getWeightRangeFromWeight(weight),
            remarks: [
              row['平台'] && `平台:${row['平台']}`,
              row['店铺'] && `店铺:${row['店铺']}`,
              row['订单类型'] && `类型:${row['订单类型']}`,
            ].filter(Boolean).join(' | '),
          };
          
          return record;
        } catch (error) {
          invalidCount++;
          return null;
        }
      })
      .filter((r): r is FreightRecord => r !== null);
    
    console.log(`✅ 有效记录: ${validCount.toLocaleString()} 条`);
    console.log(`❌ 无效记录: ${invalidCount.toLocaleString()} 条`);
    console.log(`📦 准备导入: ${records.length.toLocaleString()} 条`);
    
    // 批量导入到内存存储
    console.log('💾 写入内存存储...');
    await memoryStorage.insertMany(records);
    
    console.log('🎉 数据导入完成！');
    
    // 显示统计信息
    const stats = analyzeData(records);
    console.log('\n📈 数据统计:');
    console.log(`   总运费: ¥${stats.totalCost.toFixed(2)}`);
    console.log(`   平均运费: ¥${stats.averageCost.toFixed(2)}`);
    console.log(`   最小重量: ${stats.minWeight}kg`);
    console.log(`   最大重量: ${stats.maxWeight}kg`);
    console.log(`   平均重量: ${stats.averageWeight.toFixed(2)}kg`);
    console.log(`   日期范围: ${stats.dateRange.start} ~ ${stats.dateRange.end}`);
    
    console.log('\n🏢 物流公司分布:');
    Object.entries(stats.carriers)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([carrier, count]) => {
        console.log(`   ${carrier}: ${count.toLocaleString()} 单`);
      });
    
    console.log('\n📊 重量段分布:');
    Object.entries(stats.weightRanges)
      .sort((a, b) => b[1] - a[1])
      .forEach(([range, count]) => {
        const percentage = ((count / records.length) * 100).toFixed(2);
        console.log(`   ${range}: ${count.toLocaleString()} 单 (${percentage}%)`);
      });
    
  } catch (error) {
    console.error('❌ 导入失败:', error);
    throw error;
  }
}

/**
 * 根据重量获取重量段（备用函数）
 */
function getWeightRangeFromWeight(weight: number): string {
  if (weight <= 0.5) return '0-0.5kg';
  if (weight <= 1) return '0.5-1kg';
  if (weight <= 2) return '1-2kg';
  if (weight <= 3) return '2-3kg';
  if (weight <= 5) return '3-5kg';
  if (weight <= 10) return '5-10kg';
  if (weight <= 20) return '10-20kg';
  if (weight <= 30) return '20-30kg';
  return '30kg以上';
}

/**
 * 分析数据（优化大数据量处理）
 */
function analyzeData(records: FreightRecord[]) {
  let totalCost = 0;
  let totalWeight = 0;
  let minWeight = Infinity;
  let maxWeight = 0;
  let minDate = new Date();
  let maxDate = new Date(0);
  
  const carriers: Record<string, number> = {};
  const weightRanges: Record<string, number> = {};
  
  // 单次遍历完成所有统计
  for (const record of records) {
    totalCost += record.cost;
    totalWeight += record.weight;
    
    if (record.weight < minWeight) minWeight = record.weight;
    if (record.weight > maxWeight) maxWeight = record.weight;
    
    const recordDate = new Date(record.date);
    if (recordDate < minDate) minDate = recordDate;
    if (recordDate > maxDate) maxDate = recordDate;
    
    // 统计物流公司
    const carrier = record.carrier || '未知';
    carriers[carrier] = (carriers[carrier] || 0) + 1;
    
    // 统计重量段
    const range = record.weightRange || '未知';
    weightRanges[range] = (weightRanges[range] || 0) + 1;
  }
  
  const averageCost = totalCost / records.length;
  const averageWeight = totalWeight / records.length;
  
  return {
    totalCost,
    averageCost,
    minWeight,
    maxWeight,
    averageWeight,
    dateRange: {
      start: minDate.toLocaleDateString('zh-CN'),
      end: maxDate.toLocaleDateString('zh-CN'),
    },
    carriers,
    weightRanges,
  };
}

// 执行导入
importExcelData()
  .then(() => {
    console.log('\n✨ 所有操作完成！服务器准备就绪。');
  })
  .catch(error => {
    console.error('导入过程中出错:', error);
    process.exit(1);
  });

