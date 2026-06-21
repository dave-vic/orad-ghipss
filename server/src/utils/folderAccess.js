import prisma from '../config/db.js';

export const canAccessFolder = async (folder, userId, userRole) => {
  // Role-based access
  if (folder.allowedRoles.includes(userRole)) return true;

  // Per-user override
  const override = await prisma.userFolderAccess.findUnique({
    where: { userId_folderId: { userId, folderId: folder.id } },
  });
  if (!override) return false;

  // Check expiry
  if (override.expiresAt && new Date() > override.expiresAt) return false;

  return true;
};
