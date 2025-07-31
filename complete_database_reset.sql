-- COMPLETE CLEANUP AND SETUP SCRIPT
-- This script will clean up everything and set up a fresh database

-- 1. First, let's clean up any existing users and data
-- Note: This should be run in Supabase Dashboard SQL Editor

-- Drop all existing tables and start fresh
DROP TABLE IF EXISTS generalledger CASCADE;
DROP TABLE IF EXISTS chartofaccounts CASCADE;
DROP TABLE IF EXISTS calendar CASCADE;
DROP TABLE IF EXISTS territory CASCADE;
DROP TABLE IF EXISTS numerizamauth CASCADE;
DROP TABLE IF EXISTS companies CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Companies Table
CREATE TABLE companies (
    company_id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Territory Table
CREATE TABLE territory (
    territory_key SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(company_id) ON DELETE CASCADE,
    country VARCHAR(100) NOT NULL,
    region VARCHAR(100) NOT NULL,
    UNIQUE(company_id, territory_key)
);

-- 3. Calendar Table
CREATE TABLE calendar (
    calendar_id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(company_id) ON DELETE CASCADE,
    date DATE NOT NULL,
    year INTEGER NOT NULL,
    quarter VARCHAR(10) NOT NULL,
    month VARCHAR(20) NOT NULL,
    day VARCHAR(20) NOT NULL,
    UNIQUE(company_id, date)
);

-- 4. Chart of Accounts Table
CREATE TABLE chartofaccounts (
    account_key INTEGER NOT NULL,
    company_id INTEGER NOT NULL REFERENCES companies(company_id) ON DELETE CASCADE,
    report VARCHAR(100) NOT NULL,
    class VARCHAR(100) NOT NULL,
    subclass VARCHAR(100) NOT NULL,
    subclass2 VARCHAR(100),
    account VARCHAR(255) NOT NULL,
    subaccount VARCHAR(255),
    PRIMARY KEY (company_id, account_key)
);

-- 5. General Ledger Table
CREATE TABLE generalledger (
    entryno SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(company_id) ON DELETE CASCADE,
    date DATE NOT NULL,
    calendar_id INTEGER,
    territory_key INTEGER,
    account_key INTEGER NOT NULL,
    details TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('Debit', 'Credit')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (calendar_id) REFERENCES calendar(calendar_id),
    FOREIGN KEY (territory_key) REFERENCES territory(territory_key),
    FOREIGN KEY (company_id, account_key) REFERENCES chartofaccounts(company_id, account_key)
);

-- 6. Numerizam Authentication Table (properly integrates with Supabase Auth)
CREATE TABLE numerizamauth (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    company_name TEXT NOT NULL,
    country TEXT DEFAULT 'Global',
    region TEXT DEFAULT 'Global',
    role TEXT CHECK (role IN ('Admin', 'Accountant', 'Viewer', 'Auditor', 'Investor')) NOT NULL,
    is_approved BOOLEAN DEFAULT false,
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_numerizamauth_updated_at
BEFORE UPDATE ON numerizamauth
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX idx_companies_name ON companies(company_name);
CREATE INDEX idx_territory_company ON territory(company_id);
CREATE INDEX idx_calendar_company ON calendar(company_id);
CREATE INDEX idx_chartofaccounts_company ON chartofaccounts(company_id);
CREATE INDEX idx_generalledger_company ON generalledger(company_id);
CREATE INDEX idx_generalledger_date ON generalledger(date);
CREATE INDEX idx_numerizamauth_email ON numerizamauth(email);
CREATE INDEX idx_numerizamauth_approval ON numerizamauth(is_approved);

-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE territory ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE chartofaccounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE generalledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE numerizamauth ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Allow all authenticated users" ON companies
FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all authenticated users" ON territory
FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all authenticated users" ON calendar
FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all authenticated users" ON chartofaccounts
FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all authenticated users" ON generalledger
FOR ALL USING (auth.role() = 'authenticated');

-- numerizamauth RLS Policies
CREATE POLICY "Users can view own profile" ON numerizamauth
FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can insert own profile" ON numerizamauth
FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update own profile" ON numerizamauth
FOR UPDATE USING (id = auth.uid());

-- Insert sample data
INSERT INTO companies (company_name) VALUES ('NEPCS');

INSERT INTO territory (company_id, country, region)
SELECT company_id, 'Bangladesh', 'Asia'
FROM companies WHERE company_name = 'NEPCS';

INSERT INTO calendar (company_id, date, year, quarter, month, day)
SELECT company_id, '2022-04-01', 2022, 'Q2', 'April', 'Friday'
FROM companies WHERE company_name = 'NEPCS';

INSERT INTO calendar (company_id, date, year, quarter, month, day)
SELECT company_id, '2022-04-02', 2022, 'Q2', 'April', 'Saturday'
FROM companies WHERE company_name = 'NEPCS';

INSERT INTO chartofaccounts (company_id, account_key, report, class, subclass, subclass2, account, subaccount)
SELECT company_id, 1010, 'Balance Sheet', 'Assets', 'Current Assets', 'Current Assets', 'Cash', 'Cash'
FROM companies WHERE company_name = 'NEPCS';

INSERT INTO chartofaccounts (company_id, account_key, report, class, subclass, subclass2, account, subaccount)
SELECT company_id, 3010, 'Balance Sheet', 'Equity', 'Owner''s Equity', 'Capital', 'Common Stock', 'Common Stock'
FROM companies WHERE company_name = 'NEPCS';

-- Sample GL Entries
INSERT INTO generalledger (
    company_id, date, calendar_id, territory_key, account_key, details, amount, type
)
SELECT
    c.company_id, '2022-04-01', cal.calendar_id, t.territory_key, 1010,
    'Initial cash investment to start business', 500000.0, 'Debit'
FROM companies c
JOIN calendar cal ON cal.company_id = c.company_id AND cal.date = '2022-04-01'
JOIN territory t ON t.company_id = c.company_id
WHERE c.company_name = 'NEPCS';

INSERT INTO generalledger (
    company_id, date, calendar_id, territory_key, account_key, details, amount, type
)
SELECT
    c.company_id, '2022-04-01', cal.calendar_id, t.territory_key, 3010,
    'Common stock issued for cash investment', 500000.0, 'Credit'
FROM companies c
JOIN calendar cal ON cal.company_id = c.company_id AND cal.date = '2022-04-01'
JOIN territory t ON t.company_id = c.company_id
WHERE c.company_name = 'NEPCS';

INSERT INTO generalledger (
    company_id, date, calendar_id, territory_key, account_key, details, amount, type
)
SELECT
    c.company_id, '2022-04-02', cal.calendar_id, t.territory_key, 1010,
    'Cash deposited into bank', 40000.0, 'Credit'
FROM companies c
JOIN calendar cal ON cal.company_id = c.company_id AND cal.date = '2022-04-02'
JOIN territory t ON t.company_id = c.company_id
WHERE c.company_name = 'NEPCS';

INSERT INTO generalledger (
    company_id, date, calendar_id, territory_key, account_key, details, amount, type
)
SELECT
    c.company_id, '2022-04-02', cal.calendar_id, t.territory_key, 1010,
    'Cash deposited into bank', 40000.0, 'Debit'
FROM companies c
JOIN calendar cal ON cal.company_id = c.company_id AND cal.date = '2022-04-02'
JOIN territory t ON t.company_id = c.company_id
WHERE c.company_name = 'NEPCS';