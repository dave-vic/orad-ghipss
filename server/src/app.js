import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.routes.js';
import folderRoutes from './routes/folder.routes.js';
import documentRoutes from './routes/document.routes.js';
import userRoutes from './routes/user.routes.js';
import logRoutes from './routes/log.routes.js';
import acknowledgementRoutes from './routes/acknowledgement.routes.js';
import accessRequestRoutes from './routes/accessRequest.routes.js';
import guestLinkRoutes from './routes/guestLink.routes.js';
import userAccessRoutes from './routes/userAccess.routes.js';
import { serveGuestLink } from './controllers/guestLink.controller.js';
import twoFactorRoutes from './routes/twoFactor.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import auditRoutes from './routes/audit.routes.js';
import presenceRoutes from './routes/presence.routes.js';
import commentRoutes from './routes/comment.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import searchRoutes from './routes/search.routes.js';
import myActivityRoutes from './routes/myActivity.routes.js';
import versionRoutes from './routes/version.routes.js';
import favouriteRoutes from './routes/favourite.routes.js';
import userImportRoutes from './routes/userImport.routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: env.CLIENT_URL || true,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
}));
app.use(express.json());
app.use(cookieParser());
app.use('/files', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/documents', acknowledgementRoutes);
app.use('/api/documents', guestLinkRoutes);
app.use('/api/access-requests', accessRequestRoutes);
app.use('/api/users', userAccessRoutes);
app.get('/api/guest/:token', serveGuestLink);
app.use('/api/auth', twoFactorRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api', auditRoutes);
app.use('/api/folders', presenceRoutes);

app.use('/api/documents', commentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/me', myActivityRoutes);

app.use('/api/documents', versionRoutes);
app.use('/api/favourites', favouriteRoutes);
app.use('/api/users', userImportRoutes);

app.use(errorHandler);

export default app;
