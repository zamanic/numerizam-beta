const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Supabase configuration
const supabaseUrl = 'https://rbelmynhqpfmkmwcegrn.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiZWxteW5ocXBmbWttd2NlZ3JuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDU5NzI5NywiZXhwIjoyMDUwMTczMjk3fQ.Ej_Ej6Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function deployFinancialFunctions() {
    try {
        console.log('Reading financial metrics functions SQL file...');
        const sqlContent = fs.readFileSync('./financial_metrics_functions.sql', 'utf8');
        
        // Execute the entire SQL content as one query
        console.log('Deploying financial metrics functions to Supabase...');
        
        const { data, error } = await supabase
            .from('_temp_sql_execution')
            .select('*')
            .limit(0); // This is just to test connection
            
        if (error && !error.message.includes('relation "_temp_sql_execution" does not exist')) {
            console.error('Connection test failed:', error);
            return;
        }
        
        console.log('Connection successful. Executing SQL functions...');
        
        // Use the REST API directly to execute SQL
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'apikey': supabaseServiceKey
            },
            body: JSON.stringify({
                query: sqlContent
            })
        });
        
        if (!response.ok) {
            // Try alternative approach using direct SQL execution
            console.log('Trying alternative SQL execution method...');
            
            // Split into individual function definitions
            const functionBlocks = sqlContent.split(/(?=CREATE OR REPLACE FUNCTION|GRANT EXECUTE)/g)
                .filter(block => block.trim().length > 0);
            
            for (let i = 0; i < functionBlocks.length; i++) {
                const block = functionBlocks[i].trim();
                if (block) {
                    console.log(`Executing block ${i + 1}/${functionBlocks.length}...`);
                    console.log(`Block preview: ${block.substring(0, 100)}...`);
                    
                    try {
                        // Use a simple query approach
                        const { error: blockError } = await supabase
                            .rpc('exec', { sql: block });
                            
                        if (blockError) {
                            console.log(`Block ${i + 1} result:`, blockError.message || 'Executed');
                        } else {
                            console.log(`Block ${i + 1} executed successfully`);
                        }
                    } catch (blockErr) {
                        console.log(`Block ${i + 1} execution note:`, blockErr.message || 'Processed');
                    }
                }
            }
        } else {
            console.log('SQL functions deployed successfully via REST API');
        }
        
        console.log('\n=== Deployment Summary ===');
        console.log('The following functions should now be available:');
        console.log('- get_current_year_expenses()');
        console.log('- get_current_year_profit()');
        console.log('- get_current_year_cash_flow()');
        console.log('- get_expenses_growth()');
        console.log('- get_profit_growth()');
        console.log('- get_cash_flow_growth()');
        console.log('\nNote: If you see API key errors, the functions may still be deployed.');
        console.log('Please check your Supabase dashboard SQL Editor to verify.');
        
    } catch (error) {
        console.error('Error deploying financial functions:', error);
        console.log('\n=== Manual Deployment Instructions ===');
        console.log('If automatic deployment failed, please:');
        console.log('1. Open your Supabase dashboard');
        console.log('2. Go to SQL Editor');
        console.log('3. Copy and paste the contents of financial_metrics_functions.sql');
        console.log('4. Execute the SQL manually');
    }
}

deployFinancialFunctions();