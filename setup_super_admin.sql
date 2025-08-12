-- Setup Super Admin for shuvo@admin.com
-- This script creates special RLS policies that give shuvo@admin.com access to all companies

-- First, let's create the admin user in numerizamauth if they don't exist
-- Note: This assumes the auth.users entry already exists from Supabase Auth
INSERT INTO numerizamauth (
    auth_user_id,
    name,
    email,
    company_name,
    country,
    region,
    role,
    is_approved,
    created_at,
    updated_at
)
SELECT 
    au.id,
    'Super Admin',
    'shuvo@admin.com',
    'Numerizam Corp',
    'Global',
    'Global',
    'Admin',
    true,
    NOW(),
    NOW()
FROM auth.users au
WHERE au.email = 'shuvo@admin.com'
AND NOT EXISTS (
    SELECT 1 FROM numerizamauth na 
    WHERE na.email = 'shuvo@admin.com'
);

-- Drop existing RLS policies for companies, territory, calendar, chartofaccounts, and generalledger
-- to recreate them with super admin privileges

-- Companies table policies
DROP POLICY IF EXISTS "Users can view their own company" ON companies;
DROP POLICY IF EXISTS "Approved users can insert companies" ON companies;

-- Create new policies with super admin access
CREATE POLICY "Users can view their own company OR super admin can view all" ON companies
    FOR SELECT USING (
        -- Super admin (shuvo@admin.com) can see all companies
        EXISTS (
            SELECT 1 FROM numerizamauth na
            WHERE na.auth_user_id = auth.uid() 
            AND na.email = 'shuvo@admin.com' 
            AND na.role = 'Admin' 
            AND na.is_approved = true
        )
        OR
        -- Regular users can see their own company
        id IN (
            SELECT c.id FROM companies c
            JOIN numerizamauth au ON au.company_name = c.name
            WHERE au.auth_user_id = auth.uid() AND au.is_approved = true
        )
    );

CREATE POLICY "Approved users can insert companies OR super admin can insert any" ON companies
    FOR INSERT WITH CHECK (
        -- Super admin can insert any company
        EXISTS (
            SELECT 1 FROM numerizamauth na
            WHERE na.auth_user_id = auth.uid() 
            AND na.email = 'shuvo@admin.com' 
            AND na.role = 'Admin' 
            AND na.is_approved = true
        )
        OR
        -- Regular approved users can insert companies
        EXISTS (
            SELECT 1 FROM numerizamauth
            WHERE auth_user_id = auth.uid() AND is_approved = true
        )
    );

-- Territory table policies
DROP POLICY IF EXISTS "Users can access their company territory" ON territory;

CREATE POLICY "Users can access their company territory OR super admin can access all" ON territory
    FOR ALL USING (
        -- Super admin can access all territories
        EXISTS (
            SELECT 1 FROM numerizamauth na
            WHERE na.auth_user_id = auth.uid() 
            AND na.email = 'shuvo@admin.com' 
            AND na.role = 'Admin' 
            AND na.is_approved = true
        )
        OR
        -- Regular users can access their company territory
        company_id IN (
            SELECT c.id FROM companies c
            JOIN numerizamauth au ON au.company_name = c.name
            WHERE au.auth_user_id = auth.uid() AND au.is_approved = true
        )
    );

-- Calendar table policies
DROP POLICY IF EXISTS "Users can access their company calendar" ON calendar;

CREATE POLICY "Users can access their company calendar OR super admin can access all" ON calendar
    FOR ALL USING (
        -- Super admin can access all calendars
        EXISTS (
            SELECT 1 FROM numerizamauth na
            WHERE na.auth_user_id = auth.uid() 
            AND na.email = 'shuvo@admin.com' 
            AND na.role = 'Admin' 
            AND na.is_approved = true
        )
        OR
        -- Regular users can access their company calendar
        company_id IN (
            SELECT c.id FROM companies c
            JOIN numerizamauth au ON au.company_name = c.name
            WHERE au.auth_user_id = auth.uid() AND au.is_approved = true
        )
    );

-- Chart of Accounts table policies
DROP POLICY IF EXISTS "Users can access their company chart of accounts" ON chartofaccounts;

CREATE POLICY "Users can access their company chart of accounts OR super admin can access all" ON chartofaccounts
    FOR ALL USING (
        -- Super admin can access all chart of accounts
        EXISTS (
            SELECT 1 FROM numerizamauth na
            WHERE na.auth_user_id = auth.uid() 
            AND na.email = 'shuvo@admin.com' 
            AND na.role = 'Admin' 
            AND na.is_approved = true
        )
        OR
        -- Regular users can access their company chart of accounts
        company_id IN (
            SELECT c.id FROM companies c
            JOIN numerizamauth au ON au.company_name = c.name
            WHERE au.auth_user_id = auth.uid() AND au.is_approved = true
        )
    );

-- General Ledger table policies
DROP POLICY IF EXISTS "Users can access their company general ledger" ON generalledger;

CREATE POLICY "Users can access their company general ledger OR super admin can access all" ON generalledger
    FOR ALL USING (
        -- Super admin can access all general ledger entries
        EXISTS (
            SELECT 1 FROM numerizamauth na
            WHERE na.auth_user_id = auth.uid() 
            AND na.email = 'shuvo@admin.com' 
            AND na.role = 'Admin' 
            AND na.is_approved = true
        )
        OR
        -- Regular users can access their company general ledger
        company_id IN (
            SELECT c.id FROM companies c
            JOIN numerizamauth au ON au.company_name = c.name
            WHERE au.auth_user_id = auth.uid() AND au.is_approved = true
        )
    );

-- Verify the setup
SELECT 'Setup completed for super admin: shuvo@admin.com' as status;