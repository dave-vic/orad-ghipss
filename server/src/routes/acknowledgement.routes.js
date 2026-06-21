import { Router } from 'express';
import { checkAcknowledgement, acknowledgeDocument, getDocumentAcknowledgements, setRequiresAck } from '../controllers/acknowledgement.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

router.get('/:id/acknowledged', authenticate, checkAcknowledgement);
router.post('/:id/acknowledge', authenticate, acknowledgeDocument);
router.get('/:id/acknowledgements', authenticate, requireRole('admin'), getDocumentAcknowledgements);
router.patch('/:id/requires-ack', authenticate, requireRole('admin'), setRequiresAck);

export default router;
