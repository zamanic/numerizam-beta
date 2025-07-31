import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://rbelmynhqpfmkmwcegrn.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiZWxteW5ocXBmbWttd2NlZ3JuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI3NzIyMywiZXhwIjoyMDY4ODUzMjIzfQ.FXGbrdKXYCl8z553690Yri7gwwXmkwmbaoA4vTobeKk';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function checkDatabase() {
    try {
        console.log('Checking database structure...');
        
        // Check if numerizamauth table exists
        const { data: tables, error: tablesError } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public');
        
        if (tablesError) {
            console.error('Error checking tables:', tablesError);
        } else {
            console.log('Available tables:', tables.map(t => t.table_name));
        }
        
        // Try to check numerizamauth table structure
        const { data: columns, error: columnsError } = await supabase
            .from('information_schema.columns')
            .select('column_name, data_type')
            .eq('table_schema', 'public')
            .eq('table_name', 'numerizamauth');
        
        if (columnsError) {
            console.error('Error checking numerizamauth columns:', columnsError);
        } else {
            console.log('numerizamauth table columns:', columns);
        }
        
        // Try to query numerizamauth table directly
        const { data: authData, error: authError } = await supabase
            .from('numerizamauth')
            .select('*')
            .limit(1);
        
        if (authError) {
            console.error('Error querying numerizamauth:', authError);
        } else {
            console.log('numerizamauth query successful, sample data:', authData);
        }
        
    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

checkDatabase();