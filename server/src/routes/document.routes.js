import { Router } from 'express';
import { viewDocument, viewDocumentBlob, downloadDocument, deleteDocument, bulkDeleteDocuments, updateTags, updateExpiry } from '../controllers/document.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

router.post('/bulk-delete', authenticate, requireRole('admin'), bulkDeleteDocuments);
router.get('/:id/view', authenticate, viewDocument);
router.get('/:id/view-blob', authenticate, viewDocumentBlob);
router.get('/:id/download', authenticate, downloadDocument);
router.delete('/:id', authenticate, requireRole('admin'), deleteDocument);
router.patch('/:id/tags', authenticate, requireRole('admin'), updateTags);
router.patch('/:id/expiry', authenticate, requireRole('admin'), updateExpiry);

export default router;
