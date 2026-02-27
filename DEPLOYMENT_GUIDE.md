# TSH PORTAL - Phase 3 Deployment Guide 🚀

This guide provides a comprehensive roadmap for deploying the Phase 3 TSH PORTAL system to production. 

## 📋 Pre-Deployment Checklist

### ⚙️ Environment Configuration
- [ ] **Database Connection**: Ensure `DATABASE_URL` is set to the production PostgreSQL instance.
- [ ] **Security**: Verify `JWT_SECRET` is a unique, cryptographically strong string.
- [ ] **Port**: Check that the server port (default 3001) is available and correctly handled by the reverse proxy.
- [ ] **API URL**: Ensure `const API_URL` in `index.html` points to the production backend.

### 🔒 Security Verification
- [ ] **User Registration**: Confirm that account approval workflow is enabled (admin must approve users).
- [ ] **RLS Policies**: Run `verify_flow.js` to ensure Row Level Security is preventing unauthorized data access.
- [ ] **Role Matrix**: Verify that Admin, HOD, and Tutor roles have their respective permissions as defined.

### 🧪 Functional Verification
- [ ] **Campaign Flow**: Test tutor submission -> HOD approval -> marketing notification.
- [ ] **Asset Pipeline**: Test tutor upload -> CM quality check -> Study Hub publication.
- [ ] **Support Sessions**: Test scheduling and gap logging.
- [ ] **Strategic View**: Confirm analytics are populating correctly.

---

## 🚀 Step-by-Step Deployment

### 1. Database Migration
```bash
# Apply final schema updates
node setup_db.js
# Apply RLS policies
node apply_migration.js
```

### 2. Backend Deployment
- **Platform**: Recommended (Railway/Heroku/Vercel Serverless).
- **Settings**:
  - Set `NODE_ENV=production`.
  - Set `DATABASE_URL`.
  - Set `JWT_SECRET`.
- **Health Check**: Verify `https://your-api.com/api/health` returns `{"status":"ok"}`.

### 3. Frontend Deployment
- **Platform**: Vercel/Netlify (Static).
- **Settings**:
  - Update `API_URL` to point to the production backend.
  - Deploy `index.html`.

---

## 🧪 User Testing Plan (UAT)

### Phase 1: Internal Alpha (Day 1)
- **Testers**: 1 HOD, 1 Lead Tutor.
- **Focus**: Core workflows (Campaigns, Uploads).
- **Success**: Zero blocking errors.

### Phase 2: Pilot Group (Day 2-3)
- **Testers**: 5 Tutors.
- **Goal**: Verify onboarding via Overview instructions.
- **Success**: Tutors can submit their first campaign without technical assistance.

---

## 📈 Monitoring Strategy

- **Error Logs**: Use `tail -f err.log` or cloud logging dashboard.
- **Database Health**: Monitor connection pool usage and slow queries.
- **User Activity**: Track registration volume and campaign submission rates.

---

## 🆘 Support Structure

- **Tier 1 (Tutors)**: Message HOD via system Inbox.
- **Tier 2 (HOD)**: Contact Dev Team (Isaac/Kondwani) for data issues.
- **Technical Issue**: Log a ticket in the system's "Tech Support" category.

---

## ✅ Success Criteria

1. **Adoption**: 100% of tutors registered within 48 hours.
2. **Efficiency**: Campaign approval time reduced to <12 hours.
3. **Quality**: 0 reported "duplicate asset" uploads due to system detection.

---

## 🔄 Rollback Plan

### Trigger Points
- Severe data corruption.
- Total system downtime > 2 hours.
- Security breach disclosure.

### Steps
1. **Frontend**: Revert Vercel deployment to previous stable version.
2. **Backend**: Restart server using the backup code from the previous stable branch.
3. **Database**: Restore from the daily snapshot (Point-in-Time Recovery).

---

## 📞 Contact Information

- **Lead Developer**: [Isaac]
- **Project HOD**: [Martin]
- **CM Coordinator**: [Kondwani]
