import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, '../../uploads');

export const uploadFile = async ({ key, buffer }) => {
  const filePath = path.join(UPLOADS_DIR, key);
  const dir = path.dirname(filePath);
  if (!existsSync(dir)) await mkdir(dir, { recursive: true });
  await writeFile(filePath, buffer);
};

export const getPresignedUrl = async (key) => {
  return `http://localhost:4000/files/${encodeURIComponent(key).replace(/%2F/g, '/')}`;
};
