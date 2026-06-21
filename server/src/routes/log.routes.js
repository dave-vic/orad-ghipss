import { Router } from 'express';
import { getLogs, getMyLogs, exportLogs } from '../controllers/log.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

router.get('/', authenticate, requireRole('admin'), getLogs);
router.get('/me', authenticate, getMyLogs);
router.get('/export', authenticate, requireRole('admin'), exportLogs);

export default router;
