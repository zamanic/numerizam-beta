-- PostgreSQL Trigger for Automatic User Synchronization
-- This trigger automatically creates a record in numerizamauth when a user signs up via Supabase Auth
-- Run this script in your Supabase SQL Editor

-- First, ensure the numerizamauth table exists with the correct structure
CREATE TABLE IF NOT EXISTS numerizamauth (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    company_name TEXT,
    country TEXT,
    region TEXT,
    role TEXT DEFAULT 'User',
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE numerizamauth ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for numerizamauth
CREATE POLICY "Users can view their own profile" ON numerizamauth
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON numerizamauth
    FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON numerizamauth
    FOR UPDATE USING (id = auth.uid());

-- Create the trigger function
CREATE OR REPLACE FUNCTION sync_user_to_numerizamauth()
RETURNS TRIGGER AS $$
DECLARE
    user_role TEXT := 'User';
    user_approved BOOLEAN := false;
BEGIN
    -- Extract user metadata from auth.users
    -- Supabase stores custom data in raw_user_meta_data
    
    -- Determine role based on email domain
    IF NEW.email LIKE '%@numerizam.com' THEN
        user_role := 'Admin';
        user_approved := true;
    ELSIF NEW.email LIKE '%@accountant.%' OR NEW.email LIKE '%@cpa.%' THEN
        user_role := 'Accountant';
        user_approved := false; -- Accountants need manual approval
    ELSE
        user_role := 'User';
        user_approved := false; -- Regular users need approval
    END IF;

    -- Insert into numerizamauth table
    INSERT INTO numerizamauth (
        id,
        name,
        email,
        company_name,
        country,
        region,
        role,
        is_approved,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'company_name', 'Unknown Company'),
        COALESCE(NEW.raw_user_meta_data->>'country', 'Unknown'),
        COALESCE(NEW.raw_user_meta_data->>'region', 'Unknown'),
        user_role,
        user_approved,
        NEW.created_at,
        NEW.created_at
    );

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the user creation
        RAISE WARNING 'Failed to sync user to numerizamauth: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_to_numerizamauth();

-- Create updated_at trigger for numerizamauth
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_numerizamauth_updated_at
    BEFORE UPDATE ON numerizamauth
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO postgres, anon, authenticated, service_role;
GRANT ALL ON auth.users TO postgres, service_role;
GRANT SELECT ON auth.users TO anon, authenticated;

-- Test the trigger (optional - you can run this to verify)
-- This will show you what happens when a user is created
/*
-- Example test (don't run in production):
INSERT INTO auth.users (
    id,
    email,
    raw_user_meta_data,
    created_at,
    updated_at,
    email_confirmed_at
) VALUES (
    gen_random_uuid(),
    'test@example.com',
    '{"full_name": "Test User", "company_name": "Test Company", "country": "USA", "region": "California"}',
    NOW(),
    NOW(),
    NOW()
);
*/

-- Create an index for better performance
CREATE INDEX IF NOT EXISTS idx_numerizamauth_email ON numerizamauth(email);
CREATE INDEX IF NOT EXISTS idx_numerizamauth_role ON numerizamauth(role);
CREATE INDEX IF NOT EXISTS idx_numerizamauth_approved ON numerizamauth(is_approved);

COMMENT ON FUNCTION sync_user_to_numerizamauth() IS 'Automatically syncs new users from auth.users to numerizamauth table with role assignment based on email patterns';
COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 'Triggers user synchronization when a new user is created via Supabase Auth';