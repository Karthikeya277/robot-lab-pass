-- Add email column to profiles table to store user email for login
ALTER TABLE public.profiles ADD COLUMN email TEXT;