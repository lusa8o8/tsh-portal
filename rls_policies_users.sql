-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (id = auth.uid());

-- Admins can view all users
CREATE POLICY "Admins can view all users"
ON users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- HOD can view tutors (for oversight)
CREATE POLICY "HOD can view tutors"
ON users FOR SELECT
USING (
  (role = 'tutor' AND EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid()
    AND users.role IN ('hod', 'admin')
  ))
  OR id = auth.uid()
);
