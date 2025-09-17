-- Create user roles enum
CREATE TYPE public.user_role AS ENUM ('student', 'faculty', 'admin');

-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.user_role NOT NULL,
  login_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  
  -- Student specific fields
  register_number TEXT,
  year INTEGER,
  branch TEXT,
  
  -- Faculty specific fields
  department TEXT,
  designation TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create access requests table
CREATE TABLE public.access_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  purpose TEXT NOT NULL,
  request_date DATE NOT NULL,
  in_time TIME NOT NULL,
  out_time TIME NOT NULL,
  
  -- Faculty specific fields for student requests
  num_systems INTEGER,
  num_students INTEGER,
  is_for_students BOOLEAN DEFAULT FALSE,
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  systems_allocated INTEGER[],
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for access requests
ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for access requests
CREATE POLICY "Users can view their own requests" 
ON public.access_requests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own requests" 
ON public.access_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create trigger for access requests timestamps
CREATE TRIGGER update_access_requests_updated_at
BEFORE UPDATE ON public.access_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();