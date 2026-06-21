import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import prisma from '../config/db.js';
import { createLog } from '../services/log.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { z } from 'zod';

const verifySchema = z.object({ token: z.string().length(6) });

// Generate secret + QR code for setup
export const setup2FA = asyncHandler(async (req, res) => {
  const secret = speakeasy.generateSecret({
    name: `ORAD (${req.user.username})`,
    issuer: 'Ghipps',
    length: 32,
  });

  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

  // Store secret temporarily (not enabled yet)
  await prisma.user.update({
    where: { id: req.user.id },
    data: { twoFactorSecret: secret.base32 },
  });

  res.json({ qrCode: qrCodeUrl, secret: secret.base32 });
});

// Verify token and enable 2FA
export const enable2FA = asyncHandler(async (req, res) => {
  const { token } = verifySchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user.twoFactorSecret) {
    return res.status(400).json({ error: 'Run setup first' });
  }

  const valid = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token,
    window: 1,
  });

  if (!valid) return res.status(400).json({ error: 'Invalid code. Try again.' });

  await prisma.user.update({
    where: { id: req.user.id },
    data: { twoFactorEnabled: true },
  });

  await createLog({
    userId: req.user.id,
    action: 'two_factor_enabled',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.json({ message: '2FA enabled successfully' });
});

// Disable 2FA
export const disable2FA = asyncHandler(async (req, res) => {
  const { token } = verifySchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });

  const valid = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token,
    window: 1,
  });

  if (!valid) return res.status(400).json({ error: 'Invalid code' });

  await prisma.user.update({
    where: { id: req.user.id },
    data: { twoFactorEnabled: false, twoFactorSecret: null },
  });

  await createLog({
    userId: req.user.id,
    action: 'two_factor_disabled',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.json({ message: '2FA disabled' });
});

// Verify 2FA token during login (called after initial password auth)
export const verify2FAToken = asyncHandler(async (req, res) => {
  const { token, userId } = req.body;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.twoFactorEnabled) return res.status(400).json({ error: 'Invalid' });

  const valid = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token,
    window: 1,
  });

  if (!valid) return res.status(401).json({ error: 'Invalid authentication code' });

  res.json({ verified: true });
});
