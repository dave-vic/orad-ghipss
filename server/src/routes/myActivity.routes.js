import { Router } from 'express';
import { getMyAcknowledgements, getRecentlyViewed } from '../controllers/myActivity.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();
router.get('/acknowledgements', authenticate, getMyAcknowledgements);
router.get('/recently-viewed', authenticate, getRecentlyViewed);
export default router;
