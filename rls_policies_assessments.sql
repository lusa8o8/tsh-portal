-- All authenticated users can view assessments (shared calendar)
CREATE POLICY "All can view assessments"
ON assessments FOR SELECT
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid()));

-- Tutors can create assessments
CREATE POLICY "Tutors can create assessments"
ON assessments FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid()
    AND users.role IN ('tutor', 'hod', 'admin')
  )
);

-- Tutors can update their own assessments
CREATE POLICY "Tutors can update own assessments"
ON assessments FOR UPDATE
USING (
  created_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid()
    AND users.role IN ('hod', 'admin')
  )
);

-- HOD can delete assessments
CREATE POLICY "HOD can delete assessments"
ON assessments FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid()
    AND users.role IN ('hod', 'admin')
  )
);
