# PRIDE Training App

A mobile-first Progressive Web App (PWA) for hospitality teams to track new hire 90-day onboarding evaluations with real-time sync, offline support, and comprehensive analytics.

## Overview

PRIDE Training App transforms the traditional paper-based evaluation process into a digital, real-time system. Managers, leads, and team members can evaluate new hires across technical skills, soft skills, and leadership development on any device—web, iOS, or Android—with full offline capability for kitchen environments with unreliable connectivity.

The app replaces manual PDF tracking with smart analytics, team cohort comparisons, and instant visibility into new hire progress. Built for fast mobile networks and slow connectivity alike, PRIDE ensures your team stays synchronized whether they're online or offline.

## Features & Benefits

### Core Capabilities
- **Real-Time Evaluations** — Team members rate new hire skills (1-5 scale) instantly; changes sync across the team
- **Offline-First** — Work offline, sync automatically when back online using Service Workers and IndexedDB
- **Mobile PWA** — Install directly from browser on iOS/Android; no app store required
- **Role-Based Access** — Distinct permissions for new hires, team leads, managers, and admins; FOH/BOH team boundaries enforced
- **90-Day Tracking** — Automatic progress calculations, daily elapsed time, completion percentage
- **Leadership Modules** — Track Thirty Percent Framework pillars: Emotional Intelligence, Decisiveness, Delegation, Coaching, Cross-Functional Communication
- **Team Analytics** — Cohort summaries, progress trends, skill averages, weekly performance graphs
- **Audit Logging** — Full activity history with timestamps and user attribution for compliance
- **Rate Limiting & Security** — JWT tokens, bcrypt hashing, 5 attempts/15 min auth limit, helmet headers

### User Experience
- **Intuitive Dashboard** — At-a-glance view of new hire progress, team status, and key metrics
- **Fast Evaluation Forms** — Pre-filled skill lists, quick 1-5 rating buttons, optional notes
- **Smart Caching** — 5-minute analytics cache, 1-minute cohort cache for fast load times
- **Accessibility** — WCAG 2.1 AA compliant, keyboard navigation, screen reader support

### For Managers
- Create new hire records with 90-day target dates
- View team analytics, cohort performance, and individual progress
- Export evaluations and leadership module summaries
- Manage user roles and team assignments

### For Team Leads & Kitchen Staff
- Evaluate FOH/BOH new hires on role-specific technical skills
- Rate shared soft skills (communication, teamwork, attitude, etc.)
- Leave timestamped notes and coaching feedback
- View their team's new hires and progress

### For New Hires
- View their own evaluations and feedback
- See progress toward 90-day onboarding milestone
- Access leadership module assignments

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | React | 18.3+ |
| | React Router | 6.28+ |
| | Vite | 5.4+ |
| | TailwindCSS | 3.4+ |
| | Recharts | 3.10+ |
| | TypeScript | 5.6+ |
| | Playwright (E2E) | 1.48+ |
| **Backend** | Node.js | 18+ |
| | Express | 4.18+ |
| | PostgreSQL | 14+ |
| | jwt (jose) | 6.2+ |
| | bcrypt | 2.4+ |
| | helmet | 7.0+ |
| **Infrastructure** | Vercel | frontend |
| | AWS RDS / Heroku Postgres | database |
| | GitHub Actions | CI/CD |

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Web Browser / Mobile                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │   React PWA (React Router, Vite, TailwindCSS)        │   │
│  │  ┌────────────┐  ┌─────────────┐  ┌─────────────┐   │   │
│  │  │ Dashboard  │  │ Evaluation  │  │  Analytics  │   │   │
│  │  │   Page     │  │   Forms     │  │   Dashboard │   │   │
│  │  └────────────┘  └─────────────┘  └─────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │      Service Worker (Offline Sync, Caching)         │   │
│  │  ┌─────────────────────────────────────────────┐    │   │
│  │  │  IndexedDB (Local Data Cache)               │    │   │
│  │  │  Sync Queue (pending changes)               │    │   │
│  │  └─────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↕
                    (HTTPS REST API)
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                  Express Backend (Node.js)                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           API Routes & Middleware                     │   │
│  │  ┌──────────────┐ ┌────────────┐ ┌──────────────┐   │   │
│  │  │  Auth Routes │ │New Hire API│ │Evaluations  │   │   │
│  │  └──────────────┘ └────────────┘ └──────────────┘   │   │
│  │  ┌──────────────┐ ┌────────────────────────────┐   │   │
│  │  │ Rate Limiter │ │  RBAC (Role-Based Access) │   │   │
│  │  └──────────────┘ └────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │            Services (Business Logic)                 │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐    │   │
│  │  │AuthService│ │Analytics  │ AuditService   │    │   │
│  │  └──────────┘ └──────────┘ └──────────────────┘    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│              PostgreSQL Database (AWS RDS)                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Users | NewHires | SkillRatings | LeadershipModules│   │
│  │  AuditLog | AuditEvents (immutable event store)    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Installation

### Prerequisites
- Node.js 18+ and npm 9+
- PostgreSQL 14+ (local or cloud-hosted)
- Git

### Quick Start

#### 1. Clone the repository
```bash
git clone <repository-url>
cd hospitality-app
npm install
```

#### 2. Set up environment variables

**Backend** — Create `backend/.env`:
```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://pride_user:pride_password@localhost:5432/pride_training_db
JWT_SECRET=your-secret-key-min-32-chars
CORS_ORIGIN=http://localhost:3000
```

**Frontend** — Create `frontend/.env.local`:
```env
VITE_API_BASE_URL=http://localhost:3001
VITE_APP_TITLE=PRIDE Training App
```

#### 3. Initialize the database

```bash
# Create PostgreSQL database (using psql or your database client)
createdb pride_training_db

# Run migrations (if using migration files)
# Or initialize schema from backend/src/db/schema.sql
psql pride_training_db < backend/src/db/schema.sql

# Seed sample data (optional)
cd backend && npm run seed
```

#### 4. Install dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
cd ..
```

#### 5. Generate Prisma client (if using Prisma)
```bash
npx prisma generate
npx prisma db push
```

## Running the Development Server

### Backend

```bash
cd backend
npm run dev
```

The backend will start on `http://localhost:3001`

### Frontend

In a separate terminal:
```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173` (Vite default)

### Both Together

```bash
# From project root
npm run dev
```

This runs both concurrently if configured in the root `package.json`.

## Testing

### Backend Tests
```bash
cd backend
npm test                 # Run all tests
npm run test:watch      # Watch mode
```

### Frontend Tests
```bash
cd frontend
npm test                           # Unit tests with Vitest
npm run test:e2e                   # E2E tests with Playwright
npm run test:e2e:headed            # E2E with browser visible
npm run test:e2e:debug             # Debug mode
```

### Coverage Report
```bash
cd backend
npm test -- --coverage
```

## Deployment

### Frontend Deployment (Vercel)

```bash
# Connect your GitHub repo to Vercel
# or deploy via CLI:
npm install -g vercel
cd frontend
vercel deploy --prod

# Environment variables on Vercel:
# VITE_API_BASE_URL=https://your-backend-api.com
```

### Backend Deployment

#### Option 1: Heroku
```bash
# Create Heroku app
heroku create pride-training-app-backend
heroku addons:create heroku-postgresql:standard-0

# Deploy
git push heroku main
```

#### Option 2: AWS/DigitalOcean/Railway
1. Create Node.js server instance
2. Set environment variables
3. Install dependencies: `npm install`
4. Build: `npm run build`
5. Start: `npm start`

#### Database Backup Strategy
- **Automated**: Enable daily backups on AWS RDS or Heroku PostgreSQL
- **Manual**: `pg_dump pride_training_db | gzip > backup-$(date +%Y%m%d).sql.gz`
- **Retention**: Keep 30 days of backups

## Environment Variables Reference

### Backend

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | `development` | Set to `production` for deployments |
| `PORT` | No | `3001` | Server port |
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `JWT_SECRET` | Yes | — | Secret for JWT signing (min 32 chars) |
| `CORS_ORIGIN` | No | `http://localhost:3000` | Allowed origins (comma-separated) |
| `LOG_LEVEL` | No | `info` | Logging level (debug, info, warn, error) |

### Frontend

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_BASE_URL` | Yes | — | Backend API endpoint |
| `VITE_APP_TITLE` | No | `PRIDE Training App` | App title in browser |

## Monitoring & Logging

### Backend Logging
- Console logs to stdout (captured by container logs)
- Structured JSON logs with timestamp, level, message
- Request logging middleware logs all API calls

### Monitoring Endpoints
- `GET /health` — Database and service health check

Example response:
```json
{
  "status": "healthy",
  "database": "connected",
  "uptime": 3600.5,
  "timestamp": "2026-09-28T12:00:00Z"
}
```

## Troubleshooting

### Database Connection Issues
```bash
# Test connection
psql postgresql://user:pass@host:5432/pride_training_db -c "SELECT NOW();"

# Check env var
echo $DATABASE_URL
```

### Service Worker Issues
- Clear browser cache: DevTools → Application → Clear site data
- Check Service Worker status: DevTools → Application → Service Workers
- View Service Worker logs: DevTools → Console (check for SW errors)

### JWT Errors
- Ensure `JWT_SECRET` is set and consistent across restarts
- Clear auth token: `localStorage.removeItem('auth_token')`
- Re-login through the app

### Offline Sync Issues
- Check IndexedDB data: DevTools → Application → IndexedDB
- Manual sync: Open DevTools console and call `window.syncQueue?.processSyncQueue()`

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and test: `npm test`
3. Commit with semantic messages: `git commit -m "feat: add new evaluation types"`
4. Push and create a pull request

## License

PROPRIETARY — Internal use only

## Support & Documentation

- **API Documentation**: See `docs/API.md`
- **User Guide**: See `docs/USER_GUIDE.md`
- **Architecture**: See `docs/ARCHITECTURE.md`
- **Deployment**: See `docs/DEPLOYMENT.md`
- **Changelog**: See `CHANGELOG.md`

---

**Questions?** Contact the PRIDE Team or check existing GitHub issues.
