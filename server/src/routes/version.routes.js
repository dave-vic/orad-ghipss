import { Router } from 'express';
import { getVersions, uploadVersion, uploadMiddleware } from '../controllers/version.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();
router.get('/:id/versions', authenticate, getVersions);
router.post('/:id/versions', authenticate, requireRole('admin'), uploadMiddleware, uploadVersion);
export default router;
