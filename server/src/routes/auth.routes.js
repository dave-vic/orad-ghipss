import { Router } from 'express';
import { login, me, logout, profile, changePassword, getSessions, revokeSession, getLoginHistory } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { loginRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/login', loginRateLimiter, login);
router.get('/me', authenticate, me);
router.post('/logout', authenticate, logout);
router.get('/profile', authenticate, profile);
router.patch('/password', authenticate, changePassword);
router.get('/sessions', authenticate, getSessions);
router.delete('/sessions/:id', authenticate, revokeSession);
router.get('/login-history', authenticate, getLoginHistory);

export default router;
