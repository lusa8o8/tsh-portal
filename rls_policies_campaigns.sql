-- Tutors can view their own campaigns
CREATE POLICY "Tutors can view own campaigns"
ON campaigns FOR SELECT
USING (tutor_id = auth.uid());

-- Tutors can create campaigns
CREATE POLICY "Tutors can create campaigns"
ON campaigns FOR INSERT
WITH CHECK (tutor_id = auth.uid());

-- Tutors can update their own pending campaigns
CREATE POLICY "Tutors can update own pending campaigns"
ON campaigns FOR UPDATE
USING (
  tutor_id = auth.uid()
  AND status = 'pending_approval'
);

-- HOD can view all campaigns
CREATE POLICY "HOD can view all campaigns"
ON campaigns FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid()
    AND users.role IN ('hod', 'admin')
  )
);

-- HOD can approve/reject campaigns
CREATE POLICY "HOD can update campaigns"
ON campaigns FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid()
    AND users.role IN ('hod', 'admin')
  )
);

-- Marketing can view approved campaigns
CREATE POLICY "Marketing can view approved campaigns"
ON campaigns FOR SELECT
USING (
  status = 'approved'
  AND EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid()
    AND users.role IN ('marketing', 'admin')
  )
);

-- CRM can view approved campaigns
CREATE POLICY "CRM can view approved campaigns"
ON campaigns FOR SELECT
USING (
  status = 'approved'
  AND EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid()
    AND users.role IN ('crm', 'admin')
  )
);
