# EduLearn LMS — Complete Setup & Development Guide

This guide walks you through setting up the EduLearn LMS project on a new machine from scratch.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Clone / Copy the Project](#2-clone--copy-the-project)
3. [Install Dependencies](#3-install-dependencies)
4. [Configure Environment Variables](#4-configure-environment-variables)
5. [Set Up MongoDB](#5-set-up-mongodb)
6. [Restore the Database](#6-restore-the-database)
7. [Run the Development Server](#7-run-the-development-server)
8. [Default Login Credentials](#8-default-login-credentials)
9. [Project Structure](#9-project-structure)
10. [Useful Scripts](#10-useful-scripts)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. Prerequisites

Install the following tools before starting:

| Tool | Version | Download |
|------|---------|----------|
| Node.js | v20+ (LTS) | https://nodejs.org |
| pnpm | v10+ | `npm install -g pnpm` |
| MongoDB Community | v7+ | https://www.mongodb.com/try/download/community |
| Git (optional) | latest | https://git-scm.com |

### Verify installations

```bash
node -v        # should show v20.x.x or higher
pnpm -v        # should show 10.x.x
mongod --version
```

---

## 2. Clone / Copy the Project

**Option A — Copy the project folder** (ZIP transfer):
- Copy the entire project folder (`mern-lms-platform-1cb`) to the new machine.
- Extract if zipped.

**Option B — Git clone** (if hosted on GitHub/GitLab):
```bash
git clone <repo-url>
cd mern-lms-platform-1cb
```

---

## 3. Install Dependencies

From the project root:

```bash
pnpm install
```

> This installs all frontend and backend dependencies defined in `package.json`.

---

## 4. Configure Environment Variables

Copy the example env file and edit it:

```bash
cp .env .env.local
```

Or create a `.env` file in the project root with the following content:

```env
# ─── Server ───────────────────────────────────────────────────────────────────
PORT=8080
NODE_ENV=development

# ─── MongoDB ──────────────────────────────────────────────────────────────────
# Local MongoDB (recommended for development):
MONGODB_URI=mongodb://localhost:27017/edulearn_lms

# Atlas (cloud) — uncomment and fill in your credentials:
# MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/edulearn_lms?retryWrites=true&w=majority

# ─── JWT ──────────────────────────────────────────────────────────────────────
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# ─── Email (optional) ─────────────────────────────────────────────────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

---

## 5. Set Up MongoDB

### Option A — Local MongoDB (Recommended for Development)

**Windows:**
1. Download MongoDB Community Server from https://www.mongodb.com/try/download/community
2. Run the installer (choose "Complete" setup)
3. MongoDB installs as a Windows Service and starts automatically
4. Verify it's running:
   ```bash
   mongosh --eval "db.runCommand({ ping: 1 })"
   ```

**macOS (Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0
```

**Ubuntu/Debian:**
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Option B — MongoDB Atlas (Cloud, Free Tier)

1. Go to https://www.mongodb.com/atlas and create a free account
2. Create a new cluster (Free M0 tier)
3. Under **Database Access**, create a user with read/write privileges
4. Under **Network Access**, add your IP address (or `0.0.0.0/0` for dev)
5. Click **Connect > Drivers** and copy the connection string
6. Paste it into your `.env` as `MONGODB_URI`

---

## 6. Restore the Database

The `db_export/` folder (or `db_export.zip`) contains a full JSON snapshot of the database.

### Step 1 — Unzip (if needed)

**Windows:**
```powershell
Expand-Archive -Path db_export.zip -DestinationPath . -Force
```

**macOS / Linux:**
```bash
unzip db_export.zip
```

### Step 2 — Run the import script

```bash
node scripts/import_db.mjs
```

To wipe the database first before importing (clean slate):
```bash
node scripts/import_db.mjs --wipe
```

To import into a different MongoDB URI:
```bash
node scripts/import_db.mjs --uri=mongodb://localhost:27017/edulearn_lms
```

### Alternative — Seed fresh data (no export needed)

If you don't have `db_export/`, you can seed the database with fresh demo data:

```bash
node scripts/ultimateSeed.js
```

Or the simpler seed:
```bash
node server/seed.js
```

---

## 7. Run the Development Server

The project runs both the frontend (Vite) and backend (Express) concurrently:

```bash
pnpm dev
```

This starts:
- **Frontend** (React/Vite) at `http://localhost:5173`
- **Backend** (Express API) at `http://localhost:8080`

> The Vite dev server proxies API calls to the Express backend automatically.

### Run servers separately (optional)

```bash
# Terminal 1 — Backend only
node server/index.js

# Terminal 2 — Frontend only
pnpm exec vite
```

---

## 8. Default Login Credentials

All seeded accounts use password: **`password`** (or **`password123`** for some accounts)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@university.edu` | `password123` |
| HOD | `hod@university.edu` | `password123` |
| Faculty | `faculty@university.edu` | `password123` |
| Student | `student@university.edu` | `password123` |
| HOD (alt) | `hod@example.com` | `password` |
| Faculty (alt) | `anita@nec.edu` | `password` |
| Faculty (alt) | `suresh@nec.edu` | `password` |

> **Change these credentials immediately in any non-development environment.**

---

## 9. Project Structure

```
mern-lms-platform-1cb/
├── client/                  # React frontend source
│   ├── components/          # Reusable UI components
│   ├── pages/               # Route-level page components
│   ├── hooks/               # Custom React hooks
│   └── lib/                 # Utilities, API client
├── server/                  # Express backend source
│   ├── index.js             # Server entry point
│   ├── models/              # Mongoose data models
│   ├── routes/              # API route handlers
│   ├── middleware/          # Auth, error handling middleware
│   ├── utils/               # Helper utilities
│   ├── seed.js              # Basic database seeder
│   └── socket.js            # Socket.IO setup
├── scripts/                 # Utility scripts
│   ├── export_db.mjs        # Export DB to JSON
│   ├── import_db.mjs        # Import DB from JSON
│   ├── ultimateSeed.js      # Full demo data seeder
│   └── createAdmin.js       # Create admin user
├── db_export/               # Database snapshot (JSON files, 18 collections)
├── db_export.zip            # Compressed database snapshot
├── shared/                  # Types shared between client and server
├── public/                  # Static assets
├── .env                     # Environment variables (do not commit secrets)
├── package.json
├── pnpm-lock.yaml
├── vite.config.js           # Vite config (frontend)
└── vite.config.server.js    # Vite config (backend build)
```

### Key Models

| Model | File | Description |
|-------|------|-------------|
| User | `server/models/User.js` | All user roles (admin, HOD, faculty, student) |
| Department | `server/models/Department.js` | Academic departments |
| Course | `server/models/Course.js` | Courses / subjects |
| Exam | `server/models/Exam.js` | Online exams |
| QuestionBank | `server/models/QuestionBank.js` | Exam questions |
| Submission | `server/models/Submission.js` | Student exam submissions |
| Lab | `server/models/Lab.js` | Computer lab management |
| Device | `server/models/Device.js` | Lab devices/PCs |
| Attendance | `server/models/Attendance.js` | Student attendance |
| Mark | `server/models/Mark.js` | Student marks/grades |
| Violation | `server/models/Violation.js` | Exam violations (tab switch, etc.) |
| Notification | `server/models/Notification.js` | System notifications |
| Settings | `server/models/Settings.js` | Institution settings |

---

## 10. Useful Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start frontend + backend in development mode |
| `pnpm build` | Build for production (client + server) |
| `pnpm start` | Start production build |
| `node server/seed.js` | Seed basic demo data |
| `node scripts/ultimateSeed.js` | Seed full demo data (all roles, exams, etc.) |
| `node scripts/export_db.mjs` | Export current DB to `db_export/` |
| `node scripts/import_db.mjs` | Import DB from `db_export/` |
| `node scripts/import_db.mjs --wipe` | Wipe DB then import |
| `node scripts/createAdmin.js` | Create a new admin user |

---

## 11. Troubleshooting

### MongoDB connection refused
```
MongoDB connection failed: connect ECONNREFUSED 127.0.0.1:27017
```
**Fix:** MongoDB is not running. Start it:
- Windows: `net start MongoDB` (in Admin PowerShell), or start from Services
- macOS: `brew services start mongodb-community`
- Linux: `sudo systemctl start mongod`

---

### Port 8080 already in use
```
Error: listen EADDRINUSE :::8080
```
**Fix:** Change the port in `.env`:
```env
PORT=8081
```

---

### pnpm: command not found
```bash
npm install -g pnpm
```

---

### Import fails with duplicate key errors
Documents with those `_id` values already exist. Use `--wipe` to clear first:
```bash
node scripts/import_db.mjs --wipe
```

---

### JWT errors on login (invalid signature)
Make sure `JWT_SECRET` in `.env` matches the value used when users were created. If importing a database from another machine, use the **same `JWT_SECRET`** or re-seed fresh users.

---

### Cannot find module errors
```bash
pnpm install
```
Re-run install to ensure all dependencies are present.

---

## Quick Start Checklist

- [ ] Node.js v20+ installed
- [ ] pnpm installed (`npm i -g pnpm`)
- [ ] MongoDB running locally (or Atlas URI configured)
- [ ] `.env` file created and configured
- [ ] `pnpm install` run in project root
- [ ] Database imported (`node scripts/import_db.mjs`) or seeded (`node scripts/ultimateSeed.js`)
- [ ] Dev server started (`pnpm dev`)
- [ ] Login at `http://localhost:5173` with credentials from section 8
