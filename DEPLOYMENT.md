# Deployment Guide: QR Tracker to Render with Brevo Email

This guide will walk you through deploying your QR Tracker application to Render and configuring Brevo (formerly Sendinblue) for email verification.

## Prerequisites

1. A GitHub account (to host your code)
2. A Render account (sign up at https://render.com)
3. A Brevo account (sign up at https://www.brevo.com) - Free tier available

## Step 1: Set Up Brevo Email Service

1. **Sign up for Brevo**
   - Go to https://www.brevo.com
   - Create a free account (300 emails/day on free tier)

2. **Get SMTP Credentials**
   - Log in to your Brevo dashboard
   - Go to **Settings** → **SMTP & API**
   - Click on **SMTP** tab
   - You'll see:
     - **SMTP Server**: `smtp-relay.brevo.com`
     - **Port**: `587`
     - **Login**: Your SMTP username (usually your email)
     - **Password**: Your SMTP password (click "Generate" if you don't have one)

3. **Verify Your Sender Email**
   - Go to **Senders** in Brevo dashboard
   - Add and verify the email address you want to send from
   - This will be your `EMAIL_FROM` value

## Step 2: Prepare Your Code for Deployment

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/your-repo-name.git
   git push -u origin main
   ```

2. **Verify your build works locally**
   ```bash
   npm run build
   ```

## Step 3: Deploy Database on Render

1. **Create a PostgreSQL Database**
   - Log in to Render dashboard
   - Click **New +** → **PostgreSQL**
   - Name it: `qr-tracker-db`
   - Select **Starter** plan (free tier available)
   - Click **Create Database**
   - Wait for it to provision (takes 1-2 minutes)

2. **Copy Database URL**
   - Once created, click on your database
   - Find the **Internal Database URL** or **External Database URL**
   - Copy this URL (you'll need it in the next step)

## Step 4: Deploy Web Service on Render

### Option A: Using render.yaml (Recommended)

1. **Connect GitHub Repository**
   - In Render dashboard, click **New +** → **Blueprint**
   - Connect your GitHub account
   - Select your repository
   - Render will automatically detect `render.yaml`

2. **Configure Environment Variables**
   - Render will prompt you to set environment variables
   - Set the following:
     - `DATABASE_URL`: Paste the database URL from Step 3
     - `SMTP_USER`: Your Brevo SMTP username
     - `SMTP_PASSWORD`: Your Brevo SMTP password
     - `EMAIL_FROM`: Your verified sender email from Brevo
     - `SESSION_SECRET`: Render will auto-generate this (or generate one: `openssl rand -base64 32`)

3. **Deploy**
   - Click **Apply** to start deployment
   - Render will build and deploy your app

### Option B: Manual Setup

1. **Create Web Service**
   - Click **New +** → **Web Service**
   - Connect your GitHub repository
   - Configure:
     - **Name**: `qr-tracker-app`
     - **Environment**: `Node`
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`
     - **Plan**: Starter (free tier)

2. **Set Environment Variables**
   - Scroll to **Environment Variables** section
   - Add each variable:
     ```
     NODE_ENV=production
     DATABASE_URL=<your-database-url>
     SESSION_SECRET=<generate-random-string>
     SMTP_USER=<your-brevo-username>
     SMTP_PASSWORD=<your-brevo-password>
     SMTP_HOST=smtp-relay.brevo.com
     SMTP_PORT=587
     EMAIL_FROM=<your-verified-email>
     ```

3. **Deploy**
   - Click **Create Web Service**
   - Render will start building and deploying

## Step 5: Run Database Migrations

1. **Get Shell Access**
   - In your Render web service, go to **Shell** tab
   - Or use Render CLI: `render shell`

2. **Run Migration**
   ```bash
   npm run db:push
   ```
   This will create all necessary tables in your database.

## Step 6: Verify Deployment

1. **Check Service Status**
   - Your service URL will be: `https://qr-tracker-app.onrender.com` (or your custom domain)
   - Wait for the service to be "Live" (green status)

2. **Test Email Verification**
   - Visit your deployed app
   - Register a new account
   - Check your email for the OTP code
   - Verify the code works

## Step 7: Configure Custom Domain (Optional)

1. **Add Custom Domain**
   - In your web service settings, go to **Custom Domains**
   - Add your domain
   - Follow DNS configuration instructions

2. **Update Email From Address**
   - Update `EMAIL_FROM` to match your domain
   - Verify the sender in Brevo dashboard

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `SESSION_SECRET` | Secret for session encryption | Random 32+ character string |
| `SMTP_USER` | Brevo SMTP username | `your-email@example.com` |
| `SMTP_PASSWORD` | Brevo SMTP password | `your-smtp-password` |
| `SMTP_HOST` | Brevo SMTP server | `smtp-relay.brevo.com` |
| `SMTP_PORT` | SMTP port | `587` |
| `EMAIL_FROM` | Verified sender email | `noreply@yourdomain.com` |
| `NODE_ENV` | Environment mode | `production` |

## Troubleshooting

### Email Not Sending

1. **Check Brevo Dashboard**
   - Verify your SMTP credentials are correct
   - Check if you've hit the daily email limit (300 on free tier)
   - Ensure sender email is verified

2. **Check Render Logs**
   - Go to your service → **Logs** tab
   - Look for email-related errors

3. **Verify Environment Variables**
   - Double-check all SMTP variables are set correctly
   - Ensure no extra spaces or quotes

### Database Connection Issues

1. **Verify DATABASE_URL**
   - Use the Internal Database URL for services in the same region
   - Use External Database URL if connecting from outside Render

2. **Check Database Status**
   - Ensure database is running
   - Verify database credentials

### Build Failures

1. **Check Build Logs**
   - Review the build output in Render dashboard
   - Ensure all dependencies are in `package.json`

2. **Local Testing**
   - Run `npm run build` locally to catch errors early

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [Brevo SMTP Documentation](https://developers.brevo.com/docs/send-emails-with-smtp-relay)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)

## Support

If you encounter issues:
1. Check Render service logs
2. Check Brevo dashboard for email delivery status
3. Verify all environment variables are set correctly
4. Test email sending with a simple script before deploying

