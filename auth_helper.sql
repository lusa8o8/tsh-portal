-- Create auth schema and uid helper to mirror Supabase environment locally
CREATE SCHEMA IF NOT EXISTS auth;
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid AS $$
  -- Attempt to get user ID from session variable 'app.current_user_id'
  -- This allows our Node backend to pass user identity to RLS
  SELECT current_setting('app.current_user_id', true)::uuid;
$$ LANGUAGE sql STABLE;
