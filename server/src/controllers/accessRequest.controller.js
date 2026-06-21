import prisma from '../config/db.js';
import { createLog } from '../services/log.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { notify } from '../services/notification.service.js';
import { sendEmail, emailTemplates } from '../services/email.service.js';
import { z } from 'zod';

const createSchema = z.object({
  folderId: z.string(),
  reason: z.string().min(10),
});

const reviewSchema = z.object({
  status: z.enum(['approved', 'denied']),
  reviewNote: z.string().optional(),
});

// Submit an access request (any authenticated user)
export const createAccessRequest = asyncHandler(async (req, res) => {
  const { folderId, reason } = createSchema.parse(req.body);

  const folder = await prisma.folder.findUnique({ where: { id: folderId } });
  if (!folder) return res.status(404).json({ error: 'Folder not found' });

  // Already has access
  if (folder.allowedRoles.includes(req.user.role)) {
    return res.status(400).json({ error: 'You already have access to this folder' });
  }

  const existing = await prisma.accessRequest.findUnique({
    where: { userId_folderId: { userId: req.user.id, folderId } },
  });
  if (existing && existing.status === 'pending') {
    return res.status(400).json({ error: 'You already have a pending request for this folder' });
  }

  const request = await prisma.accessRequest.upsert({
    where: { userId_folderId: { userId: req.user.id, folderId } },
    update: { reason, status: 'pending', reviewedBy: null, reviewNote: null, reviewedAt: null, createdAt: new Date() },
    create: { userId: req.user.id, folderId, reason },
    include: { folder: { select: { name: true } }, user: { select: { name: true } } },
  });

  await createLog({
    userId: req.user.id,
    action: 'access_request',
    targetType: 'folder',
    targetId: folderId,
    targetName: folder.name,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(201).json(request);
});

// Admin: get all requests
export const getAccessRequests = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const requests = await prisma.accessRequest.findMany({
    where: status ? { status } : {},
    include: {
      user: { select: { id: true, name: true, email: true, username: true, role: true } },
      folder: { select: { id: true, name: true } },
      reviewer: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(requests);
});

// Get current user's own requests
export const getMyAccessRequests = asyncHandler(async (req, res) => {
  const requests = await prisma.accessRequest.findMany({
    where: { userId: req.user.id },
    include: { folder: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(requests);
});

// Admin: approve or deny
export const reviewAccessRequest = asyncHandler(async (req, res) => {
  const { status, reviewNote } = reviewSchema.parse(req.body);

  const request = await prisma.accessRequest.update({
    where: { id: req.params.id },
    data: { status, reviewedBy: req.user.id, reviewNote, reviewedAt: new Date() },
    include: {
      user: { select: { id: true, name: true } },
      folder: { select: { id: true, name: true } },
    },
  });

  await createLog({
    userId: req.user.id,
    action: status === 'approved' ? 'access_approve' : 'access_deny',
    targetType: 'folder',
    targetId: request.folderId,
    targetName: request.folder.name,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  await notify({
    userId: request.userId,
    type: 'access_request_reviewed',
    title: status === 'approved'
      ? `Access granted to "${request.folder.name}"`
      : `Access request denied for "${request.folder.name}"`,
    body: request.reviewNote || undefined,
    linkUrl: status === 'approved' ? `/directory/${request.folderId}` : `/requests`,
  });

  const requestUser = await prisma.user.findUnique({ where: { id: request.userId }, select: { name: true, email: true } });
  const tpl = emailTemplates.accessRequestReviewed({ name: requestUser.name, folderName: request.folder.name, status, note: request.reviewNote });
  await sendEmail({ to: requestUser.email, ...tpl });

  res.json(request);
});

// Count pending requests (for admin badge)
export const getPendingCount = asyncHandler(async (req, res) => {
  const count = await prisma.accessRequest.count({ where: { status: 'pending' } });
  res.json({ count });
});
