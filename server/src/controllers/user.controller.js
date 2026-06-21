import bcrypt from 'bcrypt';
import prisma from '../config/db.js';
import { createLog } from '../services/log.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { z } from 'zod';

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  username: z.string().min(1),
  password: z.string().min(8),
  role: z.enum(['admin', 'member', 'viewer']),
});

const updateRoleSchema = z.object({ role: z.enum(['admin', 'member', 'viewer']) });
const updateStatusSchema = z.object({ active: z.boolean() });

const userSelect = {
  id: true, name: true, email: true, username: true,
  role: true, active: true, createdAt: true, lastLogin: true,
};

export const getUsers = asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    select: userSelect,
    orderBy: { createdAt: 'desc' },
  });
  res.json(users);
});

export const createUser = asyncHandler(async (req, res) => {
  const data = createUserSchema.parse(req.body);
  const hashed = await bcrypt.hash(data.password, 12);
  const user = await prisma.user.create({
    data: { ...data, password: hashed },
    select: userSelect,
  });

  await createLog({
    userId: req.user.id,
    action: 'user_create',
    targetType: 'user',
    targetId: user.id,
    targetName: user.name,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(201).json(user);
});

export const updateRole = asyncHandler(async (req, res) => {
  const { role } = updateRoleSchema.parse(req.body);
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { role },
    select: userSelect,
  });

  await createLog({
    userId: req.user.id,
    action: 'role_change',
    targetType: 'user',
    targetId: user.id,
    targetName: user.name,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.json(user);
});

export const updateStatus = asyncHandler(async (req, res) => {
  const { active } = updateStatusSchema.parse(req.body);
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { active },
    select: userSelect,
  });

  if (!active) {
    await createLog({
      userId: req.user.id,
      action: 'deactivate',
      targetType: 'user',
      targetId: user.id,
      targetName: user.name,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  res.json(user);
});

export const deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user.id) {
    return res.status(403).json({ error: 'Cannot delete your own account' });
  }

  await prisma.user.delete({ where: { id: req.params.id } });
  res.json({ message: 'User deleted' });
});

const resetPasswordSchema = z.object({ password: z.string().min(8) });

export const resetPassword = asyncHandler(async (req, res) => {
  if (req.params.id === req.user.id) {
    return res.status(403).json({ error: 'Use the standard password change flow for your own account' });
  }
  const { password } = resetPasswordSchema.parse(req.body);
  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { password: hashed },
    select: userSelect,
  });
  await createLog({
    userId: req.user.id,
    action: 'password_reset',
    targetType: 'user',
    targetId: user.id,
    targetName: user.name,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });
  res.json({ message: 'Password reset successfully' });
});
