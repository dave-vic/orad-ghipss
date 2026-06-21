import prisma from '../config/db.js';

export const createLog = async ({ userId, action, targetType, targetId, targetName, ipAddress, userAgent }) => {
  return prisma.activityLog.create({
    data: { userId, action, targetType, targetId, targetName, ipAddress, userAgent },
  });
};
