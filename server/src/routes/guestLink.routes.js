import { Router } from 'express';
import { createGuestLink, getDocumentGuestLinks, deleteGuestLink, serveGuestLink } from '../controllers/guestLink.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

// Public — no auth
router.get('/guest/:token', serveGuestLink);

// Authenticated + admin
router.post('/:id/guest-links', authenticate, requireRole('admin'), createGuestLink);
router.get('/:id/guest-links', authenticate, requireRole('admin'), getDocumentGuestLinks);
router.delete('/:id/guest-links/:linkId', authenticate, requireRole('admin'), deleteGuestLink);

export default router;
