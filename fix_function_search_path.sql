-- Set immutable search_path on function (security best practice)
ALTER FUNCTION update_updated_at_column() SET search_path = public;

-- Verify the fix
SELECT 
  proname as function_name,
  prosecdef as security_definer,
  proconfig as configuration
FROM pg_proc 
WHERE proname = 'update_updated_at_column';
