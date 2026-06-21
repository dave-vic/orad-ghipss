import { Router } from 'express';
import { setup2FA, enable2FA, disable2FA, verify2FAToken } from '../controllers/twoFactor.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.get('/2fa/setup', authenticate, setup2FA);
router.post('/2fa/enable', authenticate, enable2FA);
router.post('/2fa/disable', authenticate, disable2FA);
router.post('/2fa/verify', verify2FAToken); // no auth - called during login flow

export default router;
