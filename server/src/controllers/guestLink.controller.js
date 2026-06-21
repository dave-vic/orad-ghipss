import prisma from '../config/db.js';
import { createLog } from '../services/log.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { z } from 'zod';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const createSchema = z.object({
  label: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
  maxViews: z.number().int().positive().optional(),
});

export const createGuestLink = asyncHandler(async (req, res) => {
  const doc = await prisma.document.findUnique({ where: { id: req.params.id } });
  if (!doc || doc.deletedAt) return res.status(404).json({ error: 'Document not found' });

  const data = createSchema.parse(req.body);

  const link = await prisma.guestLink.create({
    data: {
      documentId: doc.id,
      createdBy: req.user.id,
      label: data.label || null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      maxViews: data.maxViews || null,
    },
  });

  await createLog({
    userId: req.user.id,
    action: 'guest_link_create',
    targetType: 'document',
    targetId: doc.id,
    targetName: doc.name,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(201).json({ ...link, url: `${process.env.CLIENT_URL}/guest/${link.token}` });
});

export const getDocumentGuestLinks = asyncHandler(async (req, res) => {
  const links = await prisma.guestLink.findMany({
    where: { documentId: req.params.id },
    include: { creator: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(links.map(l => ({ ...l, url: `${process.env.CLIENT_URL}/guest/${l.token}` })));
});

export const deleteGuestLink = asyncHandler(async (req, res) => {
  await prisma.guestLink.delete({ where: { id: req.params.linkId } });
  res.json({ message: 'Link revoked' });
});

// Public route — no auth required
export const serveGuestLink = asyncHandler(async (req, res) => {
  const link = await prisma.guestLink.findUnique({
    where: { token: req.params.token },
    include: { document: true },
  });

  if (!link) return res.status(404).json({ error: 'Link not found or expired' });
  if (link.expiresAt && new Date() > link.expiresAt) {
    return res.status(410).json({ error: 'This link has expired' });
  }
  if (link.maxViews && link.viewCount >= link.maxViews) {
    return res.status(410).json({ error: 'This link has reached its view limit' });
  }
  if (link.document.deletedAt) {
    return res.status(404).json({ error: 'Document no longer available' });
  }

  await prisma.guestLink.update({
    where: { id: link.id },
    data: { viewCount: { increment: 1 } },
  });

  res.json({
    name: link.document.name,
    mimeType: link.document.mimeType,
    sizeBytes: link.document.sizeBytes,
    downloadUrl: `http://localhost:4000/files/${link.document.storageKey}`,
    label: link.label,
  });
});
