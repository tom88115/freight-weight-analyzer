import express from 'express';
import { getFreightReport } from '../controllers/freightReportController';

const router = express.Router();

// 获取运费分析报表
router.get('/', getFreightReport);

export default router;

