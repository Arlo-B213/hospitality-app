# PRIDE Training App - Architecture & Development Guide

## System Overview

PRIDE Training App is a full-stack Progressive Web Application (PWA) built on modern technologies. The system consists of three main layers:

1. **Frontend** — React with Next.js, TypeScript, Tailwind CSS
2. **Backend** — Node.js/Express with PostgreSQL
3. **Data Layer** — PostgreSQL with Prisma ORM

### High-Level Architecture

```
┌─────────────────────────────────────────────────┐
│              Web/Mobile Browser                 │
│  ┌───────────────────────────────────────────┐  │
│  │      React Next.js Frontend                │  │
│  │  (Pages, Components, State Management)    │  │
│  └───────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────┐  │
│  │  Service Worker & IndexedDB               │  │
│  │  (Offline support, caching, sync queue)   │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                      ↕ HTTPS REST API
┌─────────────────────────────────────────────────┐
│          Node.js/Express Backend                │
│  ┌───────────────────────────────────────────┐  │
│  │      API Routes (Express Router)          │  │
│  │  Auth | New Hires | Evaluations | Analytics
│  └───────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────┐  │
│  │      Middleware Layer                     │  │
│  │  Auth (JWT) | RBAC | Rate Limiting       │  │
│  │  Helmet | CORS | Logging                  │  │
│  └───────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────┐  │
│  │      Business Logic Services              │  │
│  │  AuthService | AnalyticsService | AuditService
│  └───────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────┐  │
│  │      Data Repositories                    │  │
│  │  User | NewHire | SkillRating | Evaluation
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                      ↕ PostgreSQL Driver
┌─────────────────────────────────────────────────┐
│          PostgreSQL Database                    │
│  Tables: users, new_hires, skill_ratings,      │
│  leadership_modules, audit_logs, audit_events  │
└─────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | Next.js | 16.3.5 |
| UI Library | React | 19.2.8 |
| Styling | Tailwind CSS | 4.0+ |
| Language | TypeScript | 5.0+ |
| State Management | React Hooks / Context | Built-in |
| HTTP Client | Fetch API | Browser native |
| Storage | IndexedDB + localStorage | Browser native |
| Service Worker | Workbox | PWA support |

### Directory Structure

```
app/
├── api/                          # API routes (Next.js API routes)
│   ├── auth/
│   ├── new-hires/
│   ├── evaluations/
│   └── analytics/
├── assessment/                   # Skills assessment pages
├── dashboard/                    # Manager/admin dashboard
├── evaluation/                   # Evaluation entry forms
├── new-hire/                     # New hire detail view
├── analytics/                    # Analytics dashboard
├── login/                        # Authentication page
├── signup/                       # Self-registration
├── layout.tsx                    # Root layout
├── page.tsx                      # Home page
└── globals.css                   # Global styles

lib/
├── auth.ts                       # JWT token management
├── api.ts                        # API client wrapper
├── db/                           # Database utilities (if using client-side)
└── hooks/                        # Custom React hooks

public/
├── manifest.json                 # PWA manifest
├── service-worker.js             # Service worker
└── icons/                        # PWA app icons
```

### Key Features

#### 1. Authentication & Token Management

**Location:** `app/login` and `lib/auth.ts`

- JWT tokens stored in `localStorage` (token key: `auth_token`)
- Tokens automatically included in all API requests via `Authorization: Bearer <token>` header
- Token expiration: 24 hours
- On logout, token is cleared from storage

**Token Flow:**
```typescript
// Login
POST /api/auth/login → receive JWT token → store in localStorage

// Subsequent requests
GET /api/new-hires 
  Header: Authorization: Bearer <token>

// Logout
Clear localStorage, redirect to login
```

#### 2. State Management

The app uses React Hooks and Context API for state:

```typescript
// Example: User Context
const UserContext = createContext<User | null>(null);

function UserProvider({ children }) {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    // Check token on app load
    const token = localStorage.getItem('auth_token');
    if (token) {
      fetchProfile(token).then(setUser);
    }
  }, []);
  
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

// Usage in components
const user = useContext(UserContext);
```

#### 3. API Client

**Location:** `lib/api.ts`

Centralized HTTP client for all backend communication:

```typescript
const apiClient = {
  // Auth endpoints
  login: (email: string, password: string) => 
    fetch('/api/auth/login', { method: 'POST', body: ... }),
  
  // New hires
  listNewHires: (filters?: any) => 
    fetch('/api/new-hires', { headers: authHeader() }),
  
  // Evaluations
  submitRating: (newHireId: string, rating: any) =>
    fetch('/api/evaluations/skills', { method: 'POST', body: ... }),
  
  // Analytics
  getAnalytics: (newHireId: string) =>
    fetch(`/api/analytics/${newHireId}`, { headers: authHeader() })
};

// Utility: Attach auth token to all requests
function authHeader() {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}
```

#### 4. Offline Support & Sync

**Service Worker:** `public/service-worker.js`

Enables offline-first functionality:

```typescript
// Caching strategy: Cache-first for static assets
// Network-first for API calls

self.addEventListener('fetch', event => {
  if (event.request.url.includes('/api/')) {
    // Network-first for API
    event.respondWith(networkFirst(event.request));
  } else {
    // Cache-first for assets
    event.respondWith(cacheFirst(event.request));
  }
});
```

**IndexedDB Storage:** Stores data locally for offline access

```typescript
// Example: Store new hires data
const db = await openDB('pride-app');
await db.put('new-hires', newHireData, newHireId);

// Retrieve
const hire = await db.get('new-hires', newHireId);
```

**Sync Queue:** Queues offline changes for batch upload

```typescript
// When offline: Queue change
syncQueue.add({
  type: 'rating',
  data: { newHireId, skillName, rating },
  timestamp: Date.now()
});

// When online: Process queue
async function processSyncQueue() {
  for (const item of queue) {
    await api.submitRating(item.data);
    queue.remove(item);
  }
}
```

### Page Components

#### Dashboard (`app/dashboard/page.tsx`)
- Manager/admin overview
- Quick stats and team metrics
- List of active new hires
- New hire creation form

#### New Hire Detail (`app/new-hire/[id]/page.tsx`)
- View/edit new hire information
- Add evaluations (skill ratings)
- Leave notes and feedback
- Leadership module tracking
- Analytics chart (week-by-week trends)

#### Evaluation Form (`app/evaluation/page.tsx`)
- Select skill from dropdown
- Rate on 1-5 scale
- Add optional notes
- Submit and see confirmation

#### Analytics Dashboard (`app/analytics/page.tsx`)
- View cohort performance (managers only)
- Compare individual vs. team average
- Trend charts (skill progression over time)
- Export reports as PDF/CSV

---

## Backend Architecture

### Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Runtime | Node.js | 18.0+ |
| Framework | Express.js | 4.18+ |
| Database | PostgreSQL | 14+ |
| ORM | Prisma | 6.19+ |
| Authentication | jose (JWT) | 6.2+ |
| Security | bcryptjs | 3.0+ |
| Validation | Manual | Custom validators |
| Logging | Console | Native |

### Directory Structure

```
backend/src/
├── server.ts                     # Express app initialization
├── routes/
│   ├── authRoutes.ts             # Auth endpoints
│   ├── newHires.ts               # New hire CRUD
│   ├── evaluations.ts            # Skill ratings & feedback
│   └── analytics.ts              # Analytics & reports
├── services/
│   ├── AuthService.ts            # Auth logic
│   ├── AnalyticsService.ts       # Analytics queries
│   ├── AuditService.ts           # Audit logging
│   └── EvaluationService.ts      # Evaluation logic
├── models/
│   ├── User.ts                   # User repository
│   ├── NewHire.ts                # New hire repository
│   ├── SkillRating.ts            # Rating repository
│   └── LeadershipModule.ts       # Leadership tracking
├── middleware/
│   ├── auth.ts                   # JWT verification
│   └── rbac.ts                   # Role-based access
├── utils/
│   ├── passwordValidator.ts      # Password requirements
│   ├── errors.ts                 # Custom errors
│   └── logger.ts                 # Logging utilities
└── db/
    ├── seed.ts                   # Database seeding
    └── migrations/               # Database migrations
```

### Key Services

#### 1. AuthService

Handles user registration, login, and authentication:

```typescript
class AuthService {
  async register(userData: RegisterInput, ipAddress: string, userAgent: string) {
    // 1. Validate password complexity
    validatePassword(userData.password);
    
    // 2. Check email uniqueness
    const existing = await userRepo.findByEmail(userData.email);
    if (existing) throw new Error('Email already registered');
    
    // 3. Hash password with bcrypt
    const passwordHash = await bcrypt.hash(userData.password, 10);
    
    // 4. Create user
    const user = await userRepo.create({
      ...userData,
      passwordHash,
      role: 'new_hire' // Default role
    });
    
    // 5. Create JWT token
    const token = await createToken(user);
    
    // 6. Audit log
    await auditService.log({
      action: 'USER_REGISTERED',
      userId: user.id,
      ipAddress,
      userAgent
    });
    
    return { token, user };
  }

  async login(email: string, password: string) {
    // 1. Find user
    const user = await userRepo.findByEmail(email);
    if (!user) throw new Error('Invalid credentials');
    
    // 2. Verify password
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new Error('Invalid credentials');
    
    // 3. Create token
    const token = await createToken(user);
    
    return { token, user };
  }
}
```

#### 2. AnalyticsService

Generates analytics and progress metrics:

```typescript
class AnalyticsService {
  async getNewHireAnalytics(newHireId: string) {
    const hire = await newHireRepo.getById(newHireId);
    
    // Calculate progress
    const daysElapsed = calculateDaysElapsed(hire.startDate);
    const completionPercentage = (daysElapsed / 90) * 100;
    
    // Get all ratings
    const ratings = await ratingRepo.getByNewHire(newHireId);
    
    // Calculate averages
    const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
    
    // Get weekly trends
    const weeklyTrends = aggregateByWeek(ratings);
    
    // Get cohort comparison
    const cohortStats = await this.getCohortStats(hire.department);
    const cohortAverage = cohortStats.averageRating;
    
    return {
      daysElapsed,
      completionPercentage,
      skillMetrics: {
        totalRatings: ratings.length,
        averageRating,
        skillTrend: weeklyTrends
      },
      cohortComparison: {
        cohortAverage,
        userAboveAverage: averageRating >= cohortAverage
      }
    };
  }
}
```

#### 3. AuditService

Logs all system activities for compliance:

```typescript
class AuditService {
  async log(event: AuditEvent) {
    // Immutable append-only log
    await auditLogRepository.create({
      timestamp: new Date(),
      userId: event.userId,
      action: event.action,
      resource: event.resource,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      details: event.details
    });
  }
}

// Example log events:
// USER_REGISTERED, USER_LOGIN_SUCCESS, USER_LOGIN_FAILED
// HIRE_CREATED, HIRE_UPDATED, HIRE_DELETED
// RATING_SUBMITTED, RATING_UPDATED
// MODULE_COMPLETED
// USER_ROLE_CHANGED
// PASSWORD_CHANGED, PASSWORD_RESET
```

### Middleware

#### JWT Authentication Middleware

```typescript
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid token' });
  }

  const token = authHeader.substring(7);
  
  try {
    const payload = await jwtVerify(token, SECRET_KEY);
    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      team: payload.team
    };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

#### Role-Based Access Control (RBAC) Middleware

```typescript
export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// Usage:
// router.post('/new-hires', requireAuth, requireRole('manager', 'asst_manager'), handler);
```

#### Rate Limiting Middleware

```typescript
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,                     // 5 requests per window
  message: 'Too many attempts, try again later',
  skip: (req) => !!req.headers.authorization // Don't rate limit authenticated requests
});

// Applied to login/register endpoints
```

---

## Database Schema

### Tables

#### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL, -- new_hire, lead, manager, asst_manager, admin
  team VARCHAR(50),           -- FOH, BOH, or null
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

#### new_hires
```sql
CREATE TABLE new_hires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  department VARCHAR(50) NOT NULL, -- FOH or BOH
  start_date DATE NOT NULL,
  target_completion_date DATE NOT NULL,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_new_hires_department ON new_hires(department);
CREATE INDEX idx_new_hires_is_active ON new_hires(is_active);
CREATE INDEX idx_new_hires_dates ON new_hires(start_date, target_completion_date);
```

#### skill_ratings
```sql
CREATE TABLE skill_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  new_hire_id UUID NOT NULL REFERENCES new_hires(id),
  skill_name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL, -- technical, soft_skill
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  rated_by_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_skill_ratings_hire ON skill_ratings(new_hire_id);
CREATE INDEX idx_skill_ratings_rater ON skill_ratings(rated_by_id);
```

#### leadership_modules
```sql
CREATE TABLE leadership_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  new_hire_id UUID NOT NULL REFERENCES new_hires(id),
  module_id INTEGER NOT NULL, -- 1-5
  module_name VARCHAR(255) NOT NULL,
  completed_at TIMESTAMP,
  completed_by_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_leadership_hire ON leadership_modules(new_hire_id);
```

#### audit_logs
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMP NOT NULL DEFAULT now(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(255) NOT NULL,
  resource VARCHAR(255),
  resource_id VARCHAR(255),
  ip_address VARCHAR(45),
  user_agent TEXT,
  details JSONB,
  created_at TIMESTAMP DEFAULT now()
);

-- Immutable: no UPDATE or DELETE allowed
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
```

### Relationships

```
users (1) ──── (M) new_hires
  ↓
users (1) ──── (M) skill_ratings
  ↓
users (1) ──── (M) leadership_modules
  ↓
audit_logs → References user_id, resource_id
```

---

## Authentication & RBAC

### Role Hierarchy

```
Admin
  ↓ (can create)
Manager ← Assistant Manager
  ↓
Team Lead
  ↓
Staff / New Hire
```

### Permission Matrix

| Action | Admin | Manager | Asst Mgr | Lead | Staff | New Hire |
|--------|-------|---------|----------|------|-------|----------|
| Create User | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Create New Hire | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| View All New Hires | ✓ | ✓ | ✓ | Team | Team | Own |
| Rate Skill | ✓ | ✓ | ✓ | ✓ | Own Team | Own |
| Complete Leadership Module | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| View Cohort Analytics | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| View Audit Logs | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Reset Password | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |

### Team Boundaries

- FOH staff can only evaluate/view FOH new hires
- BOH staff can only evaluate/view BOH new hires
- Managers and admins can view all
- New hires can only see their own profile

---

## Caching Strategy

### Frontend Caching

**Service Worker Cache:**
- Static assets (JS, CSS, images): Cache-first (stale-while-revalidate)
- API responses: Network-first (fall back to cache if offline)
- TTL: Assets cached indefinitely; API responses cached for 5 minutes

**IndexedDB Storage:**
- New hire list: 30 minutes
- Evaluations: 60 minutes
- Analytics: 5 minutes
- User profile: 24 hours

### Backend Caching

**Response Headers:**
```
GET /api/analytics/:id
  Cache-Control: public, max-age=300  # 5 minutes

GET /api/analytics/cohort/summary
  Cache-Control: public, max-age=60   # 1 minute

GET /api/new-hires
  Cache-Control: no-cache             # Always fresh
```

**In-Memory Cache (future optimization):**
- Could add Redis for database query caching
- Cohort statistics (updated hourly)
- User permission lookups (updated on role change)

---

## Offline Sync Strategy

### Sync Queue

When offline, changes are queued in IndexedDB:

```typescript
interface SyncItem {
  id: string;
  type: 'rating' | 'note' | 'module' | 'hire';
  endpoint: string;
  method: 'POST' | 'PUT';
  body: any;
  timestamp: number;
  retries: number;
}
```

### Sync Process

1. **User creates rating offline**
   - Add to sync queue in IndexedDB
   - Update UI immediately (optimistic)
   - Show "Sync pending" badge

2. **Reconnect to internet**
   - Background process detects online status
   - Iterate through queue items
   - Retry failed items up to 3 times
   - On success, remove from queue
   - On failure, keep in queue and notify user

3. **Conflict handling**
   - If new hire is updated by another user while offline
   - Show user: "Server data is newer, do you want to keep your changes?"
   - Options: Keep mine (overwrite), Use server version, Merge manually

---

## Security Features

### Password Security

- **Hashing:** bcryptjs with 10 rounds
- **Requirements:**
  - Minimum 8 characters
  - Must contain uppercase, lowercase, number, special character
  - Cannot reuse last 5 passwords
- **Expiration:** Optional 90-day rotation (configurable)

### JWT Tokens

- **Algorithm:** HS256
- **Expiration:** 24 hours
- **Claims:** userId, email, role, team
- **Signing:** SECRET_KEY stored in environment
- **Refresh:** Re-login to get new token

### Rate Limiting

- **Auth endpoints:** 5 attempts per 15 minutes per IP
- **API endpoints:** 1000 requests per hour per user (future)
- **Response headers:** RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset

### Helmet Security Headers

```typescript
app.use(helmet());

// Sets headers:
// X-Content-Type-Options: nosniff
// X-Frame-Options: DENY
// X-XSS-Protection: 1; mode=block
// Strict-Transport-Security: max-age=31536000
// Content-Security-Policy: default-src 'self'
```

### CORS Configuration

```typescript
cors({
  origin: ['https://pride-app.com', 'https://app.pride-app.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
})
```

### Audit Logging

All sensitive actions logged immutably:
- User authentication (success/failure)
- Role changes
- Password changes
- Data modifications
- Admin actions
- Each log includes: timestamp, user, action, IP, user agent

---

## Performance Optimizations

### Frontend

1. **Code Splitting** — Route-based splitting with Next.js
2. **Image Optimization** — next/image for lazy loading
3. **Caching** — Service worker caching, IndexedDB
4. **Memoization** — React.memo for expensive components
5. **Lazy Loading** — Charts and heavy components load on demand

### Backend

1. **Connection Pooling** — PostgreSQL connection pool (20 connections)
2. **Query Optimization** — Proper indexing, selective field queries
3. **Caching** — Response header caching
4. **Rate Limiting** — Prevent abuse and excessive load
5. **Pagination** — Future: cursor-based pagination for large datasets

### Database

1. **Indexes** — On frequently queried fields (email, role, department, dates)
2. **Composite Indexes** — For multi-column queries
3. **Query Planning** — Regular EXPLAIN ANALYZE reviews
4. **Connection Limits** — Prevent pool exhaustion

---

## Deployment Architecture

### Frontend (Vercel)

```
Git Push → GitHub Webhook → Vercel Build
  ↓
  npm install
  npm run build (Next.js production build)
  npm run test:e2e (Playwright tests)
  ↓
Deploy to Vercel CDN (if tests pass)
  ↓
https://pride-app.com (production)
https://staging-pride-app.com (staging)
```

### Backend (Cloud Provider)

```
Git Push → CI/CD Pipeline (GitHub Actions)
  ↓
  npm install
  npm run lint
  npm test
  npm run build
  ↓
Docker Image Build (if tests pass)
  ↓
Push to container registry
  ↓
Deploy to cloud (AWS ECS, Heroku, Railway, etc.)
  ↓
Environment variables injected
Database migrations run
Server starts on PORT=3001
```

### Database (AWS RDS / Cloud Provider)

```
PostgreSQL Instance
  ↓
Automated daily backups
  ↓
Read replicas for high availability (future)
  ↓
Connection from backend via pooling
```

---

## Monitoring & Observability

### Logging

**Backend Logs:**
```
2026-09-28T12:00:00Z INFO GET /api/new-hires (200 OK, 45ms)
2026-09-28T12:00:05Z INFO POST /api/evaluations/skills (201 Created)
2026-09-28T12:00:10Z ERROR Database query failed: timeout after 5000ms
```

**Structured JSON Logging (future):**
```json
{
  "timestamp": "2026-09-28T12:00:00Z",
  "level": "INFO",
  "message": "New hire rating submitted",
  "userId": "user-123",
  "newHireId": "hire-456",
  "rating": 4,
  "duration_ms": 45
}
```

### Health Checks

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "uptime": 3600,
  "timestamp": "2026-09-28T12:00:00Z"
}
```

### Monitoring Metrics (future)

- Response times (API endpoints)
- Error rates (4xx, 5xx)
- Database query performance
- Service availability (99.9% uptime)
- Active users / concurrent sessions

---

## Technology Decisions

### Why Next.js?

- Built-in Server-Side Rendering (SSR) for better SEO
- API routes for backend (could run on same server)
- Automatic code splitting and optimization
- Vercel deployment with CI/CD built-in
- File-based routing (easier to understand)

### Why PostgreSQL?

- ACID compliance (data integrity)
- Rich data types (JSONB for audit logs)
- Strong security and authentication
- Mature ecosystem (Prisma ORM)
- Easily scales vertically and horizontally

### Why Express.js?

- Lightweight and minimal (full control)
- Large middleware ecosystem
- Excellent routing capabilities
- Easy to understand and debug
- Perfect for REST APIs

### Why Prisma ORM?

- Type-safe database client
- Auto-migrations
- Visual schema editor
- Better than raw SQL for maintainability
- Supports PostgreSQL, MySQL, SQLite, MongoDB

### Why JWT Tokens?

- Stateless authentication (no session storage)
- Perfect for APIs and distributed systems
- Works well with PWA offline mode
- Standard industry practice
- Easy to debug and test

---

## Future Enhancements

1. **WebSocket Real-Time Updates** — Live evaluation notifications
2. **Redis Caching** — Distributed cache for analytics
3. **Database Read Replicas** — High availability
4. **Advanced Analytics** — Machine learning predictions
5. **Mobile App** — Native iOS/Android versions
6. **API Versioning** — Support multiple API versions
7. **GraphQL** — Alternative to REST API
8. **SAML/OAuth** — Single sign-on integration
9. **Audit Trail UI** — View full history in app
10. **Webhook Integrations** — Post to Slack, Teams, etc.

---

## Resources

- **Next.js Documentation:** https://nextjs.org/docs
- **Express.js Guide:** https://expressjs.com/
- **Prisma ORM:** https://www.prisma.io/
- **PostgreSQL:** https://www.postgresql.org/docs/
- **PWA Guide:** https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps
- **JWT Handbook:** https://tools.ietf.org/html/rfc7519

---

**Last Updated:** September 2026
**Version:** 1.0.0
