-- All users can view active SOPs for their role
CREATE POLICY "Users can view SOPs for their role"
ON sop_links FOR SELECT
USING (
  active = true
  AND (
    target_role = (SELECT role FROM users WHERE id = auth.uid())
    OR target_role = 'all'
  )
);

-- HOD can manage academic SOPs
CREATE POLICY "HOD can manage academic SOPs"
ON sop_links FOR ALL
USING (
  managed_by = 'hod'
  AND EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid()
    AND users.role IN ('hod', 'admin')
  )
);

-- Admins can manage all SOPs
CREATE POLICY "Admins can manage all SOPs"
ON sop_links FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);
