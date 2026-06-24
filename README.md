# ORAD — GhIPSS Operations Portal

A secure internal document management and operations portal built for GhIPSS (Ghana Interbank Payment and Settlement Systems). ORAD enables staff to upload, manage, and access documents with role-based and per-folder permissions, access request workflows, activity tracking, and admin controls.

---

## Features

- **Document Management** — Upload, view, download, and version-track documents per folder
- **Per-Folder Permissions** — Granular `canView` / `canUpload` access per user per folder
- **Access Request Workflow** — Users request view or upload access; admins approve or deny
- **Role-Based Access** — Admin, Member, and Viewer roles with enforced server-side checks
- **Activity Logging** — Full audit trail of user actions (admin only)
- **Two-Factor Authentication** — TOTP-based 2FA via authenticator apps
- **Notifications** — In-app notifications for access approvals, uploads, and announcements
- **Bulk User Import** — CSV-based user import for onboarding
- **Guest Links** — Time-limited, view-count-limited shareable document links
- **Folder Customisation** — Custom icons and brand colours per folder
- **Breadcrumb Navigation** — Contextual navigation across all pages

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router, Lucide Icons |
| Backend | Express 5, Node.js |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT (HTTP-only cookies) + bcrypt + TOTP 2FA |
| File Storage | AWS S3 (via `@aws-sdk/client-s3`) |
| Validation | Zod |
| Styling | Inline styles (no CSS framework) |

---

## Project Structure

```
orad-ghipss/
├── client/                  # React + Vite frontend
│   ├── public/              # Static assets (logo, icons)
│   └── src/
│       ├── api/             # Axios instance
│       ├── components/      # Reusable UI components
│       │   ├── directory/   # Folder & document components
│       │   ├── layout/      # Sidebar, TopBar
│       │   └── ui/          # Modal, Toast, Badge etc.
│       ├── hooks/           # useAuth and other hooks
│       └── pages/           # Route-level page components
├── server/                  # Express API
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── migrations/      # SQL migration history
│   └── src/
│       ├── controllers/     # Route handlers
│       ├── middleware/       # Auth, rate limiting
│       ├── routes/          # Express routers
│       ├── services/        # Log, notification services
│       └── index.js         # Entry point
├── docker-compose.yml       # Local dev with Docker
└── nginx/                   # Nginx reverse proxy config
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- AWS S3 bucket (for file storage)

### 1. Clone the repository

```bash
git clone https://github.com/dave-vic/orad-ghipss.git
cd orad-ghipss
```

### 2. Configure environment variables

Create `server/.env`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/orad_db
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
NODE_ENV=development
PORT=5000

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=your_bucket_name

# Email (optional)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=you@example.com
SMTP_PASS=yourpassword
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Install dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 4. Set up the database

```bash
cd server
npx prisma migrate deploy
npx prisma generate
```

### 5. Run the development servers

```bash
# Backend (from /server)
npm run dev

# Frontend (from /client)
npm run dev
```

Frontend runs at `http://localhost:5173`  
API runs at `http://localhost:5000`

---

## Deployment (Render.com)

### Database
1. Create a **PostgreSQL** instance on Render
2. Copy the **Internal Database URL**

### Backend
- **Root Directory:** `server`
- **Build Command:** `npm install && npx prisma migrate deploy && npx prisma generate`
- **Start Command:** `node src/index.js`
- **Environment Variables:** Add all variables from `server/.env`

### Frontend
- **Root Directory:** `client`
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `dist`
- **Environment Variables:** `VITE_API_URL=https://your-api.onrender.com/api`

---

## Environment Variables Reference

| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `JWT_SECRET` | Secret key for signing JWTs | ✅ |
| `JWT_EXPIRES_IN` | Token expiry e.g. `7d` | ✅ |
| `AWS_REGION` | AWS region for S3 | ✅ |
| `AWS_ACCESS_KEY_ID` | AWS access key | ✅ |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | ✅ |
| `S3_BUCKET_NAME` | S3 bucket for file uploads | ✅ |
| `SMTP_HOST` | Email server host | Optional |
| `SMTP_PORT` | Email server port | Optional |
| `SMTP_USER` | Email username | Optional |
| `SMTP_PASS` | Email password | Optional |
| `REDIS_URL` | Redis URL (for rate limiting) | Optional |

---

## User Roles

| Role | Capabilities |
|---|---|
| **Admin** | Full access to all folders, users, logs, and settings |
| **Member** | Access folders they have been granted permission to |
| **Viewer** | Read-only access to permitted folders; can request upload access |

---

## API Overview

| Resource | Endpoint |
|---|---|
| Auth | `POST /api/auth/login`, `POST /api/auth/logout` |
| Folders | `GET/POST /api/folders`, `PATCH/DELETE /api/folders/:id` |
| Documents | `GET/POST /api/folders/:id/documents` |
| Access Requests | `GET/POST /api/access-requests` |
| Users | `GET/POST /api/users`, `POST /api/users/import` |
| Notifications | `GET /api/notifications` |
| Activity Logs | `GET /api/logs` |

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## License

This project is proprietary software developed for GhIPSS internal use.  
© 2025 Silverrock Tech. All rights reserved.
