# Angular 17 JWT Application

A **production-ready** Angular 17 application with JWT authentication, JSON Server backend, Angular Material UI, CSS flexbox layouts, and comprehensive Jasmine/Karma unit tests.

---

## Quick Start

```bash
npm install
npm run dev        # Starts Angular (:4200) + JSON Server (:3000) simultaneously
```

Or run separately:

```bash
npm run server     # JSON Server backend on port 3000
npm start          # Angular dev server on port 4200
```

---

## Demo Accounts

| Username      | Password      | Role    | Can Access                        |
|--------------|---------------|---------|-----------------------------------|
| `admin`       | `admin123`    | Admin   | Dashboard, Users (full CRUD), Profile |
| `jane.smith`  | `manager123`  | Manager | Dashboard, Users (read/toggle), Profile |
| `john.doe`    | `password123` | User    | Dashboard, Profile                |

---

## Features

### Authentication
- **JWT login** via `POST /auth/login` on JSON Server
- **Refresh token** auto-rotated on 401 via `ErrorInterceptor`
- **Logout** clears tokens from localStorage
- **AuthGuard** — redirects unauthenticated users to `/login`
- **RoleGuard** — blocks routes based on `data: { roles: [...] }`
- **JwtInterceptor** — attaches `Authorization: Bearer <token>` to every HTTP request

### Pages
- **Login** — Material form with validation, demo account buttons
- **Dashboard** — Stats cards, activity feed, task progress bar, recent users list
- **Users** — Material table with sort, filter, pagination; create/toggle/delete with confirm dialog
- **Profile** — Edit first name, last name, email; changes saved to JSON Server

### Tech Stack
- Angular 17 + TypeScript 5.2
- Angular Material 17
- CSS Flexbox (utility classes in `styles.scss`)
- JSON Server 0.17 + custom auth middleware
- Jasmine + Karma unit tests

---

## Project Structure

```
angular-jwt-app/
├── auth-middleware.js          # JWT middleware for JSON Server
├── db.json                     # JSON Server database
├── src/
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   └── app/
│       ├── core/
│       │   ├── guards/
│       │   │   ├── auth.guard.ts + .spec.ts
│       │   │   └── role.guard.ts
│       │   ├── interceptors/
│       │   │   ├── jwt.interceptor.ts + .spec.ts
│       │   │   └── error.interceptor.ts
│       │   ├── models/
│       │   │   ├── user.model.ts
│       │   │   └── auth.model.ts
│       │   └── services/
│       │       ├── auth.service.ts + .spec.ts
│       │       └── api.service.ts + .spec.ts
│       ├── features/
│       │   ├── auth/login/    login.component.* + .spec.ts
│       │   ├── dashboard/     dashboard.component.* + .spec.ts
│       │   ├── users/         users.component.*
│       │   └── profile/       profile.component.*
│       └── shared/
│           ├── material.module.ts
│           └── components/
│               ├── navbar/
│               ├── stat-card/
│               ├── activity-feed/
│               └── confirm-dialog/
```

---

## Running Tests

```bash
npm test                        # Watch mode
npm test -- --watch=false       # Single run (CI)
```

### Test Coverage
| File | Tests |
|------|-------|
| `auth.service.spec.ts` | Login POST, token storage, logout, hasRole |
| `api.service.spec.ts` | CRUD calls, stats, activity |
| `jwt.interceptor.spec.ts` | Bearer injection, no-token path |
| `auth.guard.spec.ts` | Allow/redirect logic |
| `login.component.spec.ts` | Form validation, submit, error display |
| `dashboard.component.spec.ts` | forkJoin loading, stat calculations |
