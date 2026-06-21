import prisma from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { z } from 'zod';
import { createLog } from '../services/log.service.js';

const createFolderSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  icon: z.string().optional(),
  allowedRoles: z.array(z.enum(['admin', 'member', 'viewer'])).min(1),
  announcement: z.string().optional(),
});

export const getFolders = asyncHandler(async (req, res) => {
  const userRole = req.user.role;
  const folders = await prisma.folder.findMany({
    where: {
      allowedRoles: { has: userRole },
    },
    include: {
      _count: { select: { documents: { where: { deletedAt: null } } } },
    },
    orderBy: { createdAt: 'asc' },
  });
  res.json(folders);
});

export const getFolder = asyncHandler(async (req, res) => {
  const folder = await prisma.folder.findUnique({
    where: { id: req.params.id },
    include: { _count: { select: { documents: { where: { deletedAt: null } } } } },
  });
  if (!folder) return res.status(404).json({ error: 'Folder not found' });
  res.json(folder);
});

export const createFolder = asyncHandler(async (req, res) => {
  const data = createFolderSchema.parse(req.body);
  const folder = await prisma.folder.create({ data });
  res.status(201).json(folder);
});

const updateFolderSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  allowedRoles: z.array(z.enum(['admin', 'member', 'viewer'])).min(1).optional(),
  announcement: z.string().optional(),
});

export const updateFolder = asyncHandler(async (req, res) => {
  const data = updateFolderSchema.parse(req.body);
  const folder = await prisma.folder.update({
    where: { id: req.params.id },
    data,
  });
  await createLog({
    userId: req.user.id,
    action: 'folder_edit',
    targetType: 'folder',
    targetId: folder.id,
    targetName: folder.name,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });
  res.json(folder);
});

export const deleteFolder = asyncHandler(async (req, res) => {
  const folder = await prisma.folder.findUnique({ where: { id: req.params.id } });
  if (!folder) return res.status(404).json({ error: 'Folder not found' });

  // Soft-delete all documents in folder first
  await prisma.document.updateMany({
    where: { folderId: req.params.id, deletedAt: null },
    data: { deletedAt: new Date() },
  });

  await prisma.folder.delete({ where: { id: req.params.id } });

  await createLog({
    userId: req.user.id,
    action: 'folder_delete',
    targetType: 'folder',
    targetId: folder.id,
    targetName: folder.name,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.json({ message: 'Folder deleted' });
});
