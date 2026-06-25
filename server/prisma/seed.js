import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const folders = [
    { id: 'f-sop',      name: 'Standard Operating Procedures', icon: '📋', color: '#306196', allowedRoles: ['admin', 'member', 'viewer'] },
    { id: 'f-manuals',  name: 'Product Manuals',                icon: '📘', color: '#2563EB', allowedRoles: ['admin', 'member'] },
    { id: 'f-partner',  name: 'Partner Documents',              icon: '🤝', color: '#059669', allowedRoles: ['admin', 'member'] },
    { id: 'f-onboard',  name: 'Onboarding Materials',           icon: '🎓', color: '#D97706', allowedRoles: ['admin', 'member', 'viewer'] },
    { id: 'f-internal', name: 'Internal Admin Files',           icon: '🔒', color: '#DC2626', allowedRoles: ['admin'] },
  ];

  for (const folder of folders) {
    await prisma.folder.upsert({
      where: { id: folder.id },
      update: {},
      create: folder,
    });
  }

  const adminPwd = await bcrypt.hash(process.env.ADMIN_DEFAULT_PASSWORD || 'Ghipps2024!', 12);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: { password: adminPwd, role: 'admin', active: true },
    create: {
      name: 'System Admin',
      email: 'admin@ghipps.com',
      username: 'admin',
      password: adminPwd,
      role: 'admin',
      active: true,
    },
  });

  const memberPwd = await bcrypt.hash('Member2024!', 12);
  const sarah = await prisma.user.upsert({
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
  const kofi = await prisma.user.upsert({
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

  // Grant Sarah (member) access to member-accessible folders
  const sarahFolders = ['f-sop', 'f-manuals', 'f-partner', 'f-onboard'];
  for (const folderId of sarahFolders) {
    await prisma.userFolderAccess.upsert({
      where: { userId_folderId: { userId: sarah.id, folderId } },
      update: {},
      create: {
        userId: sarah.id,
        folderId,
        canView: true,
        canUpload: folderId !== 'f-sop',
        grantedBy: admin.id,
      },
    });
  }

  // Grant Kofi (viewer) access to viewer-accessible folders
  const kofiFolders = ['f-sop', 'f-onboard'];
  for (const folderId of kofiFolders) {
    await prisma.userFolderAccess.upsert({
      where: { userId_folderId: { userId: kofi.id, folderId } },
      update: {},
      create: {
        userId: kofi.id,
        folderId,
        canView: true,
        canUpload: false,
        grantedBy: admin.id,
      },
    });
  }

  console.log('Seed complete: folders, users, and access grants created');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
