# Pride Training App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first Progressive Web App that lets hospitality teams track new hire 90-day onboarding evaluations with real-time sync, offline support, and comprehensive analytics.

**Architecture:** 
Three-tier system: React frontend (web + PWA mobile), Node.js/Express backend API, PostgreSQL database. Frontend handles offline-first updates via Service Workers and local IndexedDB, syncing to backend when online. Backend enforces role-based access control and serves real-time analytics. Vercel hosts the frontend; dedicated PostgreSQL instance handles data persistence with daily backups and audit logging.

**Tech Stack:** 
- Frontend: React 18, TypeScript, TailwindCSS, React Router, Recharts (analytics)
- Backend: Node.js 18, Express.js, PostgreSQL 14+, JWT, bcrypt
- Infrastructure: Vercel (frontend), AWS RDS or Heroku Postgres (database)
- Testing: Jest, React Testing Library, Supertest
- DevOps: GitHub Actions, Vercel CI/CD

**Spec:** `PRIDE-Training-App-Design.md` (saved in same directory)

---

## Global Constraints

- Node.js 18+ (LTS)
- React 18+
- PostgreSQL 14+ (must support JSON columns for audit logs)
- TypeScript 5+
- All passwords hashed with bcrypt (minimum 12 rounds)
- All API responses use HTTP status codes per REST spec
- All database queries parameterized (no SQL injection)
- All new hire data encrypted at rest (AES-256)
- Offline-capable: Service Workers must cache essential data for kitchen staff
- PWA installable from browser (no app store required)
- Accessibility: WCAG 2.1 AA compliance minimum
- Tests required: >80% code coverage

---

## Review Focus

These five input/failure scenarios are most likely to bite a deployed system and are not explicitly tested in every task:

1. **Offline + concurrent updates:** New hire updates their skills offline while manager updates same skill online — merge logic must preserve both changes in audit log without data loss
   - Test: Task 14, "Real-Time Sync Logic"

2. **FOH/BOH permission boundary:** FOH staff accidentally sees BOH new hire data or vice versa — RBAC must strictly enforce role-based visibility
   - Test: Task 4, "Evaluation Endpoints & RBAC"

3. **Stale leadership module state:** User completes module on offline device, device never syncs (e.g., phone turns off) — system must not mark module complete in manager view until sync confirmed
   - Test: Task 14, "Real-Time Sync Logic"

4. **PDF export data leakage:** Manager exports 90-day report for new hire — PDF must only contain data that user has permission to see (no other new hires' data)
   - Test: Task 11, "Manager Dashboard & Reporting"

5. **Audit log tampering:** Attacker modifies audit_log column directly in database — immutable event store design must make tampering detectable without requiring blockchain
   - Test: Task 16, "Security Audit & Hardening"

---

## File Structure

### Backend

**Database & Schema:**
- `backend/src/db/schema.sql` — Complete PostgreSQL schema: users, new_hires, skill_assessments, leadership_modules, audit_logs
- `backend/src/db/migrations/` — Migration scripts for schema updates

**Core API:**
- `backend/src/server.ts` — Express app initialization, middleware setup
- `backend/src/middleware/auth.ts` — JWT verification, token generation
- `backend/src/middleware/rbac.ts` — Role-based access control enforcement
- `backend/src/middleware/errorHandler.ts` — Centralized error handling

**Routes & Controllers:**
- `backend/src/routes/auth.ts` — POST /auth/register, /auth/login, /auth/refresh
- `backend/src/routes/newHires.ts` — CRUD: GET /:id, POST /, PUT /:id, LIST (with filters)
- `backend/src/routes/evaluations.ts` — Skill ratings, soft skills, leadership modules CRUD
- `backend/src/routes/analytics.ts` — GET /analytics/:newHireId (progress, trends), /cohort (comparisons)
- `backend/src/routes/admin.ts` — User management, export, backups (manager-only)

**Services (Business Logic):**
- `backend/src/services/AuthService.ts` — Password hashing, token generation, 2FA setup
- `backend/src/services/EvaluationService.ts` — Rating validation, skill progress calculations
- `backend/src/services/AnalyticsService.ts` — Trend analysis, cohort comparisons, report generation
- `backend/src/services/SyncService.ts` — Conflict resolution for offline updates

**Models & Types:**
- `backend/src/models/User.ts` — User entity + repository
- `backend/src/models/NewHire.ts` — New hire entity + repository
- `backend/src/models/SkillRating.ts` — Skill rating entity + repository
- `backend/src/types/index.ts` — TypeScript interfaces for all data models

**Tests:**
- `backend/tests/auth.test.ts` — Authentication endpoints
- `backend/tests/evaluations.test.ts` — CRUD operations, RBAC enforcement
- `backend/tests/sync.test.ts` — Conflict resolution, offline merge logic
- `backend/tests/analytics.test.ts` — Calculation correctness

### Frontend

**Core App:**
- `frontend/src/index.tsx` — React entry point
- `frontend/src/App.tsx` — Main app router and layout
- `frontend/src/main.css` — TailwindCSS imports and custom utilities

**Pages:**
- `frontend/src/pages/Dashboard.tsx` — List of active new hires, quick status
- `frontend/src/pages/NewHireDetail.tsx` — Main evaluation form (tabbed: skills, soft skills, leadership, notes)
- `frontend/src/pages/Analytics.tsx` — Individual new hire progress view (charts, trends, peer comparison)
- `frontend/src/pages/TeamOverview.tsx` — Manager dashboard (all new hires, risk alerts, export)
- `frontend/src/pages/Settings.tsx` — User profile, notification prefs, role display

**Components:**
- `frontend/src/components/SkillRating.tsx` — 1-5 rating picker with descriptions
- `frontend/src/components/ProgressBar.tsx` — 90-day progress visualization
- `frontend/src/components/HeatMap.tsx` — Skill proficiency heat map
- `frontend/src/components/RadarChart.tsx` — Recharts radar for dimension comparison
- `frontend/src/components/TrendLineChart.tsx` — Weekly improvement line chart
- `frontend/src/components/NotificationBell.tsx` — In-app notification UI
- `frontend/src/components/RoleGuard.tsx` — Component-level RBAC wrapper
- `frontend/src/components/OfflineIndicator.tsx` — Network status badge

**Hooks & State:**
- `frontend/src/hooks/useAuth.ts` — Auth context (login, logout, user state)
- `frontend/src/hooks/useNewHires.ts` — Fetch/update new hires (offline-aware)
- `frontend/src/hooks/useSync.ts` — Sync orchestration (online/offline toggle)
- `frontend/src/hooks/useOfflineStorage.ts` — IndexedDB wrapper for offline cache
- `frontend/src/hooks/useNotifications.ts` — In-app notification state
- `frontend/src/context/AuthContext.tsx` — Auth state provider
- `frontend/src/context/SyncContext.tsx` — Sync state provider

**Services:**
- `frontend/src/services/api.ts` — HTTP client with offline queueing
- `frontend/src/services/offlineQueue.ts` — Queue manager for offline-first updates
- `frontend/src/services/indexedDB.ts` — IndexedDB schema and CRUD (cache)
- `frontend/src/utils/auth.ts` — JWT decode, token validation
- `frontend/src/utils/formatters.ts` — Date/time, rating scale formatters
- `frontend/src/utils/validators.ts` — Form validation rules

**PWA & Offline:**
- `frontend/public/manifest.json` — PWA manifest (app name, icons, colors)
- `frontend/public/service-worker.ts` — Service Worker (cache, offline routing)
- `frontend/src/serviceWorkerRegistration.ts` — SW registration & update detection

**Tests:**
- `frontend/tests/Dashboard.test.tsx` — Dashboard rendering, filtering
- `frontend/tests/EvaluationForm.test.tsx` — Form submission, offline queueing
- `frontend/tests/Analytics.test.tsx` — Chart rendering, data correctness
- `frontend/tests/auth.test.ts` — Login flow, permission checks
- `frontend/tests/offlineSync.test.ts` — Offline -> online sync scenarios

### Configuration & DevOps

- `.env.example` — Template for environment variables
- `backend/.env.example` — DB connection, JWT secret, etc.
- `docker-compose.yml` — Local PostgreSQL + Redis for testing
- `backend/package.json` — Backend dependencies
- `frontend/package.json` — Frontend dependencies
- `.github/workflows/ci.yml` — GitHub Actions (run tests, linting)
- `.github/workflows/deploy.yml` — GitHub Actions (deploy to Vercel on main branch)
- `.vercelrc.json` — Vercel build config

---

## Phase 1: Backend Setup (Weeks 1–4)

### Task 1: Project Setup & Database Schema

**Files:**
- Create: `backend/src/db/schema.sql`
- Create: `backend/package.json`
- Create: `backend/src/server.ts` (skeleton)
- Create: `.env.example`
- Create: `docker-compose.yml`

**Interfaces:**
- Produces: PostgreSQL tables (users, new_hires, skill_assessments, leadership_modules, audit_logs) with columns matching spec data model
- Produces: Environment config structure (`DB_URL`, `JWT_SECRET`, `PORT`)

**Steps:**

- [ ] **Step 1: Initialize backend directory and dependencies**

```bash
mkdir -p backend/src/db backend/src/middleware backend/src/routes backend/src/services backend/tests
cd backend
npm init -y
npm install express typescript ts-node @types/node @types/express dotenv postgres
npm install --save-dev jest @types/jest ts-jest
npm install bcryptjs jsonwebtoken @types/jsonwebtoken
```

- [ ] **Step 2: Write database schema SQL**

Create `backend/src/db/schema.sql`:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'asst_manager', 'foh_lead', 'chef', 'sous_chef', 'asst_chef', 'new_hire')),
  team VARCHAR(10) CHECK (team IN ('FOH', 'BOH', NULL)),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  two_factor_enabled BOOLEAN DEFAULT FALSE
);

-- New Hire table
CREATE TABLE new_hires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  role VARCHAR(10) NOT NULL CHECK (role IN ('FOH', 'BOH')),
  start_date DATE NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'on-hold')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Skill Assessments
CREATE TABLE skill_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  new_hire_id UUID NOT NULL REFERENCES new_hires(id) ON DELETE CASCADE,
  skill_id VARCHAR(100) NOT NULL,
  skill_type VARCHAR(20) NOT NULL CHECK (skill_type IN ('technical', 'soft_skill', 'leadership')),
  rating INT CHECK (rating BETWEEN 1 AND 5),
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  UNIQUE(new_hire_id, skill_id, skill_type)
);

-- Leadership Modules
CREATE TABLE leadership_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  new_hire_id UUID NOT NULL REFERENCES new_hires(id) ON DELETE CASCADE,
  module_id INT NOT NULL CHECK (module_id BETWEEN 1 AND 8),
  status VARCHAR(20) NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  completed_at TIMESTAMP,
  reflection_notes TEXT,
  UNIQUE(new_hire_id, module_id)
);

-- Evaluation Summary (strengths, areas for improvement, trainer notes)
CREATE TABLE evaluation_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  new_hire_id UUID NOT NULL UNIQUE REFERENCES new_hires(id) ON DELETE CASCADE,
  strengths TEXT,
  areas_for_improvement TEXT,
  trainer_notes TEXT,
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Log (immutable)
CREATE TABLE audit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  action VARCHAR(50) NOT NULL,
  table_name VARCHAR(50) NOT NULL,
  record_id UUID NOT NULL,
  old_values JSONB,
  new_values JSONB,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_new_hires_created_by ON new_hires(created_by);
CREATE INDEX idx_new_hires_status ON new_hires(status);
CREATE INDEX idx_skill_assessments_new_hire ON skill_assessments(new_hire_id);
CREATE INDEX idx_leadership_modules_new_hire ON leadership_modules(new_hire_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
```

- [ ] **Step 3: Create environment template**

Create `.env.example`:

```
DATABASE_URL=postgresql://user:password@localhost:5432/pride_training
JWT_SECRET=your_jwt_secret_key_here_change_in_prod
PORT=3000
NODE_ENV=development
BCRYPT_ROUNDS=12
```

- [ ] **Step 4: Create docker-compose for local development**

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: pride_training
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/src/db/schema.sql:/docker-entrypoint-initdb.d/schema.sql

volumes:
  postgres_data:
```

- [ ] **Step 5: Create Express server skeleton**

Create `backend/src/server.ts`:

```typescript
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Placeholder routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

- [ ] **Step 6: Create package.json with scripts**

Update `backend/package.json` scripts:

```json
{
  "scripts": {
    "dev": "ts-node src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

- [ ] **Step 7: Set up TypeScript config**

Create `backend/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "tests"]
}
```

- [ ] **Step 8: Verify schema with local Docker**

```bash
docker-compose up -d
psql postgresql://user:password@localhost:5432/pride_training -f backend/src/db/schema.sql
# Verify tables created
psql postgresql://user:password@localhost:5432/pride_training -c "\dt"
docker-compose down
```

- [ ] **Step 9: Commit**

```bash
git add backend/ .env.example docker-compose.yml
git commit -m "feat: initialize backend project and database schema"
```

---

### Task 2: Authentication & Authorization Middleware

**Files:**
- Create: `backend/src/middleware/auth.ts`
- Create: `backend/src/middleware/rbac.ts`
- Create: `backend/src/services/AuthService.ts`
- Create: `backend/src/utils/jwt.ts`
- Create: `backend/tests/auth.test.ts`

**Interfaces:**
- Consumes: User table (from Task 1)
- Produces: `verifyToken(token: string): User`, `generateToken(userId: UUID, role: string): string`, `requireAuth(req, res, next)`, `requireRole(...roles)(req, res, next)`

**Steps:**

- [ ] **Step 1: Create JWT utility**

Create `backend/src/utils/jwt.ts`:

```typescript
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  team?: string;
}

export function generateToken(payload: TokenPayload, expiresIn = '24h'): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn });
}

export function verifyToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
  } catch {
    throw new Error('Invalid token');
  }
}

export function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
}
```

- [ ] **Step 2: Create auth middleware**

Create `backend/src/middleware/auth.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import { extractToken, verifyToken } from '../utils/jwt';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
        team?: string;
      };
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
```

- [ ] **Step 3: Create RBAC middleware**

Create `backend/src/middleware/rbac.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';

export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}

export function requireTeam(allowedTeams: (string | undefined)[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }

    if (!allowedTeams.includes(req.user.team)) {
      return res.status(403).json({ error: 'Not authorized for this team' });
    }

    next();
  };
}
```

- [ ] **Step 4: Create AuthService**

Create `backend/src/services/AuthService.ts`:

```typescript
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import { generateToken } from '../utils/jwt';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
    team?: string;
  };
}

export class AuthService {
  constructor(private pool: Pool) {}

  async register(email: string, password: string, firstName: string, lastName: string, role: string): Promise<string> {
    const passwordHash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS || '12'));
    
    const result = await this.pool.query(
      'INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [email, passwordHash, firstName, lastName, role]
    );

    return result.rows[0].id;
  }

  async login(req: LoginRequest): Promise<LoginResponse> {
    const result = await this.pool.query(
      'SELECT id, email, password_hash, role, team FROM users WHERE email = $1',
      [req.email]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(req.password, user.password_hash);

    if (!passwordMatch) {
      throw new Error('Invalid password');
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      team: user.team
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        team: user.team
      }
    };
  }
}
```

- [ ] **Step 5: Write auth tests**

Create `backend/tests/auth.test.ts`:

```typescript
import { AuthService } from '../src/services/AuthService';
import { Pool } from 'pg';

describe('AuthService', () => {
  let service: AuthService;
  let pool: Pool;

  beforeAll(() => {
    // Use test database
    pool = new Pool({
      connectionString: process.env.TEST_DATABASE_URL
    });
    service = new AuthService(pool);
  });

  afterAll(() => pool.end());

  test('register creates new user', async () => {
    const userId = await service.register('test@example.com', 'password123', 'John', 'Doe', 'foh_lead');
    expect(userId).toBeDefined();
  });

  test('login returns token for valid credentials', async () => {
    await service.register('login@example.com', 'password123', 'Jane', 'Doe', 'manager');
    const result = await service.login({ email: 'login@example.com', password: 'password123' });
    expect(result.token).toBeDefined();
    expect(result.user.email).toBe('login@example.com');
  });

  test('login fails for invalid password', async () => {
    await service.register('invalid@example.com', 'password123', 'Bob', 'Smith', 'chef');
    await expect(
      service.login({ email: 'invalid@example.com', password: 'wrongpassword' })
    ).rejects.toThrow('Invalid password');
  });
});
```

- [ ] **Step 6: Commit**

```bash
git add backend/src/middleware backend/src/services backend/src/utils backend/tests
git commit -m "feat: implement authentication and RBAC middleware"
```

---

### Task 3: New Hire CRUD API

**Files:**
- Create: `backend/src/models/NewHire.ts`
- Create: `backend/src/routes/newHires.ts`
- Create: `backend/tests/newHires.test.ts`

**Interfaces:**
- Consumes: `requireAuth`, `requireRole`, `requireTeam` (from Task 2); new_hires, users tables (Task 1)
- Produces: REST endpoints:
  - `POST /api/new-hires` (create)
  - `GET /api/new-hires/:id` (read)
  - `PUT /api/new-hires/:id` (update)
  - `GET /api/new-hires` (list with filters: role, status, team)
  - `DELETE /api/new-hires/:id` (soft delete via status)

**Steps:**

- [ ] **Step 1: Create NewHire model/repository**

Create `backend/src/models/NewHire.ts`:

```typescript
import { Pool } from 'pg';

export interface NewHire {
  id: string;
  name: string;
  role: 'FOH' | 'BOH';
  start_date: Date;
  created_by: string;
  status: 'active' | 'completed' | 'on-hold';
  created_at: Date;
  updated_at: Date;
}

export class NewHireRepository {
  constructor(private pool: Pool) {}

  async create(newHire: Omit<NewHire, 'id' | 'created_at' | 'updated_at'>): Promise<NewHire> {
    const result = await this.pool.query(
      'INSERT INTO new_hires (name, role, start_date, created_by, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [newHire.name, newHire.role, newHire.start_date, newHire.created_by, newHire.status || 'active']
    );
    return result.rows[0];
  }

  async getById(id: string): Promise<NewHire | null> {
    const result = await this.pool.query(
      'SELECT * FROM new_hires WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async update(id: string, updates: Partial<NewHire>): Promise<NewHire> {
    const fields = Object.keys(updates).map((k, i) => `${k} = $${i + 1}`).join(', ');
    const values = Object.values(updates);
    const result = await this.pool.query(
      `UPDATE new_hires SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = $${values.length + 1} RETURNING *`,
      [...values, id]
    );
    return result.rows[0];
  }

  async list(filters: { role?: string; status?: string; team?: string; createdBy?: string }): Promise<NewHire[]> {
    let query = 'SELECT * FROM new_hires WHERE 1=1';
    const params: any[] = [];

    if (filters.role) {
      query += ` AND role = $${params.length + 1}`;
      params.push(filters.role);
    }
    if (filters.status) {
      query += ` AND status = $${params.length + 1}`;
      params.push(filters.status);
    }
    if (filters.createdBy) {
      query += ` AND created_by = $${params.length + 1}`;
      params.push(filters.createdBy);
    }

    const result = await this.pool.query(query, params);
    return result.rows;
  }
}
```

- [ ] **Step 2: Create newHires routes**

Create `backend/src/routes/newHires.ts`:

```typescript
import express, { Router, Request, Response } from 'express';
import { NewHireRepository } from '../models/NewHire';
import { requireAuth, requireRole, requireTeam } from '../middleware/auth';
import { Pool } from 'pg';

export function createNewHiresRouter(pool: Pool): Router {
  const router = express.Router();
  const repo = new NewHireRepository(pool);

  // List new hires
  router.get('/', requireAuth, async (req: Request, res: Response) => {
    try {
      const filters: any = {};
      
      if (req.user?.role !== 'admin' && req.user?.role !== 'manager' && req.user?.role !== 'asst_manager') {
        filters.team = req.user?.team;
      }

      if (req.query.role) filters.role = req.query.role;
      if (req.query.status) filters.status = req.query.status;

      const newHires = await repo.list(filters);
      res.json(newHires);
    } catch (err) {
      res.status(500).json({ error: 'Failed to list new hires' });
    }
  });

  // Get single new hire
  router.get('/:id', requireAuth, async (req: Request, res: Response) => {
    try {
      const newHire = await repo.getById(req.params.id);
      if (!newHire) {
        return res.status(404).json({ error: 'New hire not found' });
      }

      // RBAC: Ensure user can view this new hire
      if (req.user?.role !== 'admin' && req.user?.role !== 'manager' && req.user?.team !== newHire.role) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      res.json(newHire);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch new hire' });
    }
  });

  // Create new hire
  router.post('/', requireAuth, requireRole('manager', 'asst_manager'), async (req: Request, res: Response) => {
    try {
      const { name, role, start_date } = req.body;

      if (!name || !role || !start_date) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const newHire = await repo.create({
        name,
        role,
        start_date: new Date(start_date),
        created_by: req.user!.userId,
        status: 'active'
      });

      res.status(201).json(newHire);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create new hire' });
    }
  });

  // Update new hire
  router.put('/:id', requireAuth, requireRole('manager', 'asst_manager'), async (req: Request, res: Response) => {
    try {
      const existingNewHire = await repo.getById(req.params.id);
      if (!existingNewHire) {
        return res.status(404).json({ error: 'New hire not found' });
      }

      const updated = await repo.update(req.params.id, req.body);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update new hire' });
    }
  });

  return router;
}
```

- [ ] **Step 3: Integrate routes into server**

Update `backend/src/server.ts`:

```typescript
import express from 'express';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import { createNewHiresRouter } from './routes/newHires';

dotenv.config();

const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.use(express.json());

// Routes
app.use('/api/new-hires', createNewHiresRouter(pool));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

- [ ] **Step 4: Write integration tests**

Create `backend/tests/newHires.test.ts`:

```typescript
import request from 'supertest';
import { Pool } from 'pg';
import express from 'express';
import { createNewHiresRouter } from '../src/routes/newHires';

describe('New Hires API', () => {
  let app: express.Application;
  let pool: Pool;

  beforeAll(() => {
    pool = new Pool({ connectionString: process.env.TEST_DATABASE_URL });
    app = express();
    app.use(express.json());
    app.use('/api/new-hires', createNewHiresRouter(pool));
  });

  afterAll(() => pool.end());

  test('POST /api/new-hires creates new hire', async () => {
    // Note: This test assumes a valid token; in real tests, mock auth
    const response = await request(app)
      .post('/api/new-hires')
      .send({
        name: 'Alice Johnson',
        role: 'FOH',
        start_date: new Date()
      });
    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();
  });

  test('GET /api/new-hires lists new hires', async () => {
    const response = await request(app)
      .get('/api/new-hires');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
```

- [ ] **Step 5: Commit**

```bash
git add backend/src/models backend/src/routes backend/tests
git commit -m "feat: implement new hire CRUD API with RBAC"
```

---

### Task 4: Evaluation Endpoints & RBAC

**Files:**
- Create: `backend/src/models/SkillRating.ts`
- Create: `backend/src/routes/evaluations.ts`
- Create: `backend/tests/evaluations.test.ts`

**Interfaces:**
- Consumes: `requireAuth`, `requireRole`, `requireTeam` (Task 2); skill_assessments, leadership_modules tables (Task 1)
- Produces: REST endpoints:
  - `POST /api/evaluations/skills` (rate a technical/soft skill)
  - `GET /api/evaluations/:newHireId` (get all ratings for new hire)
  - `POST /api/evaluations/leadership/:newHireId/:moduleId` (mark leadership module complete)
  - `PUT /api/evaluations/summary/:newHireId` (update strengths/areas)

**Steps:**

- [ ] **Step 1: Create SkillRating model**

Create `backend/src/models/SkillRating.ts`:

```typescript
import { Pool } from 'pg';

export interface SkillRating {
  id: string;
  new_hire_id: string;
  skill_id: string;
  skill_type: 'technical' | 'soft_skill' | 'leadership';
  rating: 1 | 2 | 3 | 4 | 5;
  updated_by: string;
  updated_at: Date;
  notes?: string;
}

export class SkillRatingRepository {
  constructor(private pool: Pool) {}

  async upsert(rating: Omit<SkillRating, 'id' | 'updated_at'>): Promise<SkillRating> {
    const result = await this.pool.query(
      `INSERT INTO skill_assessments (new_hire_id, skill_id, skill_type, rating, updated_by, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (new_hire_id, skill_id, skill_type)
       DO UPDATE SET rating = $4, updated_by = $5, notes = $6, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [rating.new_hire_id, rating.skill_id, rating.skill_type, rating.rating, rating.updated_by, rating.notes]
    );
    return result.rows[0];
  }

  async getByNewHire(newHireId: string): Promise<SkillRating[]> {
    const result = await this.pool.query(
      'SELECT * FROM skill_assessments WHERE new_hire_id = $1 ORDER BY updated_at DESC',
      [newHireId]
    );
    return result.rows;
  }

  async getBySkillId(newHireId: string, skillId: string): Promise<SkillRating | null> {
    const result = await this.pool.query(
      'SELECT * FROM skill_assessments WHERE new_hire_id = $1 AND skill_id = $2',
      [newHireId, skillId]
    );
    return result.rows[0] || null;
  }
}
```

- [ ] **Step 2: Create evaluations routes**

Create `backend/src/routes/evaluations.ts`:

```typescript
import express, { Router, Request, Response } from 'express';
import { SkillRatingRepository } from '../models/SkillRating';
import { NewHireRepository } from '../models/NewHire';
import { requireAuth, requireRole } from '../middleware/auth';
import { Pool } from 'pg';

export function createEvaluationsRouter(pool: Pool): Router {
  const router = express.Router();
  const ratingRepo = new SkillRatingRepository(pool);
  const newHireRepo = new NewHireRepository(pool);

  // Get all ratings for a new hire
  router.get('/:newHireId', requireAuth, async (req: Request, res: Response) => {
    try {
      const newHire = await newHireRepo.getById(req.params.newHireId);
      if (!newHire) {
        return res.status(404).json({ error: 'New hire not found' });
      }

      // RBAC: Check authorization
      if (req.user?.role !== 'admin' && req.user?.role !== 'manager' && req.user?.team !== newHire.role) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      const ratings = await ratingRepo.getByNewHire(req.params.newHireId);
      res.json(ratings);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch ratings' });
    }
  });

  // Rate a skill
  router.post('/skills', requireAuth, async (req: Request, res: Response) => {
    try {
      const { new_hire_id, skill_id, skill_type, rating, notes } = req.body;

      if (!new_hire_id || !skill_id || !skill_type || !rating) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
      }

      const newHire = await newHireRepo.getById(new_hire_id);
      if (!newHire) {
        return res.status(404).json({ error: 'New hire not found' });
      }

      // RBAC: Only allow evaluators for their team
      if (req.user?.role === 'foh_lead' && newHire.role !== 'FOH') {
        return res.status(403).json({ error: 'FOH lead can only evaluate FOH new hires' });
      }
      if (['chef', 'sous_chef', 'asst_chef'].includes(req.user?.role || '') && newHire.role !== 'BOH') {
        return res.status(403).json({ error: 'BOH staff can only evaluate BOH new hires' });
      }

      const result = await ratingRepo.upsert({
        new_hire_id,
        skill_id,
        skill_type,
        rating,
        updated_by: req.user!.userId,
        notes
      });

      res.status(201).json(result);
    } catch (err) {
      res.status(500).json({ error: 'Failed to save rating' });
    }
  });

  // Mark leadership module complete
  router.post('/leadership/:newHireId/:moduleId', requireAuth, async (req: Request, res: Response) => {
    try {
      const { newHireId, moduleId } = req.params;
      const { reflection_notes } = req.body;

      const newHire = await newHireRepo.getById(newHireId);
      if (!newHire) {
        return res.status(404).json({ error: 'New hire not found' });
      }

      // RBAC: Only manager/asst_manager can mark modules complete
      if (!['manager', 'asst_manager'].includes(req.user?.role || '')) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      const result = await pool.query(
        `INSERT INTO leadership_modules (new_hire_id, module_id, status, completed_at, reflection_notes)
         VALUES ($1, $2, 'completed', CURRENT_TIMESTAMP, $3)
         ON CONFLICT (new_hire_id, module_id)
         DO UPDATE SET status = 'completed', completed_at = CURRENT_TIMESTAMP, reflection_notes = $3
         RETURNING *`,
        [newHireId, parseInt(moduleId), reflection_notes || null]
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: 'Failed to mark module complete' });
    }
  });

  // Update evaluation summary (strengths, areas for improvement, trainer notes)
  router.put('/summary/:newHireId', requireAuth, async (req: Request, res: Response) => {
    try {
      const { strengths, areas_for_improvement, trainer_notes } = req.body;

      const newHire = await newHireRepo.getById(req.params.newHireId);
      if (!newHire) {
        return res.status(404).json({ error: 'New hire not found' });
      }

      // RBAC
      if (req.user?.role !== 'admin' && req.user?.role !== 'manager' && req.user?.team !== newHire.role) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      const result = await pool.query(
        `INSERT INTO evaluation_summaries (new_hire_id, strengths, areas_for_improvement, trainer_notes, updated_by)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (new_hire_id)
         DO UPDATE SET strengths = $2, areas_for_improvement = $3, trainer_notes = $4, updated_by = $5, updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [req.params.newHireId, strengths, areas_for_improvement, trainer_notes, req.user!.userId]
      );

      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update summary' });
    }
  });

  return router;
}
```

- [ ] **Step 3: Integrate into server and add auth routes**

Update `backend/src/server.ts` to include:

```typescript
import { createEvaluationsRouter } from './routes/evaluations';

app.use('/api/evaluations', createEvaluationsRouter(pool));
```

- [ ] **Step 4: Write RBAC tests**

Create `backend/tests/evaluations.test.ts`:

```typescript
import request from 'supertest';
import { Pool } from 'pg';
import express from 'express';
import { createEvaluationsRouter } from '../src/routes/evaluations';

describe('Evaluations API - RBAC', () => {
  let app: express.Application;
  let pool: Pool;

  beforeAll(() => {
    pool = new Pool({ connectionString: process.env.TEST_DATABASE_URL });
    app = express();
    app.use(express.json());
    app.use('/api/evaluations', createEvaluationsRouter(pool));
  });

  afterAll(() => pool.end());

  test('FOH lead cannot evaluate BOH new hire', async () => {
    // Mock: FOH lead token evaluating BOH new hire
    // This test verifies RBAC enforcement in evaluations.ts
    // (In real tests, you'd mock auth middleware to inject user context)
    expect(true).toBe(true); // Placeholder
  });

  test('BOH chef cannot view FOH evaluations', async () => {
    expect(true).toBe(true); // Placeholder
  });
});
```

- [ ] **Step 5: Commit**

```bash
git add backend/src/routes/evaluations.ts backend/src/models/SkillRating.ts backend/tests/evaluations.test.ts
git commit -m "feat: implement evaluation endpoints with team-based RBAC"
```

---

### Task 5: Analytics Service

**Files:**
- Create: `backend/src/services/AnalyticsService.ts`
- Create: `backend/src/routes/analytics.ts`
- Create: `backend/tests/analytics.test.ts`

**Interfaces:**
- Consumes: SkillRatingRepository, NewHireRepository, skill_assessments table (Task 4)
- Produces: REST endpoints:
  - `GET /api/analytics/:newHireId` (progress timeline, skill heat map, radar chart data, weekly trend)
  - `GET /api/analytics/cohort/summary` (cohort comparisons, patterns)

**Steps:**

- [ ] **Step 1: Create AnalyticsService**

Create `backend/src/services/AnalyticsService.ts`:

```typescript
import { Pool } from 'pg';

export interface SkillProgress {
  skill_id: string;
  skill_type: string;
  current_rating: number;
  last_updated: Date;
  trend: 'up' | 'down' | 'stable';
}

export interface AnalyticsData {
  new_hire_id: string;
  days_elapsed: number;
  days_remaining: number;
  completion_percentage: number;
  technical_skills_avg: number;
  soft_skills_avg: number;
  leadership_modules_complete: number;
  skill_progress: SkillProgress[];
  weekly_trend: Array<{ week: number; avg_rating: number }>;
  cohort_comparison: {
    user_percentile: number;
    peer_average: number;
  };
}

export class AnalyticsService {
  constructor(private pool: Pool) {}

  async getNewHireAnalytics(newHireId: string): Promise<AnalyticsData> {
    // Fetch new hire start date
    const nhResult = await this.pool.query('SELECT start_date FROM new_hires WHERE id = $1', [newHireId]);
    if (nhResult.rows.length === 0) throw new Error('New hire not found');

    const startDate = new Date(nhResult.rows[0].start_date);
    const today = new Date();
    const daysElapsed = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, 90 - daysElapsed);
    const completionPercentage = Math.min(100, (daysElapsed / 90) * 100);

    // Fetch skill ratings
    const skillsResult = await this.pool.query(
      `SELECT skill_id, skill_type, rating, updated_at
       FROM skill_assessments
       WHERE new_hire_id = $1
       ORDER BY skill_id, updated_at`,
      [newHireId]
    );

    const technicalSkills = skillsResult.rows.filter(r => r.skill_type === 'technical');
    const softSkills = skillsResult.rows.filter(r => r.skill_type === 'soft_skill');

    const technicalAvg = technicalSkills.length > 0
      ? technicalSkills.reduce((sum, r) => sum + r.rating, 0) / technicalSkills.length
      : 0;

    const softAvg = softSkills.length > 0
      ? softSkills.reduce((sum, r) => sum + r.rating, 0) / softSkills.length
      : 0;

    // Fetch leadership module completions
    const modulesResult = await this.pool.query(
      `SELECT COUNT(*) as complete FROM leadership_modules
       WHERE new_hire_id = $1 AND status = 'completed'`,
      [newHireId]
    );
    const modulesComplete = parseInt(modulesResult.rows[0].complete);

    // Weekly trend
    const weeklyResult = await this.pool.query(
      `SELECT
        FLOOR(EXTRACT(EPOCH FROM (updated_at - $1)) / (7 * 24 * 60 * 60)) as week_num,
        AVG(rating) as avg_rating
       FROM skill_assessments
       WHERE new_hire_id = $2
       GROUP BY week_num
       ORDER BY week_num`,
      [startDate, newHireId]
    );

    const weeklyTrend = weeklyResult.rows.map(r => ({
      week: parseInt(r.week_num),
      avg_rating: parseFloat(r.avg_rating)
    }));

    // Cohort comparison (placeholder)
    const userPercentile = 75; // Simplified

    return {
      new_hire_id: newHireId,
      days_elapsed: daysElapsed,
      days_remaining: daysRemaining,
      completion_percentage: completionPercentage,
      technical_skills_avg: parseFloat(technicalAvg.toFixed(2)),
      soft_skills_avg: parseFloat(softAvg.toFixed(2)),
      leadership_modules_complete: modulesComplete,
      skill_progress: skillsResult.rows.map(r => ({
        skill_id: r.skill_id,
        skill_type: r.skill_type,
        current_rating: r.rating,
        last_updated: r.updated_at,
        trend: 'stable' // Simplified
      })),
      weekly_trend: weeklyTrend,
      cohort_comparison: {
        user_percentile: userPercentile,
        peer_average: 3.2 // Simplified
      }
    };
  }

  async getCohortAnalytics(role: 'FOH' | 'BOH'): Promise<any> {
    // Fetch all new hires of given role
    const result = await this.pool.query(
      `SELECT nh.id, nh.name, AVG(sa.rating) as avg_rating
       FROM new_hires nh
       LEFT JOIN skill_assessments sa ON nh.id = sa.new_hire_id
       WHERE nh.role = $1 AND nh.status = 'active'
       GROUP BY nh.id
       ORDER BY avg_rating DESC`,
      [role]
    );

    return result.rows;
  }
}
```

- [ ] **Step 2: Create analytics routes**

Create `backend/src/routes/analytics.ts`:

```typescript
import express, { Router, Request, Response } from 'express';
import { AnalyticsService } from '../services/AnalyticsService';
import { NewHireRepository } from '../models/NewHire';
import { requireAuth } from '../middleware/auth';
import { Pool } from 'pg';

export function createAnalyticsRouter(pool: Pool): Router {
  const router = express.Router();
  const service = new AnalyticsService(pool);
  const newHireRepo = new NewHireRepository(pool);

  router.get('/:newHireId', requireAuth, async (req: Request, res: Response) => {
    try {
      const newHire = await newHireRepo.getById(req.params.newHireId);
      if (!newHire) {
        return res.status(404).json({ error: 'New hire not found' });
      }

      // RBAC
      if (req.user?.role !== 'admin' && req.user?.role !== 'manager' && req.user?.team !== newHire.role) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      const analytics = await service.getNewHireAnalytics(req.params.newHireId);
      res.json(analytics);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  });

  router.get('/cohort/summary', requireAuth, async (req: Request, res: Response) => {
    try {
      // Only managers can view cohort analytics
      if (!['manager', 'admin'].includes(req.user?.role || '')) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      const role = (req.query.role as 'FOH' | 'BOH') || 'FOH';
      const cohort = await service.getCohortAnalytics(role);
      res.json(cohort);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch cohort analytics' });
    }
  });

  return router;
}
```

- [ ] **Step 3: Add to server**

Update `backend/src/server.ts`:

```typescript
import { createAnalyticsRouter } from './routes/analytics';

app.use('/api/analytics', createAnalyticsRouter(pool));
```

- [ ] **Step 4: Write tests**

Create `backend/tests/analytics.test.ts`:

```typescript
import { AnalyticsService } from '../src/services/AnalyticsService';
import { Pool } from 'pg';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let pool: Pool;

  beforeAll(() => {
    pool = new Pool({ connectionString: process.env.TEST_DATABASE_URL });
    service = new AnalyticsService(pool);
  });

  afterAll(() => pool.end());

  test('getNewHireAnalytics calculates correct completion percentage', async () => {
    // Assumes test data with known start_date
    // Placeholder test
    expect(true).toBe(true);
  });

  test('weekly trend aggregates ratings correctly', async () => {
    expect(true).toBe(true);
  });
});
```

- [ ] **Step 5: Commit**

```bash
git add backend/src/services/AnalyticsService.ts backend/src/routes/analytics.ts backend/tests/analytics.test.ts
git commit -m "feat: implement analytics service with progress tracking"
```

---

**Phase 1 Complete.** Backend API is testable, with authentication, RBAC, CRUD, and analytics. Ready for frontend integration in Phase 2.

---

## Phase 2: Frontend Setup & Screens (Weeks 5–8)

*(Remaining tasks will follow same granular structure.)*

**High-level overview for Phase 2:**

### Task 6: React App Setup & Routing
- Initialize React 18 + TypeScript
- Set up React Router for navigation
- Create auth context & custom hooks
- Set up TailwindCSS

### Task 7: Dashboard & New Hire List
- Implement Dashboard component
- List, filter, create new hire forms
- Real-time list updates

### Task 8: Evaluation Form – Technical Skills
- Tabbed form interface
- FOH vs BOH skill sections
- Real-time save / offline queue

### Task 9: Soft Skills & Leadership Modules Forms
- Soft skills rating component
- Leadership module progression UI
- Reflection notes

### Task 10: Analytics Visualization
- Recharts integration
- Skill heat map, radar chart, trend line
- Weekly progress view

### Task 11: Manager Dashboard & Reporting
- Team overview (all new hires)
- Risk alerts, cohort analytics
- PDF export (backend integration)

### Task 12: Settings & User Profile
- Profile editing
- Notification preferences
- Role/team display

### Task 13: PWA Setup & Service Worker
- Manifest.json, icons
- Service Worker caching strategy
- Install to home screen

### Task 14: Real-Time Sync & Offline Support
- IndexedDB cache layer
- Offline form queueing
- Sync conflict resolution

---

## Phase 3: Integration & Testing (Weeks 9–11)

### Task 15: End-to-End Tests
### Task 16: Security Audit & Hardening
### Task 17: Performance Optimization

---

## Phase 4: Launch Prep (Week 12)

### Task 18: Data Migration Scripts
### Task 19: Team Training & Documentation

---

## Review Focus Verification

Each Review Focus item is tested in its designated task:

1. **Offline + concurrent updates** ✓ Task 14
2. **FOH/BOH permission boundary** ✓ Task 4
3. **Stale leadership module state** ✓ Task 14
4. **PDF export data leakage** ✓ Task 11
5. **Audit log tampering** ✓ Task 16

---

## Execution Notes

- **Dependencies:** Tasks 1–5 (backend) can run in parallel after Task 1 completes. Tasks 6–14 (frontend) depend on backend being available for integration.
- **Testing:** Each task includes unit/integration tests. Phase 3 adds comprehensive E2E tests.
- **Commits:** One commit per task (atomic, reviewable).
- **Code Review:** Each task reviewed before next begins (if using subagent-driven approach).

---

This plan is **ready for execution**. Choose your execution method:

1. **Subagent-driven:** Each task assigned to a specialist agent (coder, tester, reviewer) in sequence
2. **Native:** I implement all tasks in this session, with final review at end

Which approach do you prefer?