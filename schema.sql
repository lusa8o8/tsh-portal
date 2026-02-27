-- TSH ERP - Week 1 + Week 2 Schema (Campaign Gate + Quality Gate)
-- Strict Mode: Supervisor Approved

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('hod', 'tutor', 'marketing', 'crm', 'content_manager', 'admin')),
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Campaigns table (Week 1)
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutor_id UUID REFERENCES users(id) NOT NULL,
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    trick_pattern TEXT,
    outcomes TEXT,
    target_date DATE,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'rejected')),
    submitted_at TIMESTAMP,
    hod_approved_at TIMESTAMP,
    hod_rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Hub Assets table (Week 2)
CREATE TABLE hub_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES campaigns(id),   -- nullable: standalone assets allowed
    tutor_id UUID REFERENCES users(id) NOT NULL,
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    asset_type TEXT NOT NULL,                    -- 'slides', 'worksheet', 'recording'
    drive_link TEXT NOT NULL,
    destination_path TEXT,
    status TEXT NOT NULL DEFAULT 'pending_hod'
        CHECK (status IN ('pending_hod', 'approved', 'rejected', 'published', 'needs_revision')),
    asset_category TEXT NOT NULL DEFAULT 'hub_asset' 
        CHECK (asset_category IN ('hub_asset', 'free_asset')),
    submitted_at TIMESTAMP DEFAULT NOW(),
    hod_approved_at TIMESTAMP,
    hod_feedback TEXT,
    content_manager_alerted_at TIMESTAMP,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Notifications table (Role-based handoffs — Weeks 1 & 2)
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES campaigns(id),
    asset_id UUID REFERENCES hub_assets(id),
    message TEXT NOT NULL,
    recipient_role TEXT NOT NULL, -- 'marketing', 'crm', 'tutor', 'content_manager'
    read_status TEXT NOT NULL DEFAULT 'unread' CHECK (read_status IN ('unread','read')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hub_assets_updated_at BEFORE UPDATE ON hub_assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
