import prisma from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const buildWhere = (query, userId = null) => {
  const where = {};
  if (userId) where.userId = userId;
  if (query.user) where.userId = query.user;
  if (query.action) where.action = query.action;
  if (query.from || query.to) {
    where.createdAt = {};
    if (query.from) where.createdAt.gte = new Date(query.from);
    if (query.to) { const d = new Date(query.to); d.setHours(23, 59, 59, 999); where.createdAt.lte = d; }
  }
  return where;
};

const logSelect = {
  id: true, action: true, targetType: true, targetId: true,
  targetName: true, ipAddress: true, userAgent: true, createdAt: true,
  user: { select: { id: true, name: true, email: true, username: true } },
};

export const getLogs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const where = buildWhere(req.query);

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      select: logSelect,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.activityLog.count({ where }),
  ]);

  res.json({ logs, total, page, limit, pages: Math.ceil(total / limit) });
});

export const getMyLogs = asyncHandler(async (req, res) => {
  const where = buildWhere(req.query, req.user.id);

  const logs = await prisma.activityLog.findMany({
    where,
    select: {
      id: true, action: true, targetType: true, targetId: true,
      targetName: true, createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  res.json(logs);
});

export const exportLogs = asyncHandler(async (req, res) => {
  const where = buildWhere(req.query);

  const logs = await prisma.activityLog.findMany({
    where,
    select: logSelect,
    orderBy: { createdAt: 'desc' },
  });

  const headers = ['id', 'timestamp', 'user', 'action', 'targetType', 'targetName', 'ipAddress'];
  const rows = logs.map((l) => [
    l.id,
    l.createdAt.toISOString(),
    l.user.username,
    l.action,
    l.targetType || '',
    l.targetName || '',
    l.ipAddress || '',
  ]);

  const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="activity-log.csv"');
  res.send(csv);
});
