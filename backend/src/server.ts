import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { Pool, PoolClient } from 'pg';
import { createAuthRoutes } from './routes/authRoutes';
import { createNewHiresRouter } from './routes/newHires';
import { createEvaluationsRouter } from './routes/evaluations';
import { createAnalyticsRouter } from './routes/analytics';

// Load environment variables
dotenv.config();

// Initialize Express app
const app: Express = express();
const port = process.env.PORT || 3001;

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://pride_user:pride_password@localhost:5432/pride_training_db',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Pool error handler
pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle client', err);
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(','),
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction): void => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Auth routes
const authRoutes = createAuthRoutes(pool);
app.use('/api/auth', authRoutes);

// New Hires routes
const newHiresRouter = createNewHiresRouter(pool);
app.use('/api/new-hires', newHiresRouter);

// Evaluations routes
const evaluationsRouter = createEvaluationsRouter(pool);
app.use('/api/evaluations', evaluationsRouter);

// Analytics routes
const analyticsRouter = createAnalyticsRouter(pool);
app.use('/api/analytics', analyticsRouter);

// Health check endpoint
app.get('/health', async (_req: Request, res: Response): Promise<void> => {
  try {
    // Test database connection
    const client: PoolClient = await pool.connect();
    try {
      await client.query('SELECT NOW()');
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'connected',
        uptime: process.uptime(),
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// 404 handler
app.use((req: Request, res: Response): void => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString(),
  });
});

// Error handler middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred',
    timestamp: new Date().toISOString(),
  });
});

// Graceful shutdown
const server = app.listen(port, () => {
  console.log(`PRIDE Training App Backend listening on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(async () => {
    console.log('HTTP server closed');
    await pool.end();
    console.log('Database pool closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(async () => {
    console.log('HTTP server closed');
    await pool.end();
    console.log('Database pool closed');
    process.exit(0);
  });
});

export { app, pool };
