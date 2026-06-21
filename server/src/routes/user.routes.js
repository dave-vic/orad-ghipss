import { Router } from 'express';
import { getUsers, createUser, updateRole, updateStatus, deleteUser, resetPassword } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

router.use(authenticate, requireRole('admin'));

router.get('/', getUsers);
router.post('/', createUser);
router.patch('/:id/role', updateRole);
router.patch('/:id/status', updateStatus);
router.patch('/:id/password', resetPassword);
router.delete('/:id', deleteUser);

export default router;
