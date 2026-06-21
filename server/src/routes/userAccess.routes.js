import { Router } from 'express';
import { getUserFolderAccess, grantFolderAccess, revokeFolderAccess } from '../controllers/userAccess.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

router.use(authenticate, requireRole('admin'));

router.get('/:id/folder-access', getUserFolderAccess);
router.post('/:id/folder-access', grantFolderAccess);
router.delete('/:id/folder-access/:folderId', revokeFolderAccess);

export default router;
