import prisma from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const search = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 2) return res.json({ documents: [], folders: [] });

  const query = q.trim();
  const userId = req.user.id;
  const userRole = req.user.role;

  // Get folders user has role-based access to
  const accessibleFolders = await prisma.folder.findMany({
    where: { allowedRoles: { has: userRole } },
    select: { id: true },
  });

  // Get folders user has explicit time-limited access to
  const explicitAccess = await prisma.userFolderAccess.findMany({
    where: {
      userId,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    select: { folderId: true },
  });

  const accessibleFolderIds = new Set([
    ...accessibleFolders.map(f => f.id),
    ...explicitAccess.map(a => a.folderId),
  ]);

  const [documents, folders] = await Promise.all([
    prisma.document.findMany({
      where: {
        deletedAt: null,
        folderId: { in: [...accessibleFolderIds] },
        name: { contains: query, mode: 'insensitive' },
      },
      select: {
        id: true,
        name: true,
        mimeType: true,
        sizeBytes: true,
        uploadedAt: true,
        folderId: true,
        folder: { select: { id: true, name: true } },
      },
      take: 20,
    }),
    prisma.folder.findMany({
      where: {
        id: { in: [...accessibleFolderIds] },
        name: { contains: query, mode: 'insensitive' },
      },
      select: { id: true, name: true, description: true },
      take: 10,
    }),
  ]);

  res.json({ documents, folders });
});
