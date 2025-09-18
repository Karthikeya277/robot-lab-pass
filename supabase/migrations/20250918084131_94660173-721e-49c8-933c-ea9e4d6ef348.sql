-- First, let's create a function to update user profiles to admin after they register
CREATE OR REPLACE FUNCTION public.setup_admin_profile(
  p_email text,
  p_login_id text,
  p_name text,
  p_phone text DEFAULT '0000000000'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  auth_user_id uuid;
BEGIN
  -- Find the user_id from auth.users based on email
  SELECT id INTO auth_user_id
  FROM auth.users
  WHERE email = p_email
  LIMIT 1;
  
  -- Update the profile if user exists
  IF auth_user_id IS NOT NULL THEN
    UPDATE public.profiles
    SET 
      role = 'admin',
      login_id = p_login_id,
      name = p_name,
      phone_number = p_phone
    WHERE user_id = auth_user_id;
  END IF;
END;
$$;

-- Note: After users register with the specified emails, run these commands:
-- SELECT public.setup_admin_profile('venkatesh@eee.sastra.edu', 'A0001', 'T.venkatesh');
-- SELECT public.setup_admin_profile('admin2@college.edu', 'A0002', 'Admin 2');