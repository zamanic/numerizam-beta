-- CRITICAL SCHEMA FIXES for Numerizam Accounting System
-- Run these commands in your Supabase SQL Editor

-- 1. Add missing 'type' field to generalledger table
ALTER TABLE generalledger 
ADD COLUMN IF NOT EXISTS type VARCHAR(10) CHECK (type IN ('Debit', 'Credit'));

-- 2. Update existing records to have proper type values (if any exist)
-- You'll need to determine the logic for existing records
-- For now, this sets a default that you can update manually
UPDATE generalledger SET type = 'Debit' WHERE type IS NULL AND amount > 0;

-- 3. Make the type field NOT NULL after setting values
ALTER TABLE generalledger 
ALTER COLUMN type SET NOT NULL;

-- 4. Ensure proper foreign key constraints for territory_key
-- The current schema should already have this, but let's verify:
-- ALTER TABLE generalledger 
-- ADD CONSTRAINT fk_generalledger_territory 
-- FOREIGN KEY (company_id, territory_key) 
-- REFERENCES territory(company_id, territory_key);

-- 5. Add indexes for better performance on the new type field
CREATE INDEX IF NOT EXISTS idx_generalledger_type ON generalledger(type);
CREATE INDEX IF NOT EXISTS idx_generalledger_company_type ON generalledger(company_id, type);

-- 6. Verify the schema matches expectations
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'generalledger' 
ORDER BY ordinal_position;