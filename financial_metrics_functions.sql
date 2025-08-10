-- Financial Metrics Functions for Numerizam Accounting System
-- Run these commands in your Supabase SQL Editor

-- Function 1: Get current year expenses
CREATE OR REPLACE FUNCTION get_current_year_expenses()
RETURNS NUMERIC AS $$
DECLARE
    current_year INTEGER;
    total_expenses NUMERIC;
BEGIN
    current_year := EXTRACT(YEAR FROM CURRENT_DATE);
    
    SELECT 
        COALESCE(SUM(gl.amount), 0)
    INTO total_expenses
    FROM 
        generalledger gl
    JOIN 
        chartofaccounts coa ON gl.account_key = coa.account_key
    WHERE 
        coa.subclass IN ('Operating Expenses', 'Cost of Goods Sold', 'Administrative Expenses', 'Selling Expenses')
        AND EXTRACT(YEAR FROM gl.date) = current_year;
    
    RETURN total_expenses;
END;
$$ LANGUAGE plpgsql;

-- Function 2: Get current year profit (Revenue - Expenses)
CREATE OR REPLACE FUNCTION get_current_year_profit()
RETURNS NUMERIC AS $$
DECLARE
    current_year INTEGER;
    total_revenue NUMERIC;
    total_expenses NUMERIC;
    profit NUMERIC;
BEGIN
    current_year := EXTRACT(YEAR FROM CURRENT_DATE);
    
    -- Get total revenue
    SELECT 
        COALESCE(SUM(gl.amount), 0)
    INTO total_revenue
    FROM 
        generalledger gl
    JOIN 
        chartofaccounts coa ON gl.account_key = coa.account_key
    WHERE 
        coa.subclass = 'Operating Revenue'
        AND EXTRACT(YEAR FROM gl.date) = current_year;
    
    -- Get total expenses
    SELECT 
        COALESCE(SUM(gl.amount), 0)
    INTO total_expenses
    FROM 
        generalledger gl
    JOIN 
        chartofaccounts coa ON gl.account_key = coa.account_key
    WHERE 
        coa.subclass IN ('Operating Expenses', 'Cost of Goods Sold', 'Administrative Expenses', 'Selling Expenses')
        AND EXTRACT(YEAR FROM gl.date) = current_year;
    
    profit := total_revenue - total_expenses;
    RETURN profit;
END;
$$ LANGUAGE plpgsql;

-- Function 3: Get current year cash flow (simplified as cash inflows - cash outflows)
CREATE OR REPLACE FUNCTION get_current_year_cash_flow()
RETURNS NUMERIC AS $$
DECLARE
    current_year INTEGER;
    cash_inflows NUMERIC;
    cash_outflows NUMERIC;
    cash_flow NUMERIC;
BEGIN
    current_year := EXTRACT(YEAR FROM CURRENT_DATE);
    
    -- Get cash inflows (Credits to cash accounts)
    SELECT 
        COALESCE(SUM(CASE WHEN gl.type = 'Credit' THEN gl.amount ELSE 0 END), 0)
    INTO cash_inflows
    FROM 
        generalledger gl
    JOIN 
        chartofaccounts coa ON gl.account_key = coa.account_key
    WHERE 
        coa.account ILIKE '%cash%' OR coa.account ILIKE '%bank%'
        AND EXTRACT(YEAR FROM gl.date) = current_year;
    
    -- Get cash outflows (Debits to cash accounts)
    SELECT 
        COALESCE(SUM(CASE WHEN gl.type = 'Debit' THEN gl.amount ELSE 0 END), 0)
    INTO cash_outflows
    FROM 
        generalledger gl
    JOIN 
        chartofaccounts coa ON gl.account_key = coa.account_key
    WHERE 
        coa.account ILIKE '%cash%' OR coa.account ILIKE '%bank%'
        AND EXTRACT(YEAR FROM gl.date) = current_year;
    
    cash_flow := cash_inflows - cash_outflows;
    RETURN cash_flow;
END;
$$ LANGUAGE plpgsql;

-- Function 4: Get expenses growth for the last two years
CREATE OR REPLACE FUNCTION get_expenses_growth()
RETURNS TABLE (
    year INTEGER,
    current_year_expenses TEXT,
    previous_year_expenses TEXT,
    expenses_growth_percentage TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH yearly_expenses AS (
        SELECT 
            EXTRACT(YEAR FROM gl.date)::INTEGER AS expense_year,
            SUM(gl.amount) AS total_expenses
        FROM 
            generalledger gl
        JOIN 
            chartofaccounts coa ON gl.account_key = coa.account_key
        WHERE 
            coa.subclass IN ('Operating Expenses', 'Cost of Goods Sold', 'Administrative Expenses', 'Selling Expenses')
        GROUP BY 
            EXTRACT(YEAR FROM gl.date)
    ),
    expenses_with_previous_year AS (
        SELECT 
            expense_year,
            total_expenses,
            LAG(total_expenses, 1) OVER (ORDER BY expense_year) AS previous_year_expenses
        FROM 
            yearly_expenses
        ORDER BY 
            expense_year DESC
        LIMIT 2
    )
    SELECT 
        ewpy.expense_year,
        TO_CHAR(ewpy.total_expenses, 'FM999G999G999') AS current_year_expenses,
        TO_CHAR(ewpy.previous_year_expenses, 'FM999G999G999') AS previous_year_expenses,
        CASE 
            WHEN ewpy.previous_year_expenses IS NOT NULL AND ewpy.previous_year_expenses <> 0 
            THEN TO_CHAR(((ewpy.total_expenses - ewpy.previous_year_expenses) / NULLIF(ewpy.previous_year_expenses, 0)) * 100, 'FM999G999D00') || '%'
            WHEN ewpy.previous_year_expenses = 0 AND ewpy.total_expenses > 0
            THEN '∞%'
            ELSE 'N/A'
        END AS expenses_growth_percentage
    FROM 
        expenses_with_previous_year ewpy
    ORDER BY 
        ewpy.expense_year DESC;
END;
$$ LANGUAGE plpgsql;

-- Function 5: Get profit growth for the last two years
CREATE OR REPLACE FUNCTION get_profit_growth()
RETURNS TABLE (
    year INTEGER,
    current_year_profit TEXT,
    previous_year_profit TEXT,
    profit_growth_percentage TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH yearly_profit AS (
        SELECT 
            EXTRACT(YEAR FROM gl.date)::INTEGER AS profit_year,
            (
                SUM(CASE WHEN coa.subclass = 'Operating Revenue' THEN gl.amount ELSE 0 END) -
                SUM(CASE WHEN coa.subclass IN ('Operating Expenses', 'Cost of Goods Sold', 'Administrative Expenses', 'Selling Expenses') THEN gl.amount ELSE 0 END)
            ) AS total_profit
        FROM 
            generalledger gl
        JOIN 
            chartofaccounts coa ON gl.account_key = coa.account_key
        GROUP BY 
            EXTRACT(YEAR FROM gl.date)
    ),
    profit_with_previous_year AS (
        SELECT 
            profit_year,
            total_profit,
            LAG(total_profit, 1) OVER (ORDER BY profit_year) AS previous_year_profit
        FROM 
            yearly_profit
        ORDER BY 
            profit_year DESC
        LIMIT 2
    )
    SELECT 
        pwpy.profit_year,
        TO_CHAR(pwpy.total_profit, 'FM999G999G999') AS current_year_profit,
        TO_CHAR(pwpy.previous_year_profit, 'FM999G999G999') AS previous_year_profit,
        CASE 
            WHEN pwpy.previous_year_profit IS NOT NULL AND pwpy.previous_year_profit <> 0 
            THEN TO_CHAR(((pwpy.total_profit - pwpy.previous_year_profit) / NULLIF(pwpy.previous_year_profit, 0)) * 100, 'FM999G999D00') || '%'
            WHEN pwpy.previous_year_profit = 0 AND pwpy.total_profit > 0
            THEN '∞%'
            ELSE 'N/A'
        END AS profit_growth_percentage
    FROM 
        profit_with_previous_year pwpy
    ORDER BY 
        pwpy.profit_year DESC;
END;
$$ LANGUAGE plpgsql;

-- Function 6: Get cash flow growth for the last two years
CREATE OR REPLACE FUNCTION get_cash_flow_growth()
RETURNS TABLE (
    year INTEGER,
    current_year_cash_flow TEXT,
    previous_year_cash_flow TEXT,
    cash_flow_growth_percentage TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH yearly_cash_flow AS (
        SELECT 
            EXTRACT(YEAR FROM gl.date)::INTEGER AS cash_flow_year,
            (
                SUM(CASE WHEN gl.type = 'Credit' AND (coa.account ILIKE '%cash%' OR coa.account ILIKE '%bank%') THEN gl.amount ELSE 0 END) -
                SUM(CASE WHEN gl.type = 'Debit' AND (coa.account ILIKE '%cash%' OR coa.account ILIKE '%bank%') THEN gl.amount ELSE 0 END)
            ) AS total_cash_flow
        FROM 
            generalledger gl
        JOIN 
            chartofaccounts coa ON gl.account_key = coa.account_key
        GROUP BY 
            EXTRACT(YEAR FROM gl.date)
    ),
    cash_flow_with_previous_year AS (
        SELECT 
            cash_flow_year,
            total_cash_flow,
            LAG(total_cash_flow, 1) OVER (ORDER BY cash_flow_year) AS previous_year_cash_flow
        FROM 
            yearly_cash_flow
        ORDER BY 
            cash_flow_year DESC
        LIMIT 2
    )
    SELECT 
        cfwpy.cash_flow_year,
        TO_CHAR(cfwpy.total_cash_flow, 'FM999G999G999') AS current_year_cash_flow,
        TO_CHAR(cfwpy.previous_year_cash_flow, 'FM999G999G999') AS previous_year_cash_flow,
        CASE 
            WHEN cfwpy.previous_year_cash_flow IS NOT NULL AND cfwpy.previous_year_cash_flow <> 0 
            THEN TO_CHAR(((cfwpy.total_cash_flow - cfwpy.previous_year_cash_flow) / NULLIF(cfwpy.previous_year_cash_flow, 0)) * 100, 'FM999G999D00') || '%'
            WHEN cfwpy.previous_year_cash_flow = 0 AND cfwpy.total_cash_flow > 0
            THEN '∞%'
            ELSE 'N/A'
        END AS cash_flow_growth_percentage
    FROM 
        cash_flow_with_previous_year cfwpy
    ORDER BY 
        cfwpy.cash_flow_year DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_current_year_expenses() TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_year_profit() TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_year_cash_flow() TO authenticated;
GRANT EXECUTE ON FUNCTION get_expenses_growth() TO authenticated;
GRANT EXECUTE ON FUNCTION get_profit_growth() TO authenticated;
GRANT EXECUTE ON FUNCTION get_cash_flow_growth() TO authenticated;