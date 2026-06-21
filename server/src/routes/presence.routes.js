import { Router } from 'express';
import { joinPresence, getPresence } from '../controllers/presence.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();
router.get('/:folderId/presence', authenticate, joinPresence);
router.get('/:folderId/presence-snapshot', authenticate, getPresence);
export default router;
