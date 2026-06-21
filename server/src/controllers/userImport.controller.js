import prisma from '../config/db.js';
import { createLog } from '../services/log.service.js';
import { sendEmail, emailTemplates } from '../services/email.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import bcrypt from 'bcrypt';

function generatePassword() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#';
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export const importUsers = asyncHandler(async (req, res) => {
  const { users } = req.body; // array of { name, email, username, role }
  if (!Array.isArray(users) || users.length === 0) {
    return res.status(400).json({ error: 'No users provided' });
  }
  if (users.length > 100) {
    return res.status(400).json({ error: 'Maximum 100 users per import' });
  }

  const results = { created: [], skipped: [], errors: [] };

  for (const u of users) {
    try {
      if (!u.name || !u.email || !u.username) {
        results.errors.push({ row: u, reason: 'Missing name, email or username' });
        continue;
      }
      const existing = await prisma.user.findFirst({
        where: { OR: [{ email: u.email }, { username: u.username }] },
      });
      if (existing) {
        results.skipped.push({ username: u.username, reason: 'Email or username already exists' });
        continue;
      }
      const tempPassword = generatePassword();
      const hash = await bcrypt.hash(tempPassword, 12);
      const user = await prisma.user.create({
        data: {
          name: u.name.trim(),
          email: u.email.trim().toLowerCase(),
          username: u.username.trim().toLowerCase(),
          password: hash,
          role: ['admin', 'member', 'viewer'].includes(u.role) ? u.role : 'viewer',
        },
        select: { id: true, name: true, email: true, username: true, role: true },
      });

      await createLog({ userId: req.user.id, action: 'user_create', targetType: 'user', targetId: user.id, targetName: user.name, ipAddress: req.ip, userAgent: req.headers['user-agent'] });

      const tpl = emailTemplates.accountCreated({ name: user.name, username: user.username, password: tempPassword, portalUrl: process.env.CLIENT_URL || 'http://localhost:5173' });
      await sendEmail({ to: user.email, ...tpl });

      results.created.push({ ...user, tempPassword });
    } catch (err) {
      results.errors.push({ row: u, reason: err.message });
    }
  }

  res.json(results);
});
