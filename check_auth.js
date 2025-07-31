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

async function checkAuthSchema() {
    try {
        console.log('Checking auth schema...');
        
        // Try to list users in auth.users
        const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
        
        if (usersError) {
            console.error('Error listing users:', usersError);
        } else {
            console.log('Found users:', users.users.length);
            users.users.forEach(user => {
                console.log(`- ${user.email} (ID: ${user.id})`);
            });
        }
        
        // Try to execute a simple SQL query
        const { data: result, error: sqlError } = await supabase.rpc('exec_sql', {
            sql_query: 'SELECT current_database(), current_schema();'
        });
        
        if (sqlError) {
            console.error('SQL execution error:', sqlError);
        } else {
            console.log('SQL execution successful:', result);
        }
        
    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

checkAuthSchema();