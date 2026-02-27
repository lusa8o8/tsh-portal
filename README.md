# TSH ERP - Week 1: Campaign Gate 🔐

**Strict Mode Build - No Bloat, Just What Works**

## What This Is

A dead-simple campaign approval system that replaces WhatsApp chaos with clean handoffs.

**The Flow:**
1. Tutor submits campaign design
2. HOD approves or rejects
3. Marketing + CRM get notified automatically
4. Tutor delivers campaign
5. Tutor logs what happened

That's it. Nothing more.

---

## What's Inside

```
.
├── schema.sql           # Database schema (PostgreSQL)
├── server.js            # Backend API (Node.js + Express)
├── package.json         # Backend dependencies
├── .env.example         # Environment variables template
├── index.html           # Frontend (React in single HTML file)
├── DEPLOYMENT.md        # Step-by-step deployment guide
└── README.md            # This file
```

---

## Tech Stack

- **Database:** PostgreSQL (Supabase free tier)
- **Backend:** Node.js + Express (Railway free tier)
- **Frontend:** React (Vercel free tier)
- **Auth:** JWT with bcrypt

**Cost:** $0 during testing

---

## Quick Start

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (or Supabase account)

### Local Development

1. **Setup Database**
   ```bash
   # Create PostgreSQL database
   psql -U postgres -c "CREATE DATABASE tsh_erp;"
   
   # Run schema
   psql -U postgres -d tsh_erp -f schema.sql
   ```

2. **Setup Backend**
   ```bash
   # Install dependencies
   npm install
   
   # Create .env file
   cp .env.example .env
   # Edit .env with your DATABASE_URL and JWT_SECRET
   
   # Start server
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   # Open index.html in browser
   # Or use a simple server:
   python3 -m http.server 8000
   ```

4. **Create test user**
   ```bash
   curl -X POST http://localhost:3001/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "tutor@test.com",
       "name": "Test Tutor",
       "role": "tutor",
       "password": "password123"
     }'
   ```

---

## Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete step-by-step guide.

**TL;DR:**
1. Deploy database to Supabase (5 min)
2. Deploy backend to Railway (10 min)
3. Deploy frontend to Vercel (10 min)
4. Test and go live (5 min)

**Total: 30 minutes**

---

## API Endpoints

### Auth
- `POST /api/auth/register` - Create user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Campaigns
- `POST /api/campaigns` - Create campaign (tutor)
- `GET /api/campaigns` - List campaigns (filtered by role)
- `GET /api/campaigns/:id` - Get single campaign
- `PUT /api/campaigns/:id` - Update campaign (tutor, draft only)
- `POST /api/campaigns/:id/submit` - Submit for approval (tutor)
- `POST /api/campaigns/:id/approve` - Approve (HOD)
- `POST /api/campaigns/:id/reject` - Reject (HOD)
- `POST /api/campaigns/:id/deliver` - Mark delivered (tutor)

### Notifications
- `GET /api/notifications` - Get user's notifications
- `POST /api/notifications/:id/read` - Mark notification as read
- `POST /api/notifications/read-all` - Mark all as read

---

## Roles

- `tutor` - Submit and deliver campaigns
- `hod` - Approve/reject campaigns
- `marketing` - Receive campaign approval notifications
- `content` - (Week 2 - Quality Gate)
- `admin` - See everything
- `ceo` - (Future)
- `finance` - (Future)

---

## Database Schema

### users
- `id` (uuid, primary key)
- `email` (unique, not null)
- `name` (not null)
- `role` (enum: hod, tutor, marketing, content, admin, ceo, finance)
- `password_hash` (not null)
- `created_at` (timestamp)

### campaigns
- `id` (uuid, primary key)
- `tutor_id` (uuid, foreign key → users)
- `subject` (enum: biology, chemistry, physics, mathematics)
- `topic` (text, not null)
- `trick_pattern` (text)
- `outcomes` (text)
- `target_date` (date)
- `status` (enum: draft, pending_approval, approved, rejected, completed)
- `submitted_at` (timestamp)
- `hod_approved_at` (timestamp)
- `hod_rejection_reason` (text)
- `delivered_at` (timestamp)
- `weak_areas` (text)
- `top_mistakes` (text)
- `outcome` (enum: improved, no_change, worse, not_executed)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### notifications
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key → users)
- `message` (text, not null)
- `type` (text, not null)
- `read` (boolean, default false)
- `created_at` (timestamp)

---

## Week 2 Plan

Next week we add:

1. **Hub Assets (Quality Gate)**
   - Tutor submits asset with drive link
   - HOD quality review
   - Content manager notification

2. **Support Sessions**
   - Schedule sessions
   - Log gaps detected

3. **Intelligence Gaps**
   - Simple gap logging
   - HOD review queue

4. **Improvements**
   - Password change
   - Better mobile UI
   - Loading states
   - Error handling

---

## Philosophy

This project follows **Strict Mode 🔐**:

✅ Only build what moves operations forward  
✅ Ship working pieces weekly  
✅ Get feedback immediately  
✅ No theoretical features  
✅ No premature optimization  
✅ Boring technology that works  

❌ No formula engines  
❌ No AI features  
❌ No complex analytics  
❌ No bloat  

---

## License

Internal use only - TSH Operations

---

## Support

Issues? Questions?

1. Check DEPLOYMENT.md troubleshooting section
2. Check Railway logs for backend errors
3. Check browser console for frontend errors
4. WhatsApp the dev team

---

**Built with discipline. Shipped with speed. 🚀**
