import { Router } from 'express';
import { getNotifications, getUnreadCount, markRead, markOneRead } from '../controllers/notification.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();
router.get('/', authenticate, getNotifications);
router.get('/unread-count', authenticate, getUnreadCount);
router.post('/mark-read', authenticate, markRead);
router.patch('/:id/read', authenticate, markOneRead);
export default router;
