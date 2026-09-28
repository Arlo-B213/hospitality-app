# PRIDE Training App - Production Deployment Guide

This guide provides step-by-step instructions for deploying the PRIDE Training App to production using Vercel (frontend) and Railway (backend + database).

## Table of Contents
1. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
2. [Backend Deployment (Railway)](#backend-deployment-railway)
3. [Environment Variables](#environment-variables)
4. [Admin Branding Panel](#admin-branding-panel)
5. [Post-Deployment Verification](#post-deployment-verification)
6. [Updating the Application](#updating-the-application)
7. [Troubleshooting](#troubleshooting)

---

## Frontend Deployment (Vercel)

### Prerequisites
- GitHub account with this repository
- Vercel account (sign up at https://vercel.com)

### Step 1: Connect GitHub Repository to Vercel

1. Go to https://vercel.com/dashboard
2. Click **"New Project"**
3. Click **"Import Git Repository"**
4. Search for and select your GitHub repository (`hospitality-app`)
5. Click **"Import"**

### Step 2: Configure Project Settings

1. **Project Name**: Leave as default or name it `pride-app`
2. **Framework Preset**: Select **"Next.js"**
3. **Root Directory**: Leave blank (or select `.` if required)
4. **Build Command**: Keep default or use `npm run build`
5. **Output Directory**: Keep as `.next`
6. **Install Command**: Keep as `npm install` or `npm ci`

### Step 3: Set Environment Variables

1. Scroll to **"Environment Variables"** section
2. Add the following environment variables:
   ```
   DATABASE_URL: (from Railway - see Backend Deployment section)
   JWT_SECRET: (generate a secure random string - see step 4)
   SEED_SECRET: (generate a secure random string - see step 4)
   NODE_ENV: production
   ```

### Step 4: Generate Secure Secrets

Generate secure random strings for JWT_SECRET and SEED_SECRET:

**Option A: Using OpenSSL (Linux/Mac/Windows with Git Bash)**
```bash
openssl rand -hex 32
```
Output example: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

**Option B: Using Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Option C: Using Python**
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

Copy the output and paste into Vercel's environment variables field.

### Step 5: Deploy

1. Click **"Deploy"**
2. Wait for build to complete (typically 2-5 minutes)
3. Once complete, Vercel provides your live URL: `https://pride-app.vercel.app`

### Enable Auto-Deploys

To automatically deploy on GitHub pushes:
1. Go to your Vercel project dashboard
2. Settings → Git
3. Ensure **"Deploy on push to main/master"** is enabled
4. Future commits to `master` branch will auto-deploy

---

## Backend Deployment (Railway)

### Prerequisites
- Railway account (sign up at https://railway.app)
- GitHub account with repository access

### Step 1: Create Railway Project

1. Go to https://railway.app/dashboard
2. Click **"New Project"**
3. Select **"Deploy from GitHub"**
4. Connect your GitHub account (if not already connected)
5. Select the `hospitality-app` repository
6. Click **"Deploy"**

### Step 2: Add PostgreSQL Database

1. In your Railway project, click **"+ New"**
2. Search for **"PostgreSQL"**
3. Click **"PostgreSQL"** to add it
4. Railway will automatically provision a PostgreSQL database

### Step 3: Configure Environment Variables

In Railway dashboard, for your Node.js service:

1. Click on your app service
2. Go to **"Variables"** tab
3. Add the following:
   ```
   NODE_ENV=production
   DATABASE_URL=(automatically linked from PostgreSQL service)
   JWT_SECRET=(same value used in Vercel)
   SEED_SECRET=(same value used in Vercel)
   PORT=3000
   ```

**Note**: Railway automatically provides `DATABASE_URL` when PostgreSQL is linked. Verify it's present.

### Step 4: Connect PostgreSQL to Node.js

1. Click on PostgreSQL service
2. Go to **"Variables"** tab
3. Copy the full connection string (DATABASE_URL format: `postgresql://user:pass@host:port/database`)
4. In Node.js service, ensure DATABASE_URL is set to this connection string
5. Link services (Railway typically auto-links with same protocol)

### Step 5: Deploy

1. Railway automatically detects `package.json` as Node.js project
2. Build will start automatically
3. Once complete, Railway provides your service URL

### Step 6: Run Database Migrations

After first deployment, initialize the database:

1. Click on your Node.js service in Railway
2. Go to **"Deployments"** tab
3. Click the running deployment
4. Click **"Logs"** to view output
5. Run database initialization via API:
   ```bash
   curl -X POST https://your-railway-app.up.railway.app/api/seed \
     -H "X-Seed-Secret: your-seed-secret"
   ```

---

## Environment Variables

### Summary of All Required Variables

| Variable | Source | Example |
|----------|--------|---------|
| `DATABASE_URL` | Railway PostgreSQL | `postgresql://user:pass@host:5432/railway` |
| `JWT_SECRET` | Generated random (32 bytes hex) | `a1b2c3d4e5f6...` |
| `SEED_SECRET` | Generated random (32 bytes hex) | `x9y8z7w6v5u4...` |
| `NODE_ENV` | Set explicitly | `production` |

### Setting Variables in Vercel

1. Vercel Dashboard → Your Project → Settings
2. Environment Variables
3. Add each variable
4. Redeploy if already deployed

### Setting Variables in Railway

1. Railway Dashboard → Your Project → Service
2. Variables tab
3. Add each variable
4. Auto-redeploy on save

---

## Admin Branding Panel

The admin branding panel allows managers to customize the application's appearance.

### Access Branding Panel

1. Log in as a manager account
2. Navigate to `/branding`
3. Full URL: `https://your-deployed-app.vercel.app/branding`

### Customizable Settings

- **Application Name**: Main title displayed throughout app
- **Primary Color**: Main brand color (hex format, e.g., `#3b82f6`)
- **Secondary Color**: Background/secondary elements
- **Accent Color**: Highlights and call-to-action buttons
- **Logo URL**: Link to your company logo image
- **Default Theme**: Light or dark mode
- **Font Family**: Choice of font styles

### Making Changes

1. Open `/branding` page (manager only)
2. Modify any color using:
   - Color picker (left side)
   - Hex code input (right side)
3. Update other fields as needed
4. Click **"Save Changes"**
5. Changes apply immediately and persist to database
6. Page reloads automatically to show updates

### Reverting Changes

1. Click **"Reset"** button to revert to last saved configuration
2. Click **"Save Changes"** to confirm

---

## Post-Deployment Verification

### Checklist

- [ ] Vercel deployment successful (check dashboard)
- [ ] Railway deployment successful (check logs)
- [ ] Database migrations completed
- [ ] Frontend loads at `https://your-app.vercel.app`
- [ ] Login page accessible
- [ ] Can log in with test credentials
- [ ] Navigation menu loads
- [ ] API calls return data
- [ ] Branding panel loads at `/branding`
- [ ] Can modify branding as manager
- [ ] Changes persist after page reload

### Test Credentials

After running the seed API call, these test accounts are available:

```
Email: lead@example.com
Password: password123
Role: Shift Lead

Email: staff@example.com
Password: password123
Role: Staff

Email: manager@example.com
Password: password123
Role: Manager (can access /branding)
```

### Verify Frontend

```bash
curl https://your-app.vercel.app
# Should return HTML with meta tags
```

### Verify Backend/API

```bash
curl https://your-railway-app.up.railway.app/api/branding/config
# Should return JSON branding configuration
```

---

## Updating the Application

### Deploy Code Changes

#### Option 1: Automatic (Recommended)
1. Commit changes to `master` branch
2. Push to GitHub
3. Vercel automatically redeploys frontend
4. Railway automatically redeploys backend

#### Option 2: Manual
**For Vercel:**
1. Go to Vercel dashboard
2. Click your project
3. Click **"Redeploy"** button
4. Select the commit to deploy

**For Railway:**
1. Go to Railway dashboard
2. Click your service
3. Click **"Trigger deploy"** button

### Database Schema Changes

If you modify Prisma schema:

1. Update `prisma/schema.prisma`
2. Run locally: `npx prisma migrate dev --name your_change_name`
3. Commit migration files
4. On Railway, migrations run automatically on deploy
5. Verify with: `curl https://your-railway-app.up.railway.app/api/branding/config`

### Environment Variable Updates

1. **In Vercel**: Settings → Environment Variables → Update → Redeploy
2. **In Railway**: Variables tab → Update → Auto-redeploys

---

## Troubleshooting

### Frontend Issues

**Build Fails**
- Check Vercel logs: Dashboard → Your Project → Deployments
- Ensure `npm run build` succeeds locally
- Verify all dependencies are in `package.json`

**Page Blank/404**
- Verify Vercel deployment is running
- Check browser console for errors
- Clear cache (Ctrl+Shift+Delete)

**Environment Variables Not Loading**
- Verify variables are set in Vercel dashboard
- Trigger a redeployment after adding variables
- Check `.env.local` is NOT committed to git

### Backend Issues

**Database Connection Error**
- Verify `DATABASE_URL` is set in Railway
- Ensure PostgreSQL service is running (check Railway dashboard)
- Test connection: `psql $DATABASE_URL` (from local environment)

**API 500 Errors**
- Check Railway logs: Service → Logs tab
- Verify all environment variables are set
- Check database migrations ran: `SELECT version();`

**Authentication Fails**
- Verify `JWT_SECRET` is set and consistent across Vercel/Railway
- Check browser cookies are being sent
- Clear cookies and re-login

### Branding Panel Issues

**Cannot Access /branding**
- Verify logged in as manager (role: MANAGER)
- Check browser console for redirect
- Ensure DATABASE_URL is working

**Changes Don't Save**
- Check browser console for errors
- Verify POST to `/api/branding/config` succeeds
- Check database connection
- Reload page after saving

---

## Monitoring & Maintenance

### Regular Checks

1. **Weekly**: Review Vercel and Railway dashboards for errors
2. **Monthly**: Check database storage usage (Railway dashboard)
3. **After changes**: Test full user workflows end-to-end

### Logs

- **Vercel Logs**: Dashboard → Your Project → Deployments → View Details
- **Railway Logs**: Project → Service → Logs
- **Database Logs**: Railway → PostgreSQL → Logs

### Backups

Railway automatically backs up PostgreSQL. To export:

1. Railway dashboard → PostgreSQL service
2. Click **"Connect"** → Choose connection method
3. Use `pg_dump` to export:
   ```bash
   pg_dump $DATABASE_URL > backup.sql
   ```

### Rollback

**To rollback to previous version:**

1. Vercel: Dashboard → Deployments → Click previous deployment → Click "Redeploy"
2. Railway: Deployments → Click previous → "Redeploy"

---

## Scaling & Performance

### Vercel
- Auto-scales with traffic
- Monitor usage: Settings → Usage
- Optimize: Enable ISR, implement caching

### Railway
- Monitor: Service → Metrics
- Scale vertically: Settings → Environment → Change plan
- Scale database: PostgreSQL → Settings → Adjust resources

---

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **GitHub Issues**: Check repository issues/discussions

---

## Summary

Your PRIDE Training App is now deployed to production with:

- **Frontend**: Vercel (https://pride-app.vercel.app)
- **Backend/Database**: Railway (https://your-app.up.railway.app)
- **Admin Panel**: Accessible at `/branding` for managers
- **Auto-deployment**: Enabled on git push
- **SSL/HTTPS**: Automatic for both services
- **Database**: PostgreSQL with automatic backups

Next steps:
1. Test all features in production
2. Share live URL with users
3. Configure custom domain (optional)
4. Set up monitoring alerts (optional)

Happy deploying!
