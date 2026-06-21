import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/db.js';
import { env } from '../config/env.js';
import { createLog } from '../services/log.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { z } from 'zod';

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const login = asyncHandler(async (req, res) => {
  const { username, password } = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { username } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    if (user) {
      await createLog({
        userId: user.id,
        action: 'login_fail',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });
    }
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  if (!user.active) {
    return res.status(403).json({ error: 'Account is deactivated' });
  }

  const jti = uuidv4();
  const token = jwt.sign({ sub: user.id, role: user.role, jti }, env.JWT_SECRET, { expiresIn: '8h' });

  res.cookie('token', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 8 * 60 * 60 * 1000,
  });

  await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });

  await createLog({
    userId: user.id,
    action: 'login',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  await prisma.userSession.create({
    data: {
      userId: user.id,
      jti,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || null,
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
    },
  });

  const { password: _, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword });
});

export const me = asyncHandler(async (req, res) => {
  const { password: _, ...userWithoutPassword } = req.user;
  res.json(userWithoutPassword);
});

export const profile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const [user, totalDownloads, totalUploads, ackCount, commentCount, recentActivity, folderAccess] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, username: true, role: true, createdAt: true, lastLogin: true, twoFactorEnabled: true },
    }),
    prisma.activityLog.count({ where: { userId, action: 'download' } }),
    prisma.activityLog.count({ where: { userId, action: 'upload' } }),
    prisma.documentAcknowledgement.count({ where: { userId } }),
    prisma.documentComment.count({ where: { userId } }),
    prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.userFolderAccess.findMany({
      where: { userId, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
      include: { folder: { select: { id: true, name: true } } },
    }),
  ]);

  res.json({
    ...user,
    stats: { totalDownloads, totalUploads, ackCount, commentCount },
    recentActivity,
    folderAccess,
  });
});

export const logout = asyncHandler(async (req, res) => {
  await createLog({
    userId: req.user.id,
    action: 'logout',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

export const changePassword = asyncHandler(async (req, res) => {
  const schema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8),
  });
  const { currentPassword, newPassword } = schema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) return res.status(400).json({ error: 'Current password is incorrect' });

  const hash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: req.user.id }, data: { password: hash } });

  await createLog({
    userId: req.user.id,
    action: 'password_change',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.json({ message: 'Password changed successfully' });
});

export const getSessions = asyncHandler(async (req, res) => {
  const sessions = await prisma.userSession.findMany({
    where: { userId: req.user.id, revokedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(sessions);
});

export const revokeSession = asyncHandler(async (req, res) => {
  const session = await prisma.userSession.findUnique({ where: { id: req.params.id } });
  if (!session || session.userId !== req.user.id) {
    return res.status(404).json({ error: 'Session not found' });
  }
  await prisma.userSession.update({
    where: { id: req.params.id },
    data: { revokedAt: new Date() },
  });
  await createLog({
    userId: req.user.id,
    action: 'session_revoke',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });
  res.json({ message: 'Session revoked' });
});

export const getLoginHistory = asyncHandler(async (req, res) => {
  const history = await prisma.activityLog.findMany({
    where: { userId: req.user.id, action: { in: ['login', 'login_fail', 'logout'] } },
    orderBy: { createdAt: 'desc' },
    take: 30,
  });
  res.json(history);
});
