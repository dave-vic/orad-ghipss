import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import { env } from '../config/env.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const authenticate = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  let payload;
  try {
    payload = jwt.verify(token, env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || !user.active) return res.status(403).json({ error: 'Access denied' });

  // Check if session has been revoked
  if (payload.jti) {
    const session = await prisma.userSession.findUnique({ where: { jti: payload.jti } });
    if (session?.revokedAt) {
      return res.status(401).json({ error: 'Session has been revoked' });
    }
  }

  req.user = user;
  next();
});
