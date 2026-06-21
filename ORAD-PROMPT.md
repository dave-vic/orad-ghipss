# ORAD — Claude Code Build Prompt

> **Paste this entire prompt into Claude Code to start the build.**
> Keep `ORAD-SPEC.md` in the same folder — this prompt references it throughout.

---

## Your Mission

You are building **ORAD (Operations Restricted Access Directory)** — a secure, login-gated document portal for MojoPay. External stakeholders (partners, vendors, contractors) use it to access operational documents. MojoPay admins control who sees what.

Read `ORAD-SPEC.md` in full before writing a single line of code. Every decision — stack, schema, file structure, API design, security — is defined there. Follow it exactly.

---

## Ground Rules

1. **Read the spec first.** Run `cat ORAD-SPEC.md` before starting. Do not guess at structure or naming.
2. **Follow the build phases in order.** Section 11 of the spec defines 10 phases. Complete and verify each phase before moving to the next.
3. **Verify after every phase.** Each phase has a "Verify:" step. Run it. If it fails, fix it before continuing.
4. **Security is not optional.** Section 8 of the spec is a security checklist. Every item must be ticked by Phase 10.
5. **No placeholder code.** Every function, route, and component must be fully implemented — no `// TODO` or `// implement later`.
6. **Keep the spec and code in sync.** If you discover the spec needs a minor clarification, note it in a `NOTES.md` file but do not change the core architecture without flagging it.

---

## Phase-by-Phase Instructions

### PHASE 1 — Scaffold
```
Read spec Section 2 (file structure) and Section 10 (docker-compose).
Create the full folder structure for /client and /server.
Set up:
  - Vite + React 18 + Tailwind CSS in /client
  - Express 5 + Prisma in /server
  - docker-compose.yml with postgres:16 and redis:7
  - .env.example from spec Section 9
Verify: docker-compose up brings up postgres and redis.
        npm run dev in /client and /server both start without errors.
```

### PHASE 2 — Database + Auth
```
Read spec Sections 3, 4, and 5.1.
Write prisma/schema.prisma exactly as defined in Section 3.
Run: npx prisma migrate dev --name init
Write prisma/seed.js using the folder data and admin user in Section 4.
Run: npx prisma db seed

Build these routes and controllers:
  POST /api/auth/login  — bcrypt compare, JWT cookie, log login event
  GET  /api/auth/me     — return user from cookie session
  POST /api/auth/logout — clear cookie

Build authenticate.js middleware from Section 6.
Build requireRole.js middleware from Section 6.
Build asyncHandler.js utility.

Verify:
  POST /api/auth/login with { username: "admin", password: "<ADMIN_DEFAULT_PASSWORD>" }
  → response sets token cookie, returns { id, name, role }
  GET /api/auth/me with cookie → returns user
  POST /api/auth/logout → clears cookie
```

### PHASE 3 — Folders + Documents API
```
Read spec Section 5.2 and 5.3.
Build s3.service.js (upload file, generate pre-signed URL).
Build log.service.js createLog() — used by every subsequent controller.

Build these routes:
  GET    /api/folders
  POST   /api/folders            (admin)
  GET    /api/folders/:id/documents
  POST   /api/folders/:id/documents   (admin, multer + S3)
  GET    /api/documents/:id/download  (pre-signed URL + log download event)
  DELETE /api/documents/:id           (admin, soft delete)

Use assertFolderAccess() from Section 6 on every folder/document route.

Verify:
  Upload a test PDF via POST /api/folders/f-sop/documents
  GET /api/documents/:id/download → returns a URL
  Open URL in browser → file downloads
  GET /api/folders/f-sop/documents → file appears in list
  DELETE → file disappears from list (soft delete)
```

### PHASE 4 — Activity Log API
```
Read spec Section 5.5.
Confirm log.service.js createLog() is being called in Phase 2 (login)
and Phase 3 (upload, download).

Build:
  GET /api/logs        (admin, query params: user, action, from, to, page, limit)
  GET /api/logs/me     (own logs, query params: action, from, to)
  GET /api/logs/export (admin, returns CSV with headers)

Important: No UPDATE or DELETE route on logs — ever.

Verify:
  Login, then download a document.
  GET /api/logs → both events appear with correct fields.
  GET /api/logs/export → downloads a valid CSV.
```

### PHASE 5 — User Management API
```
Read spec Section 5.4.
Build:
  GET    /api/users
  POST   /api/users              (bcrypt hash password, log user_create)
  PATCH  /api/users/:id/role    (log role_change)
  PATCH  /api/users/:id/status  (log deactivate if active→false)
  DELETE /api/users/:id         (prevent deleting own account)

Verify:
  Create a new viewer user via POST /api/users
  Login as that user → GET /api/auth/me returns role: viewer
  PATCH role to member → login again → role: member
  PATCH status to active: false → attempt login → 403
```

### PHASE 6 — Frontend: Auth + Layout
```
Read spec Section 7 (frontend patterns) and Section 12 (design tokens).
Create client/src/utils/tokens.js with the exact color values from Section 12.

Build:
  LoginPage.jsx       — form, POST /auth/login, redirect to /directory on success
  AuthContext.jsx     — session restore via GET /auth/me on mount
  useAuth.js hook
  ProtectedRoute.jsx  — redirect to /login if no user, /forbidden if wrong role
  Sidebar.jsx         — nav items: Directory (all), Activity Log (all),
                        User Management (admin only), Sign Out
  TopBar.jsx          — user name, role badge, sign out button
  App.jsx             — routes: /login, /directory, /directory/:folderId,
                        /activity, /users

Style using the navy/ice palette from tokens.js. Sidebar background: navy.
Active nav item: left amber border + navyLt background.

Verify:
  Visit / → redirect to /login
  Login as admin → lands on /directory, sees all 3 nav items
  Login as viewer → lands on /directory, no User Management nav item
  Sign out → back to /login
```

### PHASE 7 — Frontend: Document Directory
```
Build:
  DirectoryPage.jsx
    - Loads GET /api/folders
    - Renders FolderGrid with one FolderCard per folder
    - Locked folders (not in user's allowedRoles): greyed out, 🔒 icon, not clickable
    - Use canAccess() from client/src/utils/permissions.js

  FolderPage.jsx (route: /directory/:folderId)
    - Loads GET /api/folders/:id/documents
    - Renders DocumentTable
    - Search bar (client-side filter)
    - Upload button visible to admin only → opens upload modal
    - Back button → returns to /directory

  DocumentTable.jsx
    - Columns: name (with file type icon), size, uploaded date, actions
    - View button → opens pre-signed URL in new tab, logs view event
    - Download button → fetch pre-signed URL, trigger browser download
    - Delete button → admin only, soft delete, refresh list

  FolderCard.jsx
    - Icon, folder name, document count, role badges

Verify:
  Admin: opens all 5 folders, can upload + delete
  Member: opens 4 folders, no upload/delete buttons
  Viewer: opens 2 folders, locked card for 3 others
  Download: file downloads correctly, event appears in activity log
```

### PHASE 8 — Frontend: Activity Log
```
Build:
  ActivityLogPage.jsx
    Stats row: 3 cards — Downloads, Views, Logins (counts from current data)

  LogFilters.jsx
    Filter buttons: All · Downloaded · Viewed · Login
    Date range inputs (optional)
    CSV Export button (admin only) → calls GET /api/logs/export

  LogTable.jsx
    Admin columns: Timestamp, User, Action badge, Document/Target, IP Address
    Non-admin columns: Timestamp, Action badge, Document/Target (own events only)
    Action badges: colour-coded (green=downloaded, navy=viewed, amber=login)
    Paginated (20 per page)

Verify:
  Login as admin → see all users' events
  Login as member → see own events only, no IP column
  Click CSV Export → file downloads with correct data
```

### PHASE 9 — Frontend: User Management
```
Build:
  UserManagementPage.jsx (redirect non-admin to /directory)
    Header: user count + active count
    Add User button → opens AddUserModal
    Role legend (Admin / Member / Viewer with descriptions)

  UserTable.jsx
    Columns: User (name + email + username), Role, Status, Joined, Actions
    Role: dropdown for others, static badge for self
    Status: toggle button (Active/Inactive) — disabled for self
    Actions: Remove button (red) — hidden for self

  AddUserModal.jsx
    Fields: Full name, Email, Username, Password, Role (dropdown)
    Validation: all fields required, username must be unique
    On submit: POST /api/users → close modal → refresh list

Verify:
  Create a new member user
  Change role from member → viewer
  Deactivate → login as that user → blocked
  Reactivate → login → works
  Cannot change own role or deactivate self
```

### PHASE 10 — Hardening
```
Read spec Section 8 (security checklist) carefully.

Install and configure:
  helmet                   — security headers (CSP, HSTS, X-Frame-Options)
  express-rate-limit       — 10 requests/min on POST /api/auth/login per IP
  rate-limit-redis         — use Redis as the rate limit store

Confirm CORS:
  origin: process.env.CLIENT_URL only
  credentials: true
  methods: GET, POST, PATCH, DELETE

Zod validation:
  Every POST and PATCH body validated with Zod schema before hitting controller
  Return 400 with field-level errors on validation failure

Global error handler:
  In development: return { error: message, stack }
  In production: return { error: 'Internal server error' } only

Nginx config:
  HTTPS with self-signed cert (dev) or certbot (prod)
  Proxy /api → server:4000
  Proxy / → client:5173 (dev) or serve /dist (prod)
  Rate limit zone for login endpoint at Nginx level too

Final security checklist (run through Section 8):
  [ ] Passwords bcrypt hashed at cost 12
  [ ] Password field never returned in any API response
  [ ] JWT in HTTP-only cookie only
  [ ] S3 bucket ACL is private
  [ ] Pre-signed URLs expire in 300 seconds
  [ ] storageKey never exposed in API responses
  [ ] Activity logs have no delete/update routes
  [ ] Admin cannot delete their own account
  [ ] Rate limiting active on login route
  [ ] All env vars in .env, none hardcoded

Verify:
  Attempt 11 logins in 1 minute → 429 on the 11th
  Check response headers for X-Frame-Options, Strict-Transport-Security
  Confirm no password field in GET /api/users response
  Confirm storageKey not in GET /api/folders/:id/documents response
```

---

## When You Are Done

Run through this final checklist before calling the build complete:

```
[ ] All 10 phases verified
[ ] docker-compose up starts everything cleanly
[ ] Login works for admin, member, and viewer credentials
[ ] Role-based folder access enforced on both frontend and backend
[ ] File upload → S3 → pre-signed download works end to end
[ ] Every action (login, view, download, upload, delete, user changes) appears in activity log
[ ] Admin can add, change role, deactivate, and remove users
[ ] Activity log is read-only (no edit/delete routes)
[ ] Security checklist in Section 8 fully complete
[ ] .env.example is up to date with every required variable
[ ] README.md documents how to run the project locally
```

---

## If You Get Stuck

- Re-read the relevant section of `ORAD-SPEC.md` before asking for clarification
- Check the Definitions table (Section 13 of the spec) for any unfamiliar terms
- If a third-party library behaves unexpectedly, check its latest docs — the spec lists library names but not version-specific APIs
- Log errors clearly — never swallow exceptions silently

---

*ORAD Build Prompt v1.0 — MojoPay Internal*
