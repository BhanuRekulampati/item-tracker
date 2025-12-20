# Step-by-Step Deployment Guide

## Step 1: Set Up Brevo Email Service

### 1.1 Create Brevo Account
1. Go to https://www.brevo.com
2. Click "Sign Up" (top right)
3. Create a free account (300 emails/day on free tier)
4. Verify your email address

### 1.2 Get SMTP Credentials
1. After logging in, click on your profile icon (top right)
2. Go to **Settings** → **SMTP & API**
3. Click on the **SMTP** tab
4. You'll see:
   - **SMTP Server**: `smtp-relay.brevo.com` (save this)
   - **Port**: `587` (save this)
   - **Login**: Your SMTP username (usually your email) - **COPY THIS**
   - **Password**: If you don't have one, click "Generate" - **COPY THIS**

### 1.3 Verify Sender Email
1. In Brevo dashboard, go to **Senders** (left sidebar)
2. Click "Add a sender"
3. Enter the email address you want to send from
4. Verify the email (check your inbox for verification email)
5. **Save this email** - this will be your `EMAIL_FROM` value

**✅ Step 1 Complete when you have:**
- SMTP_USER (your Brevo login)
- SMTP_PASSWORD (your Brevo password)
- EMAIL_FROM (your verified sender email)

---

## Step 2: Prepare Code for GitHub

### 2.1 Check Git Status
Let's verify your code is ready to push.

### 2.2 Push to GitHub
We'll create/update the repository and push the code.

---

## Step 3: Deploy Database on Render

### 3.1 Create Render Account
1. Go to https://render.com
2. Click "Get Started for Free"
3. Sign up with GitHub (recommended) or email

### 3.2 Create PostgreSQL Database
1. In Render dashboard, click **New +** (top right)
2. Select **PostgreSQL**
3. Configure:
   - **Name**: `qr-tracker-db`
   - **Database**: `qrtracker`
   - **User**: `qrtracker`
   - **Region**: Choose closest to you
   - **PostgreSQL Version**: Latest (14 or 15)
   - **Plan**: Starter (Free tier available)
4. Click **Create Database**
5. Wait 1-2 minutes for provisioning

### 3.3 Get Database URL
1. Once database is "Available", click on it
2. Go to **Connections** tab
3. Find **Internal Database URL**
4. **COPY THIS URL** - you'll need it in Step 5

**✅ Step 3 Complete when you have:**
- Database created and running
- Internal Database URL copied

---

## Step 4: Deploy Web Service on Render

### 4.1 Create Web Service
1. In Render dashboard, click **New +**
2. Select **Web Service**
3. Connect GitHub (if not already connected):
   - Click "Connect account"
   - Authorize Render to access your repositories
4. Select your repository from the list

### 4.2 Configure Service
Fill in the following:
- **Name**: `qr-tracker-app`
- **Environment**: `Node`
- **Region**: Same as your database
- **Branch**: `main` (or your default branch)
- **Root Directory**: Leave empty
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Plan**: Starter (Free tier available)

### 4.3 Advanced Settings (Optional)
- **Auto-Deploy**: Yes (deploys on every push)
- **Health Check Path**: Leave empty

Click **Create Web Service** (don't deploy yet - we need to set environment variables first)

**✅ Step 4 Complete when:**
- Web service is created (but not yet deployed)

---

## Step 5: Configure Environment Variables

### 5.1 Add Environment Variables
In your Render web service, go to **Environment** tab and add these:

1. **NODE_ENV**
   - Key: `NODE_ENV`
   - Value: `production`

2. **DATABASE_URL**
   - Key: `DATABASE_URL`
   - Value: Paste the Internal Database URL from Step 3.3

3. **SESSION_SECRET**
   - Key: `SESSION_SECRET`
   - Value: Generate a random string (we'll do this)

4. **SMTP_USER**
   - Key: `SMTP_USER`
   - Value: Your Brevo SMTP username from Step 1.2

5. **SMTP_PASSWORD**
   - Key: `SMTP_PASSWORD`
   - Value: Your Brevo SMTP password from Step 1.2

6. **SMTP_HOST**
   - Key: `SMTP_HOST`
   - Value: `smtp-relay.brevo.com`

7. **SMTP_PORT**
   - Key: `SMTP_PORT`
   - Value: `587`

8. **EMAIL_FROM**
   - Key: `EMAIL_FROM`
   - Value: Your verified sender email from Step 1.3

### 5.2 Generate SESSION_SECRET
We'll generate this for you.

**✅ Step 5 Complete when:**
- All 8 environment variables are set

---

## Step 6: Deploy and Run Migrations

### 6.1 Start Deployment
1. After setting all environment variables, go to **Manual Deploy**
2. Click **Deploy latest commit**
3. Wait for build to complete (3-5 minutes)

### 6.2 Run Database Migrations
1. Once service is "Live", go to **Shell** tab
2. Run: `npm run db:push`
3. Wait for confirmation that tables were created

**✅ Step 6 Complete when:**
- Service is "Live" (green status)
- Database migrations completed

---

## Step 7: Test Deployment

### 7.1 Verify Service
1. Check service URL: `https://qr-tracker-app.onrender.com`
2. Service should be accessible

### 7.2 Test Registration
1. Click "Sign Up" or "Register"
2. Fill in registration form
3. Submit
4. Check your email for OTP code
5. Enter OTP to verify
6. Login and test the app

**✅ Step 7 Complete when:**
- App is accessible
- Registration works
- Email verification works
- You can login and use the app

---

## 🎉 Deployment Complete!

Your app is now live and ready to use!

