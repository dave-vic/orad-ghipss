import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, '../../uploads');

export const watermarkPdf = async (storageKey, userName) => {
  const filePath = path.join(UPLOADS_DIR, storageKey);
  const bytes = await readFile(filePath);
  const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pages = pdfDoc.getPages();
  const text = `CONFIDENTIAL — Downloaded by ${userName} — ${new Date().toLocaleDateString()}`;

  for (const page of pages) {
    const { width, height } = page.getSize();
    page.drawText(text, {
      x: width / 2 - 200,
      y: height / 2,
      size: 14,
      font,
      color: rgb(0.8, 0.1, 0.1),
      opacity: 0.18,
      rotate: degrees(-35),
    });
  }

  return Buffer.from(await pdfDoc.save());
};
