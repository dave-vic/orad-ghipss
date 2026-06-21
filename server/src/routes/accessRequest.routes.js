import { Router } from 'express';
import { createAccessRequest, getAccessRequests, getMyAccessRequests, reviewAccessRequest, getPendingCount } from '../controllers/accessRequest.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

router.post('/', authenticate, createAccessRequest);
router.get('/', authenticate, requireRole('admin'), getAccessRequests);
router.get('/mine', authenticate, getMyAccessRequests);
router.get('/pending-count', authenticate, requireRole('admin'), getPendingCount);
router.patch('/:id/review', authenticate, requireRole('admin'), reviewAccessRequest);

export default router;
