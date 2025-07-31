const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Supabase configuration
const supabaseUrl = 'https://rbelmynhqpfmkmwcegrn.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiZWxteW5ocXBmbWttd2NlZ3JuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDU5NzI5NywiZXhwIjoyMDUwMTczMjk3fQ.Ej_Ej6Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateSchema() {
    try {
        console.log('Reading SQL file...');
        const sqlContent = fs.readFileSync('./supabase_setup_corrected.sql', 'utf8');
        
        // Split SQL into individual statements
        const statements = sqlContent
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
        
        console.log(`Found ${statements.length} SQL statements to execute...`);
        
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (statement.trim()) {
                console.log(`Executing statement ${i + 1}/${statements.length}...`);
                console.log(`Statement: ${statement.substring(0, 100)}...`);
                
                const { data, error } = await supabase.rpc('exec_sql', {
                    sql_query: statement + ';'
                });
                
                if (error) {
                    console.error(`Error executing statement ${i + 1}:`, error);
                    // Continue with next statement
                } else {
                    console.log(`Statement ${i + 1} executed successfully`);
                }
            }
        }
        
        console.log('Schema update completed!');
        
    } catch (error) {
        console.error('Error updating schema:', error);
    }
}

updateSchema();