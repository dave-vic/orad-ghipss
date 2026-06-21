import prisma from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Current user's acknowledgements
export const getMyAcknowledgements = asyncHandler(async (req, res) => {
  const acks = await prisma.documentAcknowledgement.findMany({
    where: { userId: req.user.id },
    include: {
      document: {
        select: {
          id: true, name: true, mimeType: true, folderId: true,
          folder: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { acknowledgedAt: 'desc' },
  });
  res.json(acks);
});

// Current user's recently viewed documents (from activity logs)
export const getRecentlyViewed = asyncHandler(async (req, res) => {
  const logs = await prisma.activityLog.findMany({
    where: {
      userId: req.user.id,
      action: { in: ['download', 'view'] },
      targetType: 'document',
      targetId: { not: null },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  // Deduplicate by targetId, keep most recent
  const seen = new Set();
  const unique = logs.filter(l => {
    if (seen.has(l.targetId)) return false;
    seen.add(l.targetId);
    return true;
  }).slice(0, 8);

  res.json(unique.map(l => ({
    documentId: l.targetId,
    name: l.targetName,
    lastAccessedAt: l.createdAt,
    action: l.action,
  })));
});
