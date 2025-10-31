import { Router } from 'express';
import { upload } from '../middleware/uploadMiddleware';
import { uploadExcel, validateExcel } from '../controllers/uploadController';

const router = Router();

/**
 * POST /api/upload
 * 上传并导入 Excel 文件（自动去重）
 */
router.post('/', upload.single('file'), uploadExcel);

/**
 * POST /api/upload/validate
 * 验证 Excel 文件（不导入，只检查重复）
 */
router.post('/validate', upload.single('file'), validateExcel);

export default router;

