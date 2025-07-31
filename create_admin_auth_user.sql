-- SQL script to manually create the admin user in Supabase Auth
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor)

-- First, check if the user exists in auth.users
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email = 'shuvo@admin.com';

-- If the user doesn't exist, insert them manually
-- Note: This is a workaround and should only be used for admin setup
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_sent_at,
    confirmation_token,
    recovery_sent_at,
    recovery_token,
    email_change_sent_at,
    email_change,
    email_change_token_new,
    email_change_token_current,
    phone_change_sent_at,
    phone_change,
    phone_change_token,
    reauthentication_sent_at,
    reauthentication_token,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    phone,
    phone_confirmed_at,
    phone_change_token_new,
    email_change_token_current_candidate,
    banned_until,
    deleted_at,
    is_sso_user
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'shuvo@admin.com',
    crypt('123456', gen_salt('bf')), -- This encrypts the password
    NOW(),
    NOW(),
    '',
    NULL,
    '',
    NULL,
    '',
    '',
    '',
    NULL,
    '',
    '',
    NULL,
    '',
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Admin User", "company_name": "Numerizam Corp"}',
    false,
    NOW(),
    NOW(),
    NULL,
    NULL,
    '',
    '',
    NULL,
    NULL,
    false
) ON CONFLICT (email) DO NOTHING;

-- Verify the user was created
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email = 'shuvo@admin.com';

-- Also verify the profile exists in numerizamauth
SELECT id, email, name, role, is_approved, created_at 
FROM numerizamauth 
WHERE email = 'shuvo@admin.com';