import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';
import prisma from '../config/db.js';
import { uploadFile, getPresignedUrl } from '../services/s3.service.js';
import { createLog } from '../services/log.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { watermarkPdf } from '../services/watermark.service.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const assertFolderAccess = (folder, userRole) => {
  if (!folder.allowedRoles.includes(userRole)) {
    const err = new Error('You do not have access to this folder');
    err.status = 403;
    throw err;
  }
};

export const getDocuments = asyncHandler(async (req, res) => {
  const { folderId } = req.params;
  const folder = await prisma.folder.findUnique({ where: { id: folderId } });
  if (!folder) return res.status(404).json({ error: 'Folder not found' });
  assertFolderAccess(folder, req.user.role);

  const documents = await prisma.document.findMany({
    where: { folderId, deletedAt: null },
    select: {
      id: true, name: true, sizeBytes: true, mimeType: true,
      uploadedAt: true, folderId: true, requiresAck: true, tags: true, expiresAt: true,
      uploader: { select: { id: true, name: true } },
    },
    orderBy: { uploadedAt: 'desc' },
  });

  res.json(documents);
});

export const uploadDocument = asyncHandler(async (req, res) => {
  const { folderId } = req.params;
  const folder = await prisma.folder.findUnique({ where: { id: folderId } });
  if (!folder) return res.status(404).json({ error: 'Folder not found' });
  assertFolderAccess(folder, req.user.role);

  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const key = `${folderId}/${uuidv4()}-${req.file.originalname}`;
  await uploadFile({ key, buffer: req.file.buffer, mimeType: req.file.mimetype });

  const doc = await prisma.document.create({
    data: {
      folderId,
      name: req.file.originalname,
      storageKey: key,
      sizeBytes: req.file.size,
      mimeType: req.file.mimetype,
      uploadedBy: req.user.id,
    },
    select: {
      id: true, name: true, sizeBytes: true, mimeType: true, uploadedAt: true, folderId: true,
    },
  });

  await createLog({
    userId: req.user.id,
    action: 'upload',
    targetType: 'document',
    targetId: doc.id,
    targetName: doc.name,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(201).json(doc);
});

// View endpoint — returns a plain URL for inline viewing (no watermark, no download header)
export const viewDocument = asyncHandler(async (req, res) => {
  const doc = await prisma.document.findUnique({
    where: { id: req.params.id },
    include: { folder: true },
  });
  if (!doc || doc.deletedAt) return res.status(404).json({ error: 'Document not found' });
  assertFolderAccess(doc.folder, req.user.role);

  const url = await getPresignedUrl(doc.storageKey);
  res.json({ url });
});

// View-blob endpoint — streams raw file bytes so frontend can create a blob URL (avoids X-Frame-Options)
export const viewDocumentBlob = asyncHandler(async (req, res) => {
  const doc = await prisma.document.findUnique({
    where: { id: req.params.id },
    include: { folder: true },
  });
  if (!doc || doc.deletedAt) return res.status(404).json({ error: 'Document not found' });
  assertFolderAccess(doc.folder, req.user.role);

  const { readFile } = await import('fs/promises');
  const filePath = path.join(__dirname, '../../uploads', doc.storageKey);
  const bytes = await readFile(filePath);
  res.setHeader('Content-Type', doc.mimeType || 'application/pdf');
  res.setHeader('Content-Disposition', 'inline');
  res.send(bytes);
});

// Download endpoint — watermarks PDFs and streams them; returns URL for other types
export const downloadDocument = asyncHandler(async (req, res) => {
  const doc = await prisma.document.findUnique({
    where: { id: req.params.id },
    include: { folder: true },
  });

  if (!doc || doc.deletedAt) return res.status(404).json({ error: 'Document not found' });
  assertFolderAccess(doc.folder, req.user.role);

  await createLog({
    userId: req.user.id,
    action: 'download',
    targetType: 'document',
    targetId: doc.id,
    targetName: doc.name,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  if (doc.mimeType === 'application/pdf') {
    try {
      const watermarked = await watermarkPdf(doc.storageKey, req.user.name);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(doc.name)}"`);
      return res.send(watermarked);
    } catch (err) {
      console.error('Watermark failed, serving original:', err.message);
    }
  }

  const url = await getPresignedUrl(doc.storageKey);
  res.json({ url, filename: doc.name });
});

export const deleteDocument = asyncHandler(async (req, res) => {
  const doc = await prisma.document.findUnique({ where: { id: req.params.id } });
  if (!doc || doc.deletedAt) return res.status(404).json({ error: 'Document not found' });

  await prisma.document.update({
    where: { id: req.params.id },
    data: { deletedAt: new Date() },
  });

  await createLog({
    userId: req.user.id,
    action: 'delete',
    targetType: 'document',
    targetId: doc.id,
    targetName: doc.name,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.json({ message: 'Document deleted' });
});

export const bulkDeleteDocuments = asyncHandler(async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'ids must be a non-empty array' });
  }

  await prisma.document.updateMany({
    where: { id: { in: ids }, deletedAt: null },
    data: { deletedAt: new Date() },
  });

  await createLog({
    userId: req.user.id,
    action: 'bulk_delete',
    targetType: 'document',
    targetName: `${ids.length} documents`,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.json({ message: `${ids.length} documents deleted` });
});

export const updateTags = asyncHandler(async (req, res) => {
  const { tags } = req.body;
  if (!Array.isArray(tags)) return res.status(400).json({ error: 'tags must be an array' });
  const doc = await prisma.document.update({
    where: { id: req.params.id },
    data: { tags },
    select: { id: true, name: true, tags: true },
  });
  res.json(doc);
});

export const updateExpiry = asyncHandler(async (req, res) => {
  const { expiresAt } = req.body;
  const doc = await prisma.document.update({
    where: { id: req.params.id },
    data: { expiresAt: expiresAt ? new Date(expiresAt) : null },
    select: { id: true, name: true, expiresAt: true },
  });
  res.json(doc);
});
