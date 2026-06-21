import prisma from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getDashboard = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const userId = req.user.id;

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalDocs,
    totalUsers,
    totalFolders,
    recentDownloads,
    recentUploads,
    recentLogins,
    topDocuments,
    recentActivity,
    pendingRequests,
    staleDocs,
  ] = await Promise.all([
    prisma.document.count({ where: { deletedAt: null } }),
    isAdmin ? prisma.user.count({ where: { active: true } }) : null,
    prisma.folder.count(),
    prisma.activityLog.count({ where: { action: 'download', createdAt: { gte: thirtyDaysAgo }, ...(isAdmin ? {} : { userId }) } }),
    isAdmin ? prisma.activityLog.count({ where: { action: 'upload', createdAt: { gte: thirtyDaysAgo } } }) : null,
    isAdmin ? prisma.activityLog.count({ where: { action: 'login', createdAt: { gte: thirtyDaysAgo } } }) : null,
    prisma.activityLog.groupBy({
      by: ['targetId', 'targetName'],
      where: { action: 'download', targetType: 'document', targetId: { not: null }, createdAt: { gte: thirtyDaysAgo } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    }),
    prisma.activityLog.findMany({
      where: isAdmin ? {} : { userId },
      include: { user: { select: { name: true, username: true } } },
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),
    isAdmin ? prisma.accessRequest.count({ where: { status: 'pending' } }) : null,
    isAdmin ? prisma.document.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true, folderId: true },
      orderBy: { uploadedAt: 'asc' },
      take: 100,
    }) : null,
  ]);

  // Find stale documents (no downloads in 90 days)
  let staleDocuments = [];
  if (isAdmin && staleDocs) {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const recentlyDownloaded = await prisma.activityLog.findMany({
      where: { action: 'download', targetType: 'document', createdAt: { gte: ninetyDaysAgo } },
      select: { targetId: true },
      distinct: ['targetId'],
    });
    const downloadedIds = new Set(recentlyDownloaded.map(l => l.targetId));
    staleDocuments = staleDocs.filter(d => !downloadedIds.has(d.id)).slice(0, 5);
  }

  const insights = isAdmin ? [
    pendingRequests > 0 ? { key: 'pending_requests', msg: `${pendingRequests} access request${pendingRequests > 1 ? 's' : ''} pending review`, link: '/requests' } : null,
    staleDocuments.length > 0 ? { key: 'stale_docs', msg: `${staleDocuments.length} document${staleDocuments.length > 1 ? 's' : ''} not accessed in 90+ days`, link: '/directory' } : null,
  ].filter(Boolean) : [];

  // Upsert insight notifications for admin (one per type per day, avoid duplicates)
  if (isAdmin && insights.length > 0) {
    const todayStart = new Date(); todayStart.setHours(0,0,0,0);
    await Promise.all(insights.map(async ({ key, msg, link }) => {
      const existing = await prisma.notification.findFirst({
        where: { userId: req.user.id, type: key, createdAt: { gte: todayStart } },
      });
      if (!existing) {
        await prisma.notification.create({
          data: { userId: req.user.id, type: key, title: msg, linkUrl: link },
        });
      } else if (existing.title !== msg) {
        await prisma.notification.update({ where: { id: existing.id }, data: { title: msg, read: false } });
      }
    }));
  }

  res.json({
    stats: {
      totalDocs,
      totalUsers,
      totalFolders,
      recentDownloads,
      recentUploads,
      recentLogins,
      pendingRequests,
    },
    topDocuments: topDocuments.map(d => ({ id: d.targetId, name: d.targetName, downloads: d._count.id })),
    recentActivity,
    staleDocuments,
    insights: insights.map(i => i.msg),
  });
});
