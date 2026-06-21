import { Router } from 'express';
import { getFavourites, addFavourite, removeFavourite } from '../controllers/favourite.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();
router.get('/', authenticate, getFavourites);
router.post('/', authenticate, addFavourite);
router.delete('/:type/:targetId', authenticate, removeFavourite);
export default router;
