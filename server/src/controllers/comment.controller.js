import prisma from '../config/db.js';
import { createLog } from '../services/log.service.js';
import { notify } from '../services/notification.service.js';
import { sendEmail, emailTemplates } from '../services/email.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { z } from 'zod';

const bodySchema = z.object({ body: z.string().min(1).max(2000) });

export const getComments = asyncHandler(async (req, res) => {
  const comments = await prisma.documentComment.findMany({
    where: { documentId: req.params.id },
    include: { user: { select: { id: true, name: true, username: true, role: true } } },
    orderBy: { createdAt: 'asc' },
  });
  res.json(comments);
});

export const addComment = asyncHandler(async (req, res) => {
  const { body } = bodySchema.parse(req.body);
  const doc = await prisma.document.findUnique({ where: { id: req.params.id } });
  if (!doc || doc.deletedAt) return res.status(404).json({ error: 'Document not found' });

  const comment = await prisma.documentComment.create({
    data: { documentId: req.params.id, userId: req.user.id, body },
    include: { user: { select: { id: true, name: true, username: true, role: true } } },
  });

  await createLog({
    userId: req.user.id,
    action: 'comment_add',
    targetType: 'document',
    targetId: doc.id,
    targetName: doc.name,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  // Notify everyone with access to this folder, except the commenter
  const folder = await prisma.folder.findUnique({
    where: { id: doc.folderId },
    select: { allowedRoles: true, name: true },
  });

  const roleUsers = await prisma.user.findMany({
    where: { role: { in: folder.allowedRoles }, active: true, id: { not: req.user.id } },
    select: { id: true },
  });

  const explicitUsers = await prisma.userFolderAccess.findMany({
    where: {
      folderId: doc.folderId,
      userId: { not: req.user.id },
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    select: { userId: true },
  });

  const recipientIds = new Set([
    ...roleUsers.map(u => u.id),
    ...explicitUsers.map(a => a.userId),
  ]);

  const preview = comment.body.length > 80 ? comment.body.slice(0, 80) + '…' : comment.body;

  await Promise.all([...recipientIds].map(userId =>
    notify({
      userId,
      type: 'comment_added',
      title: `New comment on "${doc.name}"`,
      body: `${comment.user.name}: ${preview}`,
      linkUrl: `/directory/${doc.folderId}`,
    })
  ));

  const recipients = await prisma.user.findMany({
    where: { id: { in: [...recipientIds] } },
    select: { name: true, email: true },
  });
  const emailPreview = comment.body.length > 120 ? comment.body.slice(0, 120) + '…' : comment.body;
  await Promise.all(recipients.map(r => {
    const tpl = emailTemplates.newComment({ recipientName: r.name, commenterName: comment.user.name, docName: doc.name, preview: emailPreview });
    return sendEmail({ to: r.email, ...tpl });
  }));

  res.status(201).json(comment);
});

export const deleteComment = asyncHandler(async (req, res) => {
  const comment = await prisma.documentComment.findUnique({ where: { id: req.params.commentId } });
  if (!comment) return res.status(404).json({ error: 'Comment not found' });

  // Only owner or admin can delete
  if (comment.userId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not allowed' });
  }

  await prisma.documentComment.delete({ where: { id: req.params.commentId } });
  res.json({ message: 'Comment deleted' });
});
