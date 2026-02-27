-- Tutors can view their own sessions
CREATE POLICY "Tutors can view own sessions"
ON support_sessions FOR SELECT
USING (scheduled_by = auth.uid());

-- Tutors can create sessions
CREATE POLICY "Tutors can create sessions"
ON support_sessions FOR INSERT
WITH CHECK (scheduled_by = auth.uid());

-- Tutors can update their own sessions
CREATE POLICY "Tutors can update own sessions"
ON support_sessions FOR UPDATE
USING (scheduled_by = auth.uid());

-- HOD can view all sessions
CREATE POLICY "HOD can view all sessions"
ON support_sessions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid()
    AND users.role IN ('hod', 'admin')
  )
);

-- CRM can view all sessions (coordination)
CREATE POLICY "CRM can view sessions"
ON support_sessions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid()
    AND users.role IN ('crm', 'admin')
  )
);

-- Marketing can view all sessions (promotion)
CREATE POLICY "Marketing can view sessions"
ON support_sessions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid()
    AND users.role IN ('marketing', 'admin')
  )
);
