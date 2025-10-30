import { Router } from 'express';
import { upload } from '../middleware/uploadMiddleware';
import { uploadExcel } from '../controllers/uploadController';

const router = Router();

/**
 * POST /api/upload
 * 上传 Excel 文件
 */
router.post('/', upload.single('file'), uploadExcel);

export default router;

