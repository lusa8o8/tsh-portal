-- Tutors can view their own assets
CREATE POLICY "Tutors can view own assets"
ON hub_assets FOR SELECT
USING (tutor_id = auth.uid());

-- Tutors can create assets
CREATE POLICY "Tutors can create assets"
ON hub_assets FOR INSERT
WITH CHECK (tutor_id = auth.uid());

-- Content Manager can view all assets
CREATE POLICY "CM can view all assets"
ON hub_assets FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid()
    AND users.role IN ('content_manager', 'admin')
  )
);

-- Content Manager can update asset status
CREATE POLICY "CM can update assets"
ON hub_assets FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid()
    AND users.role IN ('content_manager', 'admin')
  )
);

-- HOD can view all assets (oversight)
CREATE POLICY "HOD can view assets"
ON hub_assets FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid()
    AND users.role IN ('hod', 'admin')
  )
);

-- All roles can view published assets (Study Hub)
CREATE POLICY "All can view published assets"
ON hub_assets FOR SELECT
USING (
  status = 'published'
  AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid())
);
