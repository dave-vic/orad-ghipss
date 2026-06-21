import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const folders = [
    { id: 'f-sop', name: 'Standard Operating Procedures', icon: '📋', allowedRoles: ['admin', 'member', 'viewer'] },
    { id: 'f-manuals', name: 'Product Manuals', icon: '📘', allowedRoles: ['admin', 'member'] },
    { id: 'f-partner', name: 'Partner Documents', icon: '🤝', allowedRoles: ['admin', 'member'] },
    { id: 'f-onboard', name: 'Onboarding Materials', icon: '🎓', allowedRoles: ['admin', 'member', 'viewer'] },
    { id: 'f-internal', name: 'Internal Admin Files', icon: '🔒', allowedRoles: ['admin'] },
  ];

  for (const folder of folders) {
    await prisma.folder.upsert({
      where: { id: folder.id },
      update: {},
      create: folder,
    });
  }

  const password = await bcrypt.hash(process.env.ADMIN_DEFAULT_PASSWORD || 'change-me-immediately', 12);

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      name: 'System Admin',
      email: 'admin@ghipps.com',
      username: 'admin',
      password,
      role: 'admin',
      active: true,
    },
  });

  const memberPwd = await bcrypt.hash('Member2024!', 12);
  await prisma.user.upsert({
    where: { username: 'sarah' },
    update: { password: memberPwd },
    create: {
      name: 'Sarah Mensah',
      email: 'sarah@ghipps.com',
      username: 'sarah',
      password: memberPwd,
      role: 'member',
      active: true,
    },
  });

  const viewerPwd = await bcrypt.hash('Viewer2024!', 12);
  await prisma.user.upsert({
    where: { username: 'kofi' },
    update: { password: viewerPwd },
    create: {
      name: 'Kofi Asante',
      email: 'kofi@ghipps.com',
      username: 'kofi',
      password: viewerPwd,
      role: 'viewer',
      active: true,
    },
  });

  console.log('Seed complete');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
