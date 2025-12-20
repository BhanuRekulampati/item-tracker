# Environment Variables Reference

Copy these variables to your Render dashboard or `.env` file for local development.

## Required Variables

```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database

# Session Secret (generate with: openssl rand -base64 32)
SESSION_SECRET=your-session-secret-key-here

# Brevo Email Configuration
SMTP_USER=your-brevo-smtp-username
SMTP_PASSWORD=your-brevo-smtp-password
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
EMAIL_FROM=noreply@yourdomain.com

# Node Environment
NODE_ENV=production
```

## How to Get Brevo Credentials

1. Sign up at https://www.brevo.com (free tier: 300 emails/day)
2. Go to **Settings** → **SMTP & API** → **SMTP** tab
3. Copy your SMTP username and password
4. Verify your sender email in **Senders** section

## How to Get Database URL

If using Render PostgreSQL:
- Go to your database service
- Copy the **Internal Database URL** (for services in same region)
- Or **External Database URL** (for external connections)

