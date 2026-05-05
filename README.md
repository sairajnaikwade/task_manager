# Team Task Manager

Developed by **Sairaj Naikwade**

A full-stack task management application built with Node.js/Express, Prisma, PostgreSQL, React, and TailwindCSS.

## 🚀 Live URL

> **Railway deployment:** [https://taskmanager-production-9365.up.railway.app](https://taskmanager-production-9365.up.railway.app)


## ✨ Key Features
- **Premium Light Theme**: Modern, high-contrast white UI with glassmorphism and smooth transitions.
- **Project-Level RBAC**: Secure access control where permissions are tied to project roles and task assignments.
- **Global Task Assignment**: Assign tasks to any registered user in the system, automatically granting them project access.
- **Priority Tracking**: Integrated priority badges (`Urgent`, `High`, `Normal`, `Low`).
- **Soft-Delete Audit**: Deleted tasks are stored in a read-only audit log.
- **Real-time Comments**: Contextual discussions on every task.

---


## 🔑 Test Credentials

| Role   | Email             | Password     |
|--------|-------------------|--------------|
| Admin  | admin@demo.com    | Admin1234!   |
| Member | alice@demo.com    | Member1234!  |
| Member | bob@demo.com      | Member1234!  |

---

## 🏗 Architecture

```
client/    React + Vite + TailwindCSS
           └── Axios client with JWT, ver, X-TaskManager-Trace-ID headers
           └── React Query for server state
           └── PrivateRoute + RoleGuard for auth/RBAC

server/    Node.js + Express + Prisma + PostgreSQL
           └── JWT auth middleware
           └── Project-level RBAC middleware (checks project_members table)
           └── Zod validation on all inputs
           └── Standard response wrapper { status, data, messages }
           └── All errors return HTTP 200 with status: "error"
```

### Key design decisions
- **RBAC is project-level**: The `rbacMiddleware` checks the `project_members` table for each request, not just the global user role.
- **Overdue detection**: `due_date < NOW() AND status != 'done'` — computed server-side in the dashboard aggregate query.
- **API versioning**: The `ver` header switches handler code paths per-endpoint without new URLs.
- **Trace IDs**: Every request gets an `X-TaskManager-Trace-ID` UUID for end-to-end tracing.

---

## 🛠 Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### 1. Clone & install

```bash
# Backend
cd server
npm install
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET
```

### 2. Database setup

```bash
cd server
npx prisma migrate dev --schema=db/schema.prisma
npm run db:seed
```

### 3. Run

```bash
# Backend (terminal 1)
cd server && npm run dev

# Frontend (terminal 2)
cd client && npm run dev
```

Frontend runs on http://localhost:5173  
Backend runs on http://localhost:3000

---

## 📡 API Overview

| Route | Method | Auth | Description |
|---|---|---|---|
| `/health` | GET | — | Railway health check |
| `/api/auth/register` | POST | — | Register new user |
| `/api/auth/login` | POST | — | Login, returns JWT |
| `/api/projects/list` | POST | JWT | List user's projects |
| `/api/projects/create` | POST | JWT | Create project |
| `/api/v1/projects/:id` | GET | JWT + member | Get project detail |
| `/api/tasks/list` | POST | JWT | List tasks (filter/search/sort) |
| `/api/tasks/create` | POST | JWT | Create task |
| `/api/v1/tasks/:id` | GET | JWT | Get task detail |
| `/api/tasks/update` | POST | JWT | Update task |
| `/api/members/list` | POST | JWT + member | List project members |
| `/api/members/add` | POST | JWT + admin | Add member |
| `/api/members/remove` | POST | JWT + admin | Remove member |
| `/api/dashboard` | POST | JWT | Aggregated stats |

All list endpoints accept `{ data: { filter, search, sort, page, per_page } }` in the body.

---

## 🚂 Railway Deployment

1. Create a new Railway project.
2. Add the **PostgreSQL** plugin (Railway will automatically provide the `DATABASE_URL`).
3. Connect your GitHub repository.
4. Set the following **Environment Variables**:
   - `JWT_SECRET`: (A strong random string)
   - `NODE_ENV`: `production`
5. Railway will automatically detect the root `package.json` and use:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`

---

## 👨‍💻 Author

**Sairaj Naikwade**
- GitHub: [sairajnaikwade](https://github.com/sairajnaikwade)
- Role: Full Stack Developer

This project is a personal portfolio piece and should not be redistributed without permission.
