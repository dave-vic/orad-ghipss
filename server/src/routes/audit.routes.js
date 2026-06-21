import { Router } from 'express';
import { generateAuditCertificate } from '../controllers/audit.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();
router.get('/users/:userId/audit-certificate', authenticate, requireRole('admin'), generateAuditCertificate);
export default router;
