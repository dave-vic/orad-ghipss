import prisma from '../config/db.js';
import { createLog } from '../services/log.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Check if current user has acknowledged a document
export const checkAcknowledgement = asyncHandler(async (req, res) => {
  const ack = await prisma.documentAcknowledgement.findUnique({
    where: { userId_documentId: { userId: req.user.id, documentId: req.params.id } },
  });
  res.json({ acknowledged: !!ack, acknowledgedAt: ack?.acknowledgedAt || null });
});

// Submit acknowledgement
export const acknowledgeDocument = asyncHandler(async (req, res) => {
  const doc = await prisma.document.findUnique({ where: { id: req.params.id } });
  if (!doc || doc.deletedAt) return res.status(404).json({ error: 'Document not found' });

  const ack = await prisma.documentAcknowledgement.upsert({
    where: { userId_documentId: { userId: req.user.id, documentId: req.params.id } },
    update: {},
    create: { userId: req.user.id, documentId: req.params.id },
  });

  await createLog({
    userId: req.user.id,
    action: 'acknowledge',
    targetType: 'document',
    targetId: doc.id,
    targetName: doc.name,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.json(ack);
});

// Admin: list all acknowledgements for a document
export const getDocumentAcknowledgements = asyncHandler(async (req, res) => {
  const acks = await prisma.documentAcknowledgement.findMany({
    where: { documentId: req.params.id },
    include: { user: { select: { id: true, name: true, email: true, username: true } } },
    orderBy: { acknowledgedAt: 'desc' },
  });
  res.json(acks);
});

// Admin: toggle requiresAck on a document
export const setRequiresAck = asyncHandler(async (req, res) => {
  const { requiresAck } = req.body;
  const doc = await prisma.document.update({
    where: { id: req.params.id },
    data: { requiresAck: Boolean(requiresAck) },
    select: { id: true, name: true, requiresAck: true },
  });
  res.json(doc);
});
