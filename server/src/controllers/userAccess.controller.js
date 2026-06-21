import prisma from '../config/db.js';
import { createLog } from '../services/log.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { z } from 'zod';

const grantSchema = z.object({
  folderId: z.string(),
  expiresAt: z.string().datetime().nullable().optional(),
});

export const getUserFolderAccess = asyncHandler(async (req, res) => {
  const access = await prisma.userFolderAccess.findMany({
    where: { userId: req.params.id },
    include: { folder: { select: { id: true, name: true } } },
  });
  res.json(access);
});

export const grantFolderAccess = asyncHandler(async (req, res) => {
  const { folderId, expiresAt } = grantSchema.parse(req.body);

  const folder = await prisma.folder.findUnique({ where: { id: folderId } });
  if (!folder) return res.status(404).json({ error: 'Folder not found' });

  const access = await prisma.userFolderAccess.upsert({
    where: { userId_folderId: { userId: req.params.id, folderId } },
    update: { expiresAt: expiresAt ? new Date(expiresAt) : null, grantedBy: req.user.id },
    create: {
      userId: req.params.id,
      folderId,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      grantedBy: req.user.id,
    },
    include: { folder: { select: { id: true, name: true } } },
  });

  const targetUser = await prisma.user.findUnique({ where: { id: req.params.id }, select: { name: true } });

  await createLog({
    userId: req.user.id,
    action: 'folder_access_grant',
    targetType: 'user',
    targetId: req.params.id,
    targetName: targetUser?.name,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(201).json(access);
});

export const revokeFolderAccess = asyncHandler(async (req, res) => {
  await prisma.userFolderAccess.delete({
    where: { userId_folderId: { userId: req.params.id, folderId: req.params.folderId } },
  });

  const targetUser = await prisma.user.findUnique({ where: { id: req.params.id }, select: { name: true } });

  await createLog({
    userId: req.user.id,
    action: 'folder_access_revoke',
    targetType: 'user',
    targetId: req.params.id,
    targetName: targetUser?.name,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.json({ message: 'Access revoked' });
});
