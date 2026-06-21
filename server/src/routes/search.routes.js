import { Router } from 'express';
import { search } from '../controllers/search.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();
router.get('/', authenticate, search);
export default router;
