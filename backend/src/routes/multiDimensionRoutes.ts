import express from 'express';
import { getMultiDimensionAnalysis, getWeightRangeAnalysis } from '../controllers/multiDimensionController';

const router = express.Router();

// 获取完整的多维度分析
router.get('/', getMultiDimensionAnalysis);

// 获取指定重量段的分析
router.get('/weight-range/:range', getWeightRangeAnalysis);

export default router;

