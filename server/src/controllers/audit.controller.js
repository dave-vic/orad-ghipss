import prisma from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import PDFDocument from 'pdfkit';

export const generateAuditCertificate = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { from, to } = req.query;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, username: true, role: true, createdAt: true },
  });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const where = {
    userId,
    ...(from || to ? {
      createdAt: {
        ...(from ? { gte: new Date(from) } : {}),
        ...(to ? { lte: new Date(to) } : {}),
      },
    } : {}),
  };

  const logs = await prisma.activityLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 500,
  });

  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="audit-${user.username}-${Date.now()}.pdf"`);
  doc.pipe(res);

  // Header
  doc.fontSize(22).font('Helvetica-Bold').text('ORAD — Ghipps Operations Portal', { align: 'center' });
  doc.fontSize(14).font('Helvetica').text('Access Audit Certificate', { align: 'center' });
  doc.moveDown();
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown();

  // User info
  doc.fontSize(11).font('Helvetica-Bold').text('User Details');
  doc.font('Helvetica').fontSize(10);
  doc.text(`Name: ${user.name}`);
  doc.text(`Email: ${user.email}`);
  doc.text(`Username: @${user.username}`);
  doc.text(`Role: ${user.role}`);
  doc.text(`Account Created: ${new Date(user.createdAt).toLocaleDateString()}`);
  doc.moveDown();

  // Period
  doc.fontSize(11).font('Helvetica-Bold').text('Audit Period');
  doc.font('Helvetica').fontSize(10);
  doc.text(`From: ${from ? new Date(from).toLocaleDateString() : 'Account creation'}`);
  doc.text(`To: ${to ? new Date(to).toLocaleDateString() : 'Present'}`);
  doc.text(`Total Events: ${logs.length}`);
  doc.moveDown();

  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown();

  // Activity log table
  doc.fontSize(11).font('Helvetica-Bold').text('Activity Log');
  doc.moveDown(0.5);

  const colWidths = [120, 100, 120, 150];
  const headers = ['Timestamp', 'Action', 'Target', 'IP Address'];

  // Table header
  doc.font('Helvetica-Bold').fontSize(9);
  let x = 50;
  headers.forEach((h, i) => { doc.text(h, x, doc.y, { width: colWidths[i] }); x += colWidths[i]; });
  doc.moveDown(0.3);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(0.3);

  // Table rows
  doc.font('Helvetica').fontSize(8);
  logs.forEach(log => {
    if (doc.y > 720) { doc.addPage(); }
    x = 50;
    const rowY = doc.y;
    doc.text(new Date(log.createdAt).toLocaleString(), x, rowY, { width: colWidths[0] }); x += colWidths[0];
    doc.text(log.action.replace(/_/g, ' '), x, rowY, { width: colWidths[1] }); x += colWidths[1];
    doc.text(log.targetName || '—', x, rowY, { width: colWidths[2] }); x += colWidths[2];
    doc.text(log.ipAddress || '—', x, rowY, { width: colWidths[3] });
    doc.moveDown(0.6);
  });

  // Footer
  doc.moveDown();
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(0.5);
  doc.fontSize(8).font('Helvetica').fillColor('#888888')
    .text(`Generated on ${new Date().toLocaleString()} · ORAD Ghipps Operations Portal · Confidential`, { align: 'center' });

  doc.end();
});
