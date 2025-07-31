-- Supabase Database Setup Script for Numerizam Accounting System
-- Run this script in your Supabase SQL Editor to create the required tables

-- Enable Row Level Security (RLS) for all tables
-- This ensures data security and proper access control

-- 1. Companies Table
CREATE TABLE IF NOT EXISTS companies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL,
    region VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(name, country, region)
);

-- 2. Territory Table
CREATE TABLE IF NOT EXISTS territory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    country VARCHAR(100) NOT NULL,
    region VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, country, region)
);

-- 3. Calendar Table
CREATE TABLE IF NOT EXISTS calendar (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    quarter INTEGER NOT NULL CHECK (quarter >= 1 AND quarter <= 4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, year, quarter)
);

-- 4. Chart of Accounts Table
CREATE TABLE IF NOT EXISTS chartofaccounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    account_key VARCHAR(50) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    account_type VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, account_key)
);

-- 5. General Ledger Table
CREATE TABLE IF NOT EXISTS generalledger (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    calendar_id UUID REFERENCES calendar(id) ON DELETE CASCADE,
    chartofaccounts_id UUID REFERENCES chartofaccounts(id) ON DELETE CASCADE,
    territory_id UUID REFERENCES territory(id) ON DELETE CASCADE,
    transaction_date DATE NOT NULL,
    description TEXT NOT NULL,
    debit_amount DECIMAL(15,2) DEFAULT 0,
    credit_amount DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (debit_amount >= 0 AND credit_amount >= 0),
    CHECK (debit_amount > 0 OR credit_amount > 0)
);

-- 6. Accountant Users Table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS numerizamauth (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    company_name VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL,
    region VARCHAR(100) NOT NULL,
    role VARCHAR(50) DEFAULT 'Accountant' CHECK (role IN ('Accountant', 'Admin')),
    is_approved BOOLEAN DEFAULT FALSE,
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
CREATE INDEX IF NOT EXISTS idx_companies_country_region ON companies(country, region);
CREATE INDEX IF NOT EXISTS idx_territory_company ON territory(company_id);
CREATE INDEX IF NOT EXISTS idx_calendar_company ON calendar(company_id);
CREATE INDEX IF NOT EXISTS idx_chartofaccounts_company ON chartofaccounts(company_id);
CREATE INDEX IF NOT EXISTS idx_chartofaccounts_key ON chartofaccounts(account_key);
CREATE INDEX IF NOT EXISTS idx_generalledger_company ON generalledger(company_id);
CREATE INDEX IF NOT EXISTS idx_generalledger_date ON generalledger(transaction_date);
CREATE INDEX IF NOT EXISTS idx_numerizamauth_email ON numerizamauth(email);
CREATE INDEX IF NOT EXISTS idx_numerizamauth_approval ON numerizamauth(is_approved);

-- Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE territory ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE chartofaccounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE generalledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE numerizamauth ENABLE ROW LEVEL SECURITY;

-- RLS Policies for companies table
CREATE POLICY "Users can view their own company" ON companies
    FOR SELECT USING (
        id IN (
            SELECT c.id FROM companies c
            JOIN numerizamauth au ON au.company_name = c.name
            WHERE au.id = auth.uid() AND au.is_approved = true
        )
    );

CREATE POLICY "Approved users can insert companies" ON companies
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM numerizamauth
            WHERE id = auth.uid() AND is_approved = true
        )
    );

-- RLS Policies for numerizamauth table
CREATE POLICY "Users can view their own profile" ON numerizamauth
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON numerizamauth
    FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON numerizamauth
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admins can view all users" ON numerizamauth
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM numerizamauth
            WHERE id = auth.uid() AND role = 'Admin' AND is_approved = true
        )
    );

CREATE POLICY "Admins can update user approvals" ON numerizamauth
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM numerizamauth
            WHERE id = auth.uid() AND role = 'Admin' AND is_approved = true
        )
    );

-- RLS Policies for other tables (users can only access data for their company)
CREATE POLICY "Users can access their company territory" ON territory
    FOR ALL USING (
        company_id IN (
            SELECT c.id FROM companies c
            JOIN numerizamauth au ON au.company_name = c.name
            WHERE au.id = auth.uid() AND au.is_approved = true
        )
    );

CREATE POLICY "Users can access their company calendar" ON calendar
    FOR ALL USING (
        company_id IN (
            SELECT c.id FROM companies c
            JOIN numerizamauth au ON au.company_name = c.name
            WHERE au.id = auth.uid() AND au.is_approved = true
        )
    );

CREATE POLICY "Users can access their company chart of accounts" ON chartofaccounts
    FOR ALL USING (
        company_id IN (
            SELECT c.id FROM companies c
            JOIN numerizamauth au ON au.company_name = c.name
            WHERE au.id = auth.uid() AND au.is_approved = true
        )
    );

CREATE POLICY "Users can access their company general ledger" ON generalledger
    FOR ALL USING (
        company_id IN (
            SELECT c.id FROM companies c
            JOIN numerizamauth au ON au.company_name = c.name
            WHERE au.id = auth.uid() AND au.is_approved = true
        )
    );

-- Insert a default admin user (you'll need to update this with your actual admin user ID)
-- First, create an admin user through Supabase Auth, then run this:
-- INSERT INTO numerizamauth (id, name, email, company_name, country, region, role, is_approved)
-- VALUES ('your-admin-user-id-here', 'Admin User', 'admin@numerizam.com', 'Numerizam', 'Global', 'Global', 'Admin', true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all tables
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_territory_updated_at BEFORE UPDATE ON territory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_calendar_updated_at BEFORE UPDATE ON calendar FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chartofaccounts_updated_at BEFORE UPDATE ON chartofaccounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_generalledger_updated_at BEFORE UPDATE ON generalledger FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_numerizamauth_updated_at BEFORE UPDATE ON numerizamauth FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();