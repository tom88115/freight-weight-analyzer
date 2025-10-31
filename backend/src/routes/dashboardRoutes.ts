import { Router } from 'express';
import { getDashboardData } from '../controllers/dashboardController';

const router = Router();

// GET /api/dashboard - 获取仪表板数据
router.get('/', getDashboardData);

export default router;

