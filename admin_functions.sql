-- Admin Functions for Numerizam Accounting System
-- Run these commands in your Supabase SQL Editor

-- Create a stored procedure for truncating tables safely
-- This function can only be executed by authenticated users with the 'authenticated' role
CREATE OR REPLACE FUNCTION admin_truncate_table(table_name TEXT)
RETURNS VOID AS $$
BEGIN
    -- Validate table name to prevent SQL injection
    IF table_name NOT IN ('calendar', 'chartofaccounts', 'generalledger', 'territory') THEN
        RAISE EXCEPTION 'Invalid table name. Only calendar, chartofaccounts, generalledger, and territory tables can be truncated.';
    END IF;
    
    -- Execute the truncate command with CASCADE to handle foreign key constraints
    EXECUTE format('TRUNCATE TABLE %I CASCADE', table_name);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RLS policy to restrict this function to authenticated users
REVOKE ALL ON FUNCTION admin_truncate_table(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION admin_truncate_table(TEXT) TO authenticated;

-- Comment on function
COMMENT ON FUNCTION admin_truncate_table(TEXT) IS 'Admin function to safely truncate specific tables. This is a destructive operation that removes all data from the specified table.';