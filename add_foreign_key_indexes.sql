-- Add indexes for foreign key columns (improves JOIN performance)
CREATE INDEX IF NOT EXISTS idx_assessments_created_by ON assessments(created_by);
CREATE INDEX IF NOT EXISTS idx_campaigns_tutor_id ON campaigns(tutor_id);
CREATE INDEX IF NOT EXISTS idx_hub_assets_campaign_id ON hub_assets(campaign_id);
CREATE INDEX IF NOT EXISTS idx_hub_assets_tutor_id ON hub_assets(tutor_id);
CREATE INDEX IF NOT EXISTS idx_notifications_asset_id ON notifications(asset_id);
CREATE INDEX IF NOT EXISTS idx_notifications_campaign_id ON notifications(campaign_id);
CREATE INDEX IF NOT EXISTS idx_notifications_support_session_id ON notifications(support_session_id);
CREATE INDEX IF NOT EXISTS idx_sop_links_updated_by ON sop_links(updated_by);

-- Verify all indexes created successfully
SELECT 
  schemaname, 
  tablename, 
  indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname IN (
  'idx_assessments_created_by',
  'idx_campaigns_tutor_id',
  'idx_hub_assets_campaign_id',
  'idx_hub_assets_tutor_id',
  'idx_notifications_asset_id',
  'idx_notifications_campaign_id',
  'idx_notifications_support_session_id',
  'idx_sop_links_updated_by'
)
ORDER BY tablename, indexname;
