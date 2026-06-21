import { Router } from 'express';
import { importUsers } from '../controllers/userImport.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();
router.post('/import', authenticate, requireRole('admin'), importUsers);
export default router;
