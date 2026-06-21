import prisma from '../config/db.js';

export const notify = async ({ userId, type, title, body, linkUrl }) => {
  return prisma.notification.create({
    data: { userId, type, title, body: body || null, linkUrl: linkUrl || null },
  });
};
