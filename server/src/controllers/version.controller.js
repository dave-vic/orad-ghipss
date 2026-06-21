import prisma from '../config/db.js';
import { createLog } from '../services/log.service.js';
import { uploadFile } from '../services/s3.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

export const uploadMiddleware = upload.single('file');

export const getVersions = asyncHandler(async (req, res) => {
  const versions = await prisma.documentVersion.findMany({
    where: { documentId: req.params.id },
    include: { uploader: { select: { id: true, name: true } } },
    orderBy: { version: 'desc' },
  });
  res.json(versions);
});

export const uploadVersion = asyncHandler(async (req, res) => {
  const doc = await prisma.document.findUnique({ where: { id: req.params.id } });
  if (!doc || doc.deletedAt) return res.status(404).json({ error: 'Document not found' });

  if (!req.file) return res.status(400).json({ error: 'No file provided' });

  const lastVersion = await prisma.documentVersion.findFirst({
    where: { documentId: doc.id },
    orderBy: { version: 'desc' },
  });

  const versionNumber = (lastVersion?.version || 1) + 1;
  const ext = req.file.originalname.split('.').pop();
  const storageKey = `versions/${doc.id}/v${versionNumber}.${ext}`;

  await uploadFile({ key: storageKey, buffer: req.file.buffer });

  // Archive current version if this is first new upload
  if (!lastVersion) {
    await prisma.documentVersion.create({
      data: {
        documentId: doc.id,
        version: 1,
        storageKey: doc.storageKey,
        sizeBytes: doc.sizeBytes,
        uploadedBy: doc.uploadedBy,
        uploadedAt: doc.uploadedAt,
        note: 'Original version',
      },
    });
  }

  const newVersion = await prisma.documentVersion.create({
    data: {
      documentId: doc.id,
      version: versionNumber,
      storageKey,
      sizeBytes: BigInt(req.file.size),
      uploadedBy: req.user.id,
      note: req.body.note || null,
    },
    include: { uploader: { select: { id: true, name: true } } },
  });

  // Update document to point to new version
  await prisma.document.update({
    where: { id: doc.id },
    data: { storageKey, sizeBytes: BigInt(req.file.size), mimeType: req.file.mimetype },
  });

  await createLog({
    userId: req.user.id,
    action: 'version_upload',
    targetType: 'document',
    targetId: doc.id,
    targetName: doc.name,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(201).json(newVersion);
});
