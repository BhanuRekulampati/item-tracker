# Deployment Information - Save This!

## 🔑 Generated SESSION_SECRET

Use this for your Render environment variable:

```
SESSION_SECRET=1ZUjmnsQAWJeU2OBfw3rVmOlFJRnCgpJEuJp1gONTLQ=
```

**Copy this value - you'll need it when setting up Render environment variables!**

## 📋 Environment Variables Checklist

When deploying to Render, you'll need these environment variables:

### Required Variables:

1. **NODE_ENV** = `production`

2. **DATABASE_URL** = (Get from Render PostgreSQL database - Internal Database URL)

3. **SESSION_SECRET** = (Generated secret - see below)

4. **SMTP_USER** = (Your Brevo SMTP username)

5. **SMTP_PASSWORD** = (Your Brevo SMTP password)

6. **SMTP_HOST** = `smtp-relay.brevo.com`

7. **SMTP_PORT** = `587`

8. **EMAIL_FROM** = (Your verified Brevo sender email)

## 🚀 Next Steps

### Step 1: Push to GitHub
```bash
# Create a new repository on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### Step 2: Set Up Brevo
1. Go to https://www.brevo.com
2. Sign up for free account
3. Get SMTP credentials: Settings → SMTP & API → SMTP
4. Verify sender email: Senders → Add sender

### Step 3: Deploy on Render
1. Create PostgreSQL database on Render
2. Create Web Service on Render
3. Connect your GitHub repository
4. Set all environment variables
5. Deploy!

## 📝 Quick Reference

- **Render Dashboard**: https://dashboard.render.com
- **Brevo Dashboard**: https://app.brevo.com
- **Deployment Guide**: See `DEPLOYMENT.md` or `STEP_BY_STEP.md`

