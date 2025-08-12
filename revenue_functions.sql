-- Revenue Functions for Numerizam Accounting System
-- Run these commands in your Supabase SQL Editor

-- Function 1: Get revenue by year
CREATE OR REPLACE FUNCTION get_revenue_by_year()
RETURNS TABLE (
    year INTEGER,
    sales NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        EXTRACT(YEAR FROM gl.date)::INTEGER AS "year",
        SUM(CASE WHEN coa.subclass = 'Operating Revenue' THEN gl.amount ELSE 0 END) AS "sales"
    FROM 
        generalledger gl
    JOIN 
        chartofaccounts coa ON gl.account_key = coa.account_key
    GROUP BY 
        EXTRACT(YEAR FROM gl.date)
    ORDER BY 
        EXTRACT(YEAR FROM gl.date);
END;
$$ LANGUAGE plpgsql;

-- Function 2: Get revenue growth for the last two years
CREATE OR REPLACE FUNCTION get_revenue_growth()
RETURNS TABLE (
    year INTEGER,
    current_year_sales TEXT,
    previous_year_sales TEXT,
    revenue_growth_percentage TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH yearly_sales AS (
        SELECT 
            EXTRACT(YEAR FROM gl.date)::INTEGER AS sales_year,
            SUM(gl.amount) AS total_sales
        FROM 
            generalledger gl
        JOIN 
            chartofaccounts coa ON gl.account_key = coa.account_key
        WHERE 
            coa.subclass = 'Operating Revenue'
        GROUP BY 
            EXTRACT(YEAR FROM gl.date)
    ),
    sales_with_previous_year AS (
        SELECT 
            sales_year,
            total_sales,
            LAG(total_sales, 1) OVER (ORDER BY sales_year) AS previous_year_sales
        FROM 
            yearly_sales
        ORDER BY 
            sales_year DESC
        LIMIT 2
    )
    SELECT 
        swpy.sales_year,
        TO_CHAR(swpy.total_sales, 'FM999G999G999') AS current_year_sales,
        TO_CHAR(swpy.previous_year_sales, 'FM999G999G999') AS previous_year_sales,
        CASE 
            WHEN swpy.previous_year_sales IS NOT NULL AND swpy.previous_year_sales <> 0 
            THEN TO_CHAR(((swpy.total_sales - swpy.previous_year_sales) / swpy.previous_year_sales) * 100, 'FM999G999D00') || '%'
            ELSE 'N/A'
        END AS revenue_growth_percentage
    FROM 
        sales_with_previous_year swpy
    ORDER BY 
        swpy.sales_year DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_revenue_by_year() TO authenticated;
GRANT EXECUTE ON FUNCTION get_revenue_growth() TO authenticated;