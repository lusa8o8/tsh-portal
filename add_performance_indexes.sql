-- Campaigns: Frequent queries by status and creator
CREATE INDEX IF NOT EXISTS idx_campaigns_status_tutor_id 
ON campaigns(status, tutor_id);

CREATE INDEX IF NOT EXISTS idx_campaigns_approved_date 
ON campaigns(status, target_date) 
WHERE status = 'approved';

-- Hub Assets: Frequent queries by status and category
CREATE INDEX IF NOT EXISTS idx_hub_assets_status_category 
ON hub_assets(status, asset_category);

CREATE INDEX IF NOT EXISTS idx_hub_assets_pending_cm 
ON hub_assets(status, asset_category) 
WHERE status = 'pending_cm';

-- Notifications: User-specific queries with read status
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_read 
ON notifications(user_id, read_status);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created 
ON notifications(user_id, created_at DESC);

-- Support Sessions: Date-based queries
CREATE INDEX IF NOT EXISTS idx_support_sessions_date 
ON support_sessions(session_date);

CREATE INDEX IF NOT EXISTS idx_support_sessions_scheduled_by 
ON support_sessions(scheduled_by, session_date);

-- Assessments: Pressure level and date queries
CREATE INDEX IF NOT EXISTS idx_assessments_date_pressure 
ON assessments(date, pressure_level);

CREATE INDEX IF NOT EXISTS idx_assessments_upcoming 
ON assessments(date);

-- SOP Links: Role-based queries
CREATE INDEX IF NOT EXISTS idx_sop_links_role_active 
ON sop_links(target_role, active) 
WHERE active = true;

-- Users: Email lookup for login
CREATE INDEX IF NOT EXISTS idx_users_email 
ON users(email);

-- Verify indexes created
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
