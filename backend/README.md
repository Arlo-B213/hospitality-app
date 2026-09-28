# PRIDE Training App - Backend API

Backend service for the PRIDE Training App, a mobile-first application for tracking new hire 90-day onboarding evaluations.

## Prerequisites

- Node.js 18+ (LTS)
- npm 9+
- Docker & Docker Compose
- PostgreSQL 14+ (via Docker)

## Project Structure

```
backend/
├── src/
│   ├── db/
│   │   └── schema.sql       # PostgreSQL schema and migrations
│   ├── middleware/          # Express middleware
│   ├── routes/              # API route handlers
│   ├── services/            # Business logic services
│   └── server.ts            # Express app entry point
├── tests/                   # Test suites
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── jest.config.js           # Jest testing configuration
├── docker-compose.yml       # Local PostgreSQL setup
└── .env.example             # Environment variables template
```

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

### 3. Start PostgreSQL

```bash
docker-compose up -d
```

Wait for database to be healthy:

```bash
docker-compose ps
```

### 4. Verify Schema

The schema is automatically loaded on first PostgreSQL startup. To manually verify:

```bash
docker-compose exec postgres psql -U pride_user -d pride_training_db -c "\dt"
```

## Development

### Start Development Server

```bash
npm run dev
```

Server will run on `http://localhost:3001`

### Test Schema Loading

```bash
npm test
```

### Build Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

## API Endpoints

### Health Check

```http
GET /health
```

Returns database connection status and server uptime.

## Database

### Schema Overview

- **users**: System users with roles and permissions
- **new_hires**: New hire onboarding records
- **technical_skills**: FOH and BOH specific skills
- **soft_skills**: 10 shared soft skills
- **leadership_modules**: 8 leadership development modules
- **skill_assessments**: Technical and soft skill assessments
- **leadership_progress**: Leadership module progress tracking
- **evaluation_summaries**: 30/60/90-day evaluation summaries
- **audit_logs**: Comprehensive audit trail

### User Roles

- `admin`: Full system access
- `manager`: Department oversight
- `asst_manager`: Assistant manager duties
- `foh_lead`: Front-of-house lead
- `chef`: Kitchen chef
- `sous_chef`: Sous chef
- `asst_chef`: Assistant chef
- `new_hire`: New employee under evaluation

### Departments

- `FOH`: Front of House
- `BOH`: Back of House

## Security

- All passwords hashed with bcryptjs (minimum 12 rounds)
- All database queries parameterized (no SQL injection)
- JWT-based authentication
- CORS protection
- Helmet security headers
- Audit logging for all data modifications

## Testing

### Run Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Coverage Threshold

Minimum 80% code coverage required.

## Environment Variables

See `.env.example` for complete list. Key variables:

- `DATABASE_URL`: PostgreSQL connection string
- `PORT`: Server port (default: 3001)
- `JWT_SECRET`: JWT signing secret
- `BCRYPT_ROUNDS`: Password hash rounds (minimum: 12)
- `NODE_ENV`: Environment (development, production, test)

## Docker Commands

### Start Services

```bash
docker-compose up -d
```

### Stop Services

```bash
docker-compose down
```

### View Logs

```bash
docker-compose logs -f postgres
```

### Connect to Database

```bash
docker-compose exec postgres psql -U pride_user -d pride_training_db
```

## Troubleshooting

### Database Connection Failed

1. Verify PostgreSQL is running: `docker-compose ps`
2. Check DATABASE_URL in `.env`
3. Verify credentials in docker-compose.yml
4. Check network: `docker network ls`

### Port Already in Use

Change `PORT` in `.env` or stop conflicting service:

```bash
lsof -i :3001
kill -9 <PID>
```

### Schema Not Loaded

Check PostgreSQL logs:

```bash
docker-compose logs postgres
```

## Performance Indexes

The schema includes strategic indexes on:
- user email, role, active status
- new hire user ID, manager, department, active status
- assessment dates and evaluator
- evaluation status and types
- audit log table name, user, and timestamp

## Compliance

- Data encryption at rest: AES-256
- Audit logging: All modifications tracked
- Parameterized queries: SQL injection prevention
- Password hashing: bcryptjs with 12+ rounds
- Session management: JWT tokens with expiration

## License

PROPRIETARY
