import prisma from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { z } from 'zod';

const schema = z.object({
  type: z.enum(['folder', 'document']),
  targetId: z.string(),
  targetName: z.string(),
});

export const getFavourites = asyncHandler(async (req, res) => {
  const favs = await prisma.userFavourite.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
  });
  res.json(favs);
});

export const addFavourite = asyncHandler(async (req, res) => {
  const data = schema.parse(req.body);
  const fav = await prisma.userFavourite.upsert({
    where: { userId_type_targetId: { userId: req.user.id, type: data.type, targetId: data.targetId } },
    update: {},
    create: { userId: req.user.id, ...data },
  });
  res.status(201).json(fav);
});

export const removeFavourite = asyncHandler(async (req, res) => {
  await prisma.userFavourite.delete({
    where: { userId_type_targetId: { userId: req.user.id, type: req.params.type, targetId: req.params.targetId } },
  });
  res.json({ message: 'Removed from favourites' });
});
