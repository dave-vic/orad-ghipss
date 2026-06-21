import { Router } from 'express';
import multer from 'multer';
import { getFolders, getFolder, createFolder, updateFolder, deleteFolder } from '../controllers/folder.controller.js';
import { getDocuments, uploadDocument } from '../controllers/document.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/requireRole.js';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.get('/', authenticate, getFolders);
router.get('/:id', authenticate, getFolder);
router.post('/', authenticate, requireRole('admin'), createFolder);
router.patch('/:id', authenticate, requireRole('admin'), updateFolder);
router.delete('/:id', authenticate, requireRole('admin'), deleteFolder);
router.get('/:folderId/documents', authenticate, getDocuments);
router.post('/:folderId/documents', authenticate, requireRole('admin'), upload.single('file'), uploadDocument);

export default router;
