import { Router } from 'express';
import { getAnalytics, getAllRecords, clearAllRecords } from '../controllers/analyticsController';

const router = Router();

/**
 * GET /api/analytics
 * 获取运费数据分析结果
 * 查询参数：startDate, endDate, carrier
 */
router.get('/', getAnalytics);

/**
 * GET /api/analytics/records
 * 获取所有运费记录（带分页）
 * 查询参数：page, limit, carrier, startDate, endDate
 */
router.get('/records', getAllRecords);

/**
 * DELETE /api/analytics/records
 * 清空所有记录（仅用于开发/测试）
 */
router.delete('/records', clearAllRecords);

export default router;

