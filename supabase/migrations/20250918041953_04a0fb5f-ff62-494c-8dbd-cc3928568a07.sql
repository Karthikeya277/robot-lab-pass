-- Create admin user profile
INSERT INTO public.profiles (
  user_id, 
  role, 
  login_id, 
  name, 
  phone_number, 
  email
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'admin',
  'A0001', 
  'System Administrator',
  '0000000000',
  'admin@college.edu'
);