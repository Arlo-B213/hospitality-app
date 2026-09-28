# PRIDE Training App - Deployment Guide

## Pre-Deployment Checklist

Before deploying to production, ensure:

- [ ] All tests pass: `npm test`
- [ ] No security vulnerabilities: `npm audit`
- [ ] Environment variables configured
- [ ] Database migrations tested locally
- [ ] API endpoints tested with Postman/curl
- [ ] SSL/TLS certificate ready
- [ ] Database backup strategy in place
- [ ] Monitoring and logging configured
- [ ] Error handling and alerting set up
- [ ] Documentation up to date

---

## Environment Variables

### Frontend (.env.local or .env.production)

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://api.pride-app.com

# App Metadata
NEXT_PUBLIC_APP_NAME=PRIDE Training App
NEXT_PUBLIC_APP_VERSION=1.0.0

# Feature Flags (optional)
NEXT_PUBLIC_ENABLE_OFFLINE_MODE=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_AUDIT_LOGS=true

# Monitoring (optional)
NEXT_PUBLIC_SENTRY_DSN=https://key@sentry.io/projectid
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Backend (.env or .env.production)

```env
# Server Configuration
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

# Database
DATABASE_URL=postgresql://user:password@host:5432/pride_training_db

# Authentication
JWT_SECRET=your-very-long-secret-key-min-32-chars-generate-randomly
JWT_EXPIRATION=24h
PASSWORD_SALT_ROUNDS=10

# CORS & Origins
CORS_ORIGIN=https://pride-app.com,https://www.pride-app.com
ALLOWED_ORIGINS=pride-app.com

# Logging
LOG_LEVEL=info
NODE_ENV_LOG_FORMAT=json

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=5

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@company.com
SMTP_PASS=app-specific-password

# Security
HELMET_ENABLED=true
HELMET_HSTS_MAX_AGE=31536000
HELMET_CSP_ENABLED=true

# Monitoring
SENTRY_DSN=https://key@sentry.io/projectid
LOG_TO_FILE=true
LOG_FILE_PATH=/var/log/pride-app/server.log
```

### Generate Secure JWT Secret

```bash
# macOS/Linux
openssl rand -base64 32

# Windows (PowerShell)
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(24))

# Or use an online generator (keep it secure!)
```

---

## Database Setup

### PostgreSQL Installation

#### Local Development
```bash
# macOS (using Homebrew)
brew install postgresql@14
brew services start postgresql@14

# Linux (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# Windows
# Download installer from https://www.postgresql.org/download/windows/
```

#### Production Setup (AWS RDS)

1. **Create RDS Instance**
   ```bash
   aws rds create-db-instance \
     --db-instance-identifier pride-training-db \
     --db-instance-class db.t3.micro \
     --engine postgres \
     --engine-version 14.8 \
     --master-username pride_admin \
     --master-user-password [SECURE_PASSWORD] \
     --allocated-storage 100 \
     --storage-type gp3 \
     --publicly-accessible false \
     --backup-retention-period 30
   ```

2. **Security Group Configuration**
   - Allow inbound traffic on port 5432 from backend security group only
   - Restrict to your VPC

3. **Parameter Groups**
   - Set `max_connections` to 100+
   - Set `shared_buffers` to 256MB (for small instances)
   - Enable SSL (optional but recommended)

4. **Automated Backups**
   - Retention period: 30 days
   - Backup window: 2-3 AM UTC
   - Multi-AZ: Yes (for production)

### Initialize Database Schema

```bash
# Using Prisma (recommended)
npx prisma migrate deploy

# Or with raw SQL
psql -U pride_admin -d pride_training_db -f backend/src/db/schema.sql
```

### Seed Initial Data (Optional)

```bash
# Seed test data (admins, test accounts)
npm run seed

# Or manually:
# INSERT INTO users (...) VALUES (...);
```

### Database Migrations

```bash
# Create a new migration
npx prisma migrate dev --name add_new_table

# Review migrations
npx prisma migrate status

# Deploy migrations to production
npx prisma migrate deploy

# Check pending migrations
npx prisma migrate resolve --rolled-back migration_name
```

---

## Frontend Deployment

### Option 1: Vercel (Recommended)

Vercel is the official Next.js platform and offers zero-config deployment.

#### 1. Connect GitHub Repository
1. Go to https://vercel.com/import
2. Select your GitHub repository
3. Vercel auto-detects Next.js configuration

#### 2. Configure Environment Variables
1. Settings → Environment Variables
2. Add variables for production:
   ```
   NEXT_PUBLIC_API_URL=https://api.pride-app.com
   ```

#### 3. Deploy
```bash
# Automatic: Push to GitHub → Vercel builds and deploys
git push origin main

# Manual: Via CLI
npm i -g vercel
vercel --prod
```

#### 4. Configure Custom Domain
1. Settings → Domains
2. Add your domain (pride-app.com)
3. Update DNS records (CNAME or A record)
4. SSL certificate auto-provisioned

#### 5. Analytics & Monitoring
- Web Analytics: Available on Vercel dashboard
- Error tracking: Integrate Sentry
- Performance: Monitor Core Web Vitals

### Option 2: AWS Amplify

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize Amplify
amplify init

# Add hosting
amplify add hosting

# Deploy
amplify publish

# Monitor
# View logs in AWS CloudWatch
```

### Option 3: Docker + AWS ECS

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Build app
COPY . .
ENV NODE_ENV=production
RUN npm run build

# Expose port
EXPOSE 3000

# Start app
CMD ["npm", "start"]
```

```bash
# Build and push image
docker build -t pride-app-frontend:1.0.0 .
docker tag pride-app-frontend:1.0.0 your-registry/pride-app-frontend:1.0.0
docker push your-registry/pride-app-frontend:1.0.0
```

---

## Backend Deployment

### Option 1: Heroku (Simple)

```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create app
heroku create pride-training-app-backend

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:standard-0

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret-key
heroku config:set CORS_ORIGIN=https://pride-app.com

# Deploy
git push heroku main

# View logs
heroku logs --tail

# Run migrations
heroku run npx prisma migrate deploy
```

### Option 2: AWS EC2 + Load Balancer

#### 1. Launch EC2 Instance
```bash
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t3.small \
  --key-name your-key-pair \
  --security-groups pride-app-sg \
  --region us-east-1
```

#### 2. Configure Instance
```bash
# SSH into instance
ssh -i your-key.pem ec2-user@your-instance-ip

# Update system
sudo yum update -y

# Install Node.js
curl -sL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Clone repository
git clone your-repo.git
cd hospitality-app/backend

# Install dependencies
npm install

# Set environment variables
sudo nano .env
# Add DATABASE_URL, JWT_SECRET, etc.

# Start app with PM2
pm2 start npm --name "pride-api" -- start
pm2 startup
pm2 save
```

#### 3. Configure Load Balancer & Auto Scaling
```bash
# Create target group
aws elbv2 create-target-group \
  --name pride-app-backend \
  --protocol HTTP \
  --port 3001 \
  --vpc-id vpc-xxxxx

# Create load balancer
aws elbv2 create-load-balancer \
  --name pride-app-nlb \
  --subnets subnet-xxxxx \
  --type network

# Create auto-scaling group
aws autoscaling create-auto-scaling-group \
  --auto-scaling-group-name pride-app-asg \
  --launch-template LaunchTemplateName=pride-app-template \
  --min-size 1 \
  --max-size 5 \
  --desired-capacity 2
```

### Option 3: Docker + AWS ECS Fargate

```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy app
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Run migrations (optional; can use separate init container)
RUN npx prisma migrate deploy || true

# Expose port
EXPOSE 3001

# Start app
CMD ["node", "dist/server.js"]
```

```bash
# Build and push
docker build -t pride-app-backend:1.0.0 .
docker tag pride-app-backend:1.0.0 your-registry/pride-app-backend:1.0.0
docker push your-registry/pride-app-backend:1.0.0
```

**ECS Task Definition:**
```json
{
  "family": "pride-app-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "pride-api",
      "image": "your-registry/pride-app-backend:1.0.0",
      "portMappings": [
        {
          "containerPort": 3001,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:pride/db-url"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:pride/jwt-secret"
        }
      ]
    }
  ]
}
```

---

## SSL/TLS Certificate

### Using Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot certonly --standalone \
  -d pride-app.com \
  -d api.pride-app.com

# Auto-renew (runs twice daily)
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Verify renewal
sudo certbot renew --dry-run
```

### Nginx Configuration
```nginx
server {
    listen 443 ssl http2;
    server_name pride-app.com;

    ssl_certificate /etc/letsencrypt/live/pride-app.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pride-app.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name pride-app.com;
    return 301 https://$server_name$request_uri;
}
```

---

## Database Backup Strategy

### Automated Backups

#### AWS RDS Backups
- Automated daily snapshots (30-day retention)
- Point-in-time recovery (35 days)
- Multi-AZ for automatic failover

#### Manual PostgreSQL Dumps
```bash
# Full database backup
pg_dump --Fc pride_training_db > backup-$(date +%Y%m%d).dump

# Restore from backup
pg_restore -d pride_training_db backup-20260928.dump

# Backup with compression
pg_dump --Fc --compress=9 pride_training_db | gzip > backup-$(date +%Y%m%d).sql.gz

# Schedule daily backups (cron)
0 2 * * * pg_dump --Fc pride_training_db > /backups/pride-$(date +\%Y\%m\%d).dump
```

### Backup Retention Policy
- **Daily backups:** Keep 7 days locally
- **Weekly backups:** Keep 12 weeks offsite
- **Monthly backups:** Keep 12 months in cold storage (S3 Glacier)
- **RTO (Recovery Time Objective):** 1 hour
- **RPO (Recovery Point Objective):** 1 day

### Disaster Recovery Test
```bash
# Monthly: Restore to test database
createdb pride_training_db_test
pg_restore -d pride_training_db_test /backups/pride-20260928.dump

# Verify data integrity
psql -d pride_training_db_test -c "SELECT COUNT(*) FROM users;"
psql -d pride_training_db_test -c "SELECT COUNT(*) FROM new_hires;"
```

---

## Monitoring & Logging

### Application Monitoring

#### Health Check Endpoint
```bash
# Monitor every 30 seconds
curl -s https://api.pride-app.com/health | jq .

# Setup alerting
* If status != "healthy" for 2+ minutes → alert
* If database is "disconnected" → alert immediately
```

#### Uptime Monitoring (UptimeRobot/Pingdom)
- Monitor backend: https://api.pride-app.com/health
- Monitor frontend: https://pride-app.com
- Alert on: Downtime > 1 minute
- Slack/email integration

### Logging

#### Structured Logging (JSON format)
```typescript
// Example log output
{
  "timestamp": "2026-09-28T12:00:00Z",
  "level": "INFO",
  "message": "New hire evaluation submitted",
  "userId": "user-123",
  "newHireId": "hire-456",
  "rating": 4,
  "duration_ms": 45,
  "path": "/api/evaluations/skills",
  "method": "POST",
  "statusCode": 201,
  "requestId": "req-789"
}
```

#### Centralized Logging (ELK or Datadog)
```bash
# Datadog Agent (collect logs)
DD_LOGS_INJECTION=true npm start

# CloudWatch Logs (AWS)
# Logs automatically sent to /aws/ecs/pride-app

# Splunk Integration
# Configure log forwarding in environment
```

### Error Tracking (Sentry)

```bash
# Install Sentry SDK
npm install @sentry/node @sentry/tracing

# Initialize in backend
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});
```

### Performance Monitoring

```typescript
// Monitor API response times
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
    
    // Alert on slow responses
    if (duration > 1000) {
      console.warn(`SLOW REQUEST: ${req.path} took ${duration}ms`);
    }
  });
  
  next();
});
```

### Dashboards

#### Grafana Dashboard (example queries)
```
- P95 Response Time by Endpoint
- Error Rate by Status Code
- Request Volume by Endpoint
- Database Connection Pool Usage
- Active Users
- New Hires Created (last 24h)
```

---

## Troubleshooting Deployment

### Database Connection Issues

```bash
# Test connection
psql "postgresql://user:password@host:5432/pride_training_db" -c "SELECT NOW();"

# Check connection limits
psql -c "SHOW max_connections;"

# View active connections
psql -c "SELECT * FROM pg_stat_activity;"
```

### High Memory Usage

```bash
# Check Node process memory
ps aux | grep node

# Increase memory limit
NODE_OPTIONS="--max-old-space-size=2048" npm start

# Enable GC logs
NODE_OPTIONS="--trace-gc" npm start
```

### Slow Queries

```bash
# Enable query logging
psql -c "ALTER SYSTEM SET log_min_duration_statement = 1000;"
psql -c "SELECT pg_reload_conf();"

# Analyze slow queries
EXPLAIN ANALYZE SELECT * FROM skill_ratings WHERE created_at > NOW() - INTERVAL '7 days';
```

### SSL Certificate Errors

```bash
# Check certificate expiration
openssl x509 -enddate -noout -in /etc/letsencrypt/live/pride-app.com/fullchain.pem

# Manual renewal
sudo certbot renew --force-renewal

# Check renewal logs
sudo journalctl -u certbot.timer -n 50
```

### Rate Limiting False Positives

```bash
# Adjust rate limits in .env
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=10   # increased from 5

# Restart service
sudo systemctl restart pride-api
```

---

## Post-Deployment Checklist

After deploying to production:

- [ ] Verify health check endpoint responding
- [ ] Login works with production credentials
- [ ] Create test new hire and submit evaluation
- [ ] Verify analytics calculation
- [ ] Check all CSS/images load correctly
- [ ] Test offline mode caching
- [ ] Verify email notifications (if configured)
- [ ] Check audit logs are being recorded
- [ ] Monitor error tracking (Sentry)
- [ ] Review server logs for errors
- [ ] Confirm backups are running
- [ ] Test database failover procedure
- [ ] Verify SSL certificate is valid
- [ ] Performance benchmarks within targets
- [ ] Document deployment details in runbook

---

## Rollback Procedure

If critical issues occur after deployment:

```bash
# Frontend (Vercel)
vercel rollback

# Backend (Heroku)
heroku releases
heroku rollback v123

# Backend (AWS ECS)
# Update ECS service to previous task definition revision
aws ecs update-service \
  --cluster pride-app \
  --service pride-api \
  --task-definition pride-app-backend:5  # Previous version

# Verify rollback
curl https://api.pride-app.com/health
```

---

## Production Runbook

### Daily Tasks
- [ ] Monitor error rates in Sentry
- [ ] Check database size and backup completion
- [ ] Review API response times in monitoring dashboard

### Weekly Tasks
- [ ] Review audit logs for security issues
- [ ] Check SSL certificate expiration (>30 days remaining?)
- [ ] Performance review (P95 latency, error rate trends)

### Monthly Tasks
- [ ] Disaster recovery test (restore backup to test DB)
- [ ] Security audit (outdated dependencies, permissions)
- [ ] Capacity planning (disk space, connection pool usage)
- [ ] User feedback review (support tickets, feature requests)

---

**Last Updated:** September 2026
**Version:** 1.0.0
