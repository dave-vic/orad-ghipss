# ORAD — Operations Restricted Access Directory
## Platform Documentation
**Client:** GhIPSS (Ghana Interbank Payment and Settlement Systems)
**Purpose:** Internal document management and access control portal
**Status:** In Development

---

## 1. Overview

ORAD is a secure, role-based document management platform built for GhIPSS. It allows the organisation to store, manage, and control access to internal documents. Different user roles see different content and have different capabilities. All activity is logged for audit purposes.

The platform runs as a web application with a React frontend and a Node.js/Express backend connected to a PostgreSQL database.

---

## 2. Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| Vite | Development server & build tool |
| React Router v6 | Page navigation |
| Axios | API communication |
| Lucide React | Icons |
| React DOM createPortal | Modal overlays |

### Backend
| Technology | Purpose |
|---|---|
| Node.js | Runtime environment |
| Express 5 | HTTP server & API routing |
| Prisma ORM | Database queries & schema management |
| PostgreSQL | Primary database |
| bcrypt | Password hashing |
| JSON Web Tokens (JWT) | Authentication tokens |
| cookie-parser | Reading HTTP-only cookies |
| cors | Cross-origin request handling |
| multer | File upload handling |

### Design System
- Inline styles only — no CSS framework
- Font: **Plus Jakarta Sans**
- Brand colour: `#306196` (GhIPSS blue)
- Near-black: `#112235`
- Background: `#F7F8FA`
- Surface: `#FFFFFF`
- Border: `#E5E7EB`

---

## 3. User Roles

The platform has three roles with different levels of access:

| Role | Description | Colour |
|---|---|---|
| **Admin** | Full access — manages users, folders, documents, reviews access requests, sees all activity | Red |
| **Member** | Standard access — can view and download permitted documents, upload documents | Green |
| **Viewer** | Read-only — can view and download documents in permitted folders | Amber |

### Demo Credentials
| Username | Password | Role |
|---|---|---|
| `admin` | `Ghipps2024!` | Admin |
| `sarah` | `Member2024!` | Member (Sarah Mensah) |
| `kofi` | `Viewer2024!` | Viewer (Kofi Asante) |

---

## 4. Pages & Features

### 4.1 Login Page
- Username and password authentication
- JWT token stored in HTTP-only cookie
- Demo credential cards shown for quick access during testing
- Redirects to dashboard on success

---

### 4.2 Dashboard
**Route:** `/`

The landing page after login. Content adapts to the user's role.

**Admin sees:**
- Insight alerts (e.g. pending access requests, stale documents) with dismiss button — also appear in notification bell
- Favourited folders/documents as quick-access pills
- Stat cards: Total Documents, Active Users, Downloads, Uploads, Pending Requests
- Most Downloaded documents (last 30 days)
- Recent Activity feed (all users)
- Documents not accessed in 90+ days

**Member/Viewer sees:**
- Stat card: Downloads
- Personal recent activity feed
- Favourites

---

### 4.3 Directory
**Route:** `/directory`

Browse all folders the user has access to.

- Folders displayed as cards with custom icons
- Restricted folders (no access) shown with a lock icon — clicking them opens an access request flow
- Clicking an accessible folder navigates into it

---

### 4.4 Folder Page
**Route:** `/directory/:folderId`

View and manage documents within a specific folder.

**Features:**
- Document table with columns: Name, Type, Size, Uploaded, Uploaded By, Actions
- Inline action icons per row: **View**, **Download**, **Comment**
- Admin kebab menu per row: Share (guest link), Require Acknowledgement, Version History, Delete
- Upload new documents (drag & drop or file picker)
- Folder announcement banner (admin can set a notice for all users)
- Admin toolbar: Edit folder, Delete folder
- Document viewer (PDF/image preview in modal)
- Document comments panel
- Version history viewer
- Guest link sharing (create a time-limited public link)

---

### 4.5 My Activity
**Route:** `/my-activity`

Personal activity history for the logged-in user.

- **Recently Accessed** table: document name, action, date
- **My Acknowledgements** table: documents the user has formally acknowledged, with folder name and date. Rows are clickable and navigate to the folder.

---

### 4.6 My Requests
**Route:** `/my-requests`

For Member and Viewer users to track their folder access requests.

- Shows all requests submitted by the user
- Status: Pending / Approved / Denied
- Displays reviewer note if one was left

---

### 4.7 Activity Log
**Route:** `/activity-log`

Admin-only full audit trail of all actions taken on the platform.

- Filterable by action type, user, date range
- Exportable to CSV
- Shows: user, action, target, IP address, timestamp

---

### 4.8 User Management
**Route:** `/user-management`

Admin-only user administration.

**Users tab:**
- Table of all users with avatar, name, email, role badge, active toggle, joined date, last login
- Search and sort
- Bulk select and bulk actions
- Per-user kebab menu: View Profile, Reset Password, Change Role, Deactivate/Activate, Delete
- View Profile modal: shows full user details
- Add User modal: create a new user with name, email, username, role, password
- Bulk Import: upload a CSV to create multiple users at once
- Pagination (10 / 20 / 50 rows per page)

**Roles & Permissions tab:**
- Visual matrix of all permissions per role
- Collapsible permission categories: Documents, Folders, Activity & Logs, User Management, Settings
- Checkboxes to enable/disable permissions per role (Member and Viewer editable; Admin locked)
- + Add Role button (custom roles — future feature)

---

### 4.9 Access Requests
**Route:** `/access-requests`

Admin-only review of folder access requests from Members and Viewers.

- Tabbed view: Pending / Approved / Denied
- Table: User, Folder, Reason, Submitted date, Status
- Review button opens a modal with:
  - Requester details (avatar, name, username)
  - Their stated reason
  - Which folder they're requesting
  - Approve / Deny decision toggle
  - Optional note to send back to the user
- Approved requests grant the user access to that folder immediately

---

### 4.10 Account Settings / Profile
**Route:** `/profile`

Accessible from the top-right user dropdown.

- Edit display name, email
- Change password
- Two-factor authentication setup
- Session management (view and revoke active sessions)

---

## 5. Database Models

| Model | Description |
|---|---|
| `User` | Platform users with role, credentials, 2FA settings |
| `Folder` | Document folders with allowed roles and custom icon |
| `Document` | Uploaded files with metadata, expiry, acknowledgement flag |
| `DocumentVersion` | Version history for documents |
| `DocumentAcknowledgement` | Record of users who have acknowledged a document |
| `DocumentComment` | Comments left on individual documents |
| `AccessRequest` | Requests from users for folder access |
| `UserFolderAccess` | Individual folder access grants (overrides role restriction) |
| `GuestLink` | Time-limited public links for sharing individual documents |
| `ActivityLog` | Full audit log of every action on the platform |
| `Notification` | In-app notifications (bell icon) |
| `UserSession` | Active JWT sessions, revocable by admin |
| `UserFavourite` | Bookmarked folders and documents per user |

---

## 6. API Routes

| Route prefix | Description |
|---|---|
| `/auth` | Login, logout, session |
| `/folders` | CRUD for folders |
| `/documents` | Upload, download, delete, view documents |
| `/versions` | Document version history |
| `/comments` | Document comments |
| `/access-requests` | Submit and review access requests |
| `/user-access` | Grant/revoke individual folder access |
| `/users` | User management (admin) |
| `/user-import` | Bulk CSV user import |
| `/notifications` | In-app notification bell |
| `/activity-log` | Audit log (admin) |
| `/me` | Personal activity and acknowledgements |
| `/dashboard` | Dashboard stats and insights |
| `/favourites` | Bookmark folders and documents |
| `/search` | Global search |
| `/guest-links` | Create and manage guest sharing links |
| `/two-factor` | 2FA setup and verification |
| `/audit` | Audit export |
| `/presence` | Online presence (active users) |

---

## 7. Security

- Passwords hashed with **bcrypt** (salt rounds: 10)
- Authentication via **JWT** stored in HTTP-only cookies (not accessible to JavaScript)
- All protected routes require a valid token via `authenticate` middleware
- Role checks via `requireRole('admin')` middleware on admin-only routes
- CORS locked to the frontend origin only
- Guest links are token-based with optional expiry and view limits
- Sessions are tracked in the database and can be revoked by the admin
- Full activity log of every login, download, upload, delete, role change, and more

---

## 8. Running the Platform

### Prerequisites
- Node.js 18+
- PostgreSQL running locally
- `.env` file configured in `/server`

### Start the backend
```bash
cd server
node src/index.js
```
Server runs on **http://localhost:4000**

### Start the frontend
```bash
cd client
npm run dev
```
Frontend runs on **http://localhost:5174**

### Database setup (first time)
```bash
cd server
npx prisma migrate dev
node prisma/seed.js
```

---

## 9. Folder Structure

```
orad ghipps/
├── client/                   # React frontend
│   └── src/
│       ├── pages/            # Page components
│       ├── components/       # Reusable UI components
│       │   ├── layout/       # TopBar, Sidebar, NotificationBell
│       │   ├── ui/           # Modal, Toast, TablePrimitives
│       │   ├── directory/    # Folder cards, document table, modals
│       │   ├── users/        # User table, permissions matrix
│       │   └── activity/     # Activity log table
│       ├── hooks/            # useAuth, etc.
│       └── api/              # Axios instance
│
└── server/                   # Express backend
    ├── src/
    │   ├── routes/           # API route definitions
    │   ├── controllers/      # Business logic
    │   ├── middleware/        # Auth, role checks
    │   ├── utils/            # Helpers
    │   └── config/           # DB connection
    └── prisma/
        ├── schema.prisma     # Database schema
        └── seed.js           # Demo data
```

---

*Document prepared for GhIPSS ORAD platform — June 2026*
