# Deployment Checklist - Quick Start Guide

## ✅ Pre-Deployment Checklist

- [x] Build tested locally (`npm run build` works)
- [x] Static file path fixed for production
- [x] Port configuration updated for Render
- [x] `render.yaml` created
- [x] Environment variables documented

## 🚀 Deployment Steps

### Step 1: Set Up Brevo Email (5 minutes)

1. Go to https://www.brevo.com and sign up (free account)
2. Navigate to **Settings** → **SMTP & API** → **SMTP** tab
3. Copy these values:
   - **SMTP Server**: `smtp-relay.brevo.com`
   - **Port**: `587`
   - **Login**: Your SMTP username
   - **Password**: Generate or copy your SMTP password
4. Go to **Senders** and verify your email address
   - This will be your `EMAIL_FROM` value

### Step 2: Push Code to GitHub

```bash
# If not already a git repo
git init
git add .
git commit -m "Ready for deployment"

# If you have a remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### Step 3: Deploy Database on Render

1. Go to https://dashboard.render.com
2. Click **New +** → **PostgreSQL**
3. Configure:
   - **Name**: `qr-tracker-db`
   - **Database**: `qrtracker`
   - **User**: `qrtracker`
   - **Plan**: Starter (free tier available)
4. Click **Create Database**
5. Wait 1-2 minutes for provisioning
6. **Copy the Internal Database URL** (you'll need this)

### Step 4: Deploy Web Service on Render

#### Option A: Using Blueprint (render.yaml) - Recommended

1. In Render dashboard, click **New +** → **Blueprint**
2. Connect your GitHub account (if not already connected)
3. Select your repository
4. Render will detect `render.yaml` automatically
5. Click **Apply**

#### Option B: Manual Setup

1. Click **New +** → **Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `qr-tracker-app`
   - **Environment**: `Node`
   - **Region**: Choose closest to you
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: Leave empty (root)
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Starter

### Step 5: Set Environment Variables

In your Render web service, go to **Environment** tab and add:

```
NODE_ENV=production
DATABASE_URL=<paste-internal-database-url-from-step-3>
SESSION_SECRET=<generate-random-string-or-use-render-auto-generate>
SMTP_USER=<your-brevo-smtp-username>
SMTP_PASSWORD=<your-brevo-smtp-password>
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
EMAIL_FROM=<your-verified-brevo-email>
```

**To generate SESSION_SECRET:**
- Use Render's auto-generate feature, OR
- Run locally: `openssl rand -base64 32`

### Step 6: Run Database Migrations

After your service is deployed:

1. Go to your web service → **Shell** tab
2. Run: `npm run db:push`
3. Wait for confirmation that tables were created

### Step 7: Verify Deployment

1. Check service status (should be "Live")
2. Visit your app URL: `https://qr-tracker-app.onrender.com`
3. Test registration:
   - Create a new account
   - Check email for OTP code
   - Verify email and login

## 🔍 Troubleshooting

### Build Fails
- Check **Logs** tab in Render
- Verify all dependencies are in `package.json`
- Ensure Node version is compatible (Render uses Node 18+ by default)

### Database Connection Error
- Verify `DATABASE_URL` is correct
- Use **Internal Database URL** (not external) for services in same region
- Check database is running

### Email Not Sending
- Verify Brevo credentials are correct
- Check Brevo dashboard for email delivery status
- Ensure sender email is verified in Brevo
- Check Render logs for email errors

### 404 Errors on Routes
- Verify build completed successfully
- Check that `dist/public` directory exists
- Ensure static file serving is working

## 📝 Quick Commands Reference

```bash
# Local build test
npm run build

# Local production test
npm start

# Database migration
npm run db:push

# Check build output
ls -la dist/public
```

## 🎉 You're Done!

Once deployed, your app will be live at:
`https://qr-tracker-app.onrender.com`

Remember to:
- Monitor Render logs for any issues
- Check Brevo dashboard for email delivery
- Set up a custom domain (optional) in Render settings

