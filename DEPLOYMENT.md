# TSH ERP - Week 1 Deployment Guide 🔐
## Campaign Gate Only - Get Running in 30 Minutes

---

## STEP 1: Setup Database (Supabase - 5 minutes)

### 1.1 Create Supabase Account
1. Go to https://supabase.com
2. Sign up with email (free tier)
3. Create new project
   - Name: `tsh-erp`
   - Database Password: (save this somewhere safe)
   - Region: Choose closest to Zambia (South Africa recommended)
   - Wait 2 minutes for project creation

### 1.2 Run Database Schema
1. In Supabase dashboard, go to "SQL Editor"
2. Click "New Query"
3. Copy the entire contents of `schema.sql`
4. Click "Run"
5. You should see "Success. No rows returned"

### 1.3 Get Database URL
1. In Supabase, go to Settings → Database
2. Find "Connection string" → "URI"
3. Copy it (looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres`)
4. Save this - you'll need it in Step 2

### 1.4 Create Initial Users (Optional for testing)
Run this in SQL Editor to create test accounts:

```sql
-- HOD account
INSERT INTO users (email, name, role, password_hash)
VALUES ('hod@tsh.com', 'HOD User', 'hod', '$2b$10$rBV2O9/TFz8x8vXqEPY3p.VLWQJx5l8nBfWNKxHmHp4YJ8dVZqHRi');

-- Tutor account  
INSERT INTO users (email, name, role, password_hash)
VALUES ('tutor@tsh.com', 'Tutor User', 'tutor', '$2b$10$rBV2O9/TFz8x8vXqEPY3p.VLWQJx5l8nBfWNKxHmHp4YJ8dVZqHRi');

-- Marketing account
INSERT INTO users (email, name, role, password_hash)
VALUES ('marketing@tsh.com', 'Marketing User', 'marketing', '$2b$10$rBV2O9/TFz8x8vXqEPY3p.VLWQJx5l8nBfWNKxHmHp4YJ8dVZqHRi');
```

All test accounts password: `password123`

**IMPORTANT:** Change these passwords immediately after first login in production!

---

## STEP 2: Deploy Backend (Railway - 10 minutes)

### 2.1 Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub (free tier)
3. Click "New Project" → "Deploy from GitHub repo"
4. If no repos, click "Add repo" and create one OR use "Empty Service"

### 2.2 Deploy Backend Files
If using GitHub:
1. Push backend files to GitHub repo:
   - `server.js`
   - `package.json`
   - `.env.example` (rename to `.env` locally, don't commit real .env)

If using Empty Service:
1. Click "Empty Service"
2. Railway will create a blank service
3. We'll deploy via CLI (see below)

### 2.3 Add Environment Variables
In Railway project:
1. Click on your service
2. Go to "Variables" tab
3. Add these:
   ```
   DATABASE_URL = [your Supabase connection string from Step 1.3]
   JWT_SECRET = [generate random string - mash keyboard for 30 chars]
   NODE_ENV = production
   ```

### 2.4 Deploy
- If GitHub: Push changes, Railway auto-deploys
- If manual: Use Railway CLI
  ```bash
  npm install -g @railway/cli
  railway login
  railway link
  railway up
  ```

### 2.5 Get Backend URL
1. In Railway, click "Settings"
2. Click "Generate Domain"
3. Copy the URL (e.g., `tsh-erp-production.up.railway.app`)
4. Save this - you'll need it in Step 3

### 2.6 Test Backend
Open in browser: `https://[your-railway-url]/api/health`

Should see:
```json
{"status":"ok","timestamp":"2024-..."}
```

---

## STEP 3: Deploy Frontend (Vercel - 10 minutes)

### 3.1 Prepare Frontend
1. Open `index.html`
2. Find this line near the top:
   ```javascript
   const API_URL = 'http://localhost:3001/api';
   ```
3. Change it to:
   ```javascript
   const API_URL = 'https://[your-railway-url]/api';
   ```
   (Use the URL from Step 2.5, but add `/api` at the end)

### 3.2 Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub (free tier)

### 3.3 Deploy
Option A - Drag and Drop:
1. In Vercel dashboard, click "Add New" → "Project"
2. Drag `index.html` file into the upload area
3. Click "Deploy"

Option B - From GitHub:
1. Push `index.html` to GitHub repo
2. In Vercel, "Import" the repo
3. Deploy

### 3.4 Get Frontend URL
Vercel will give you a URL like: `tsh-erp.vercel.app`

---

## STEP 4: Test Everything (5 minutes)

### 4.1 Open Frontend
Go to your Vercel URL

### 4.2 Login
Use test credentials:
- Email: `tutor@tsh.com`
- Password: `password123`

### 4.3 Test Campaign Flow

**As Tutor:**
1. Click "New Campaign"
2. Fill form:
   - Subject: Biology
   - Topic: Cell Structure
   - Trick/Pattern: Mitochondria drawing traps
   - Target Date: [pick a date]
3. Click "Submit for Approval"
4. Should see campaign in "pending approval" status

**As HOD:**
1. Logout (top right)
2. Login as: `hod@tsh.com` / `password123`
3. Should see "1 Pending Approval" in stats
4. Click "Approve" on the campaign
5. Should see "Approved" status

**As Marketing:**
1. Logout
2. Login as: `marketing@tsh.com` / `password123`
3. Should see notification: "Campaign 'Cell Structure' has been approved..."

### 4.4 Verify Notifications Work
Marketing role should have 1 unread notification

---

## STEP 5: Create Real Users

### 5.1 Access Database
In Supabase SQL Editor, run:

```sql
-- Replace with real names and emails
INSERT INTO users (email, name, role, password_hash)
VALUES 
('isaac@tsh.com', 'Isaac (HOD)', 'hod', '$2b$10$[HASH]'),
('martin@tsh.com', 'Martin', 'tutor', '$2b$10$[HASH]'),
('kondwani@tsh.com', 'Kondwani', 'tutor', '$2b$10$[HASH]');
```

To generate password hashes, use this Node.js script:

```javascript
const bcrypt = require('bcrypt');
const password = 'YourChosenPassword';
bcrypt.hash(password, 10).then(hash => console.log(hash));
```

OR use an online bcrypt generator (search "bcrypt hash generator")

### 5.2 Send Credentials
Send each person:
- Frontend URL
- Their email
- Their temporary password
- Ask them to change it immediately (we'll add password change in Week 2)

---

## STEP 6: Go Live

### 6.1 Share with Team
Send message:
```
🎉 Campaign Gate is live!

URL: [your-vercel-url]

Login with your email and the password I sent separately.

This replaces campaign approval via WhatsApp. From now on:
- Tutors: Submit campaigns here
- HOD: Approve/reject here
- Everyone: Check notifications here

Any issues, WhatsApp me immediately.
```

### 6.2 Monitor First Day
- Check Railway logs for errors
- Check Supabase for database activity
- Be ready to fix issues quickly

---

## COSTS

Free tier limits:
- **Supabase**: 500MB database (plenty for testing)
- **Railway**: 500 hours/month (sleeps after 30min inactivity - wakes on request)
- **Vercel**: Unlimited deployments

**Total: $0 for testing phase**

When to upgrade:
- Database > 500MB: Supabase paid ~$25/month
- Need 24/7 backend: Railway paid ~$5/month
- More than basic usage: Check dashboards

---

## TROUBLESHOOTING

### Backend won't start
Check Railway logs:
- Variables tab → ensure DATABASE_URL is correct
- Logs tab → look for connection errors

### Frontend shows "Request failed"
1. Check browser console (F12)
2. Verify API_URL in index.html matches Railway URL
3. Check CORS - backend should allow your Vercel domain

### Database errors
- Verify connection string includes password
- Check Supabase → Database → Connection pooler is enabled

### Can't login
- Verify users exist: Supabase → Table Editor → users
- Check password hash is correct
- Verify JWT_SECRET is set in Railway

---

## SECURITY NOTES

Before going to real production:
1. Change all test passwords
2. Use strong JWT_SECRET
3. Enable Supabase RLS (Row Level Security) - we'll add this Week 2
4. Add rate limiting - we'll add this Week 3
5. Use environment-specific API URLs

---

## NEXT WEEK

Week 2 we'll add:
- Hub Assets (Quality Gate)
- Password change functionality
- Better error handling
- Mobile responsive improvements

For now: **Ship it and get feedback!** 🚀
