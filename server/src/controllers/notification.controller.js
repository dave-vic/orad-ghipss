import prisma from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    take: 30,
  });
  res.json(notifications);
});

export const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await prisma.notification.count({
    where: { userId: req.user.id, read: false },
  });
  res.json({ count });
});

export const markRead = asyncHandler(async (req, res) => {
  await prisma.notification.updateMany({
    where: { userId: req.user.id, read: false },
  });
  res.json({ message: 'All marked read' });
});

export const markOneRead = asyncHandler(async (req, res) => {
  await prisma.notification.update({
    where: { id: req.params.id },
    data: { read: true },
  });
  res.json({ message: 'Marked read' });
});
