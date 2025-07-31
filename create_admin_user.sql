-- SQL script to manually create the admin user
-- Run this in your Supabase SQL editor

-- First, let's check if the user exists in auth.users
-- You'll need to run this manually in Supabase dashboard

-- Insert into numerizamauth table directly
INSERT INTO numerizamauth (
  email,
  name,
  role,
  company_name,
  country,
  region,
  is_approved,
  created_at,
  updated_at
) VALUES (
  'shuvo@admin.com',
  'Admin User',
  'Admin',
  'Numerizam Corp',
  'Global',
  'Global',
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  role = 'Admin',
  is_approved = true,
  updated_at = NOW();

-- Check if the user was created
SELECT * FROM numerizamauth WHERE email = 'shuvo@admin.com';