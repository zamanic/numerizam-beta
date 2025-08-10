# Manual SQL Function Deployment Instructions

## Issue
The dashboard is showing 404 errors for the financial metrics functions because they haven't been deployed to your Supabase database yet.

## Error Messages You're Seeing
```
POST https://rbelmynhqpfmkmwcegrn.supabase.co/rest/v1/rpc/get_current_year_expenses 404 (Not Found)
Error: Could not find the function public.get_current_year_expenses without parameters in the schema cache
```

## Solution: Manual Deployment

Since the automated deployment script is encountering API key issues, please follow these steps to manually deploy the functions:

### Step 1: Access Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Select your project (rbelmynhqpfmkmwcegrn)

### Step 2: Open SQL Editor
1. In the left sidebar, click on "SQL Editor"
2. Click "New Query" to create a new SQL query

### Step 3: Copy and Execute SQL Functions
1. Open the file `financial_metrics_functions.sql` in your project
2. Copy the entire contents of the file
3. Paste it into the SQL Editor in Supabase
4. Click "Run" to execute the SQL

### Step 4: Verify Deployment
After running the SQL, you should see success messages. The following functions will be created:

- `get_current_year_expenses()` - Returns current year total expenses
- `get_current_year_profit()` - Returns current year profit (revenue - expenses)  
- `get_current_year_cash_flow()` - Returns current year cash flow
- `get_expenses_growth()` - Returns expenses growth percentage vs previous year
- `get_profit_growth()` - Returns profit growth percentage vs previous year
- `get_cash_flow_growth()` - Returns cash flow growth percentage vs previous year

### Step 5: Test the Functions
You can test the functions in the SQL Editor by running:

```sql
-- Test individual functions
SELECT get_current_year_expenses();
SELECT get_current_year_profit();
SELECT get_current_year_cash_flow();

-- Test growth functions
SELECT * FROM get_expenses_growth();
SELECT * FROM get_profit_growth();
SELECT * FROM get_cash_flow_growth();
```

### Step 6: Refresh Your Dashboard
After successfully deploying the functions:
1. Go back to your dashboard at http://localhost:5173/app
2. Refresh the page
3. The 404 errors should be resolved and real data should display

## Division by Zero Handling
The functions have been updated to handle division by zero cases properly:
- When previous year value is 0 and current year has a positive value, it shows "∞%" 
- When there's no previous year data, it shows "N/A"
- Uses `NULLIF()` to prevent division by zero errors

## Troubleshooting
If you still see errors after deployment:
1. Check that all functions were created successfully in the Supabase dashboard
2. Verify that the `authenticated` role has EXECUTE permissions on the functions
3. Make sure your application is using the correct Supabase URL and API keys
4. Check the browser console for any additional error details

## Alternative: Use Existing Revenue Function
If you continue having issues, you can temporarily modify the dashboard to use the existing `get_revenue_by_year` function that was mentioned in the error hint, though this would require updating the service calls in the code.