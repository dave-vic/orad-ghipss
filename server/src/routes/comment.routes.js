import { Router } from 'express';
import { getComments, addComment, deleteComment } from '../controllers/comment.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();
router.get('/:id/comments', authenticate, getComments);
router.post('/:id/comments', authenticate, addComment);
router.delete('/:id/comments/:commentId', authenticate, deleteComment);
export default router;
