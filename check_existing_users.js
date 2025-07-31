import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiZWxteW5ocXBmbWttd2NlZ3JuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI3NzIyMywiZXhwIjoyMDY4ODUzMjIzfQ.FXGbrdKXYCl8z553690Yri7gwwXmkwmbaoA4vTobeKk'; // Service role key for admin operations

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function checkExistingUsers() {
    try {
        console.log('🔍 Checking existing users in auth.users...');
        
        // List all users using admin API
        const { data: users, error } = await supabase.auth.admin.listUsers();
        
        if (error) {
            console.error('❌ Error listing users:', error);
            return;
        }
        
        console.log(`📊 Found ${users.users.length} users in auth.users:`);
        users.users.forEach((user, index) => {
            console.log(`${index + 1}. ID: ${user.id}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Created: ${user.created_at}`);
            console.log(`   Email Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`);
            console.log('   ---');
        });
        
        // Check numerizamauth table
        console.log('\n🔍 Checking numerizamauth table...');
        const { data: profiles, error: profileError } = await supabase
            .from('numerizamauth')
            .select('*');
            
        if (profileError) {
            console.error('❌ Error querying numerizamauth:', profileError);
        } else {
            console.log(`📊 Found ${profiles.length} profiles in numerizamauth:`);
            profiles.forEach((profile, index) => {
                console.log(`${index + 1}. ID: ${profile.id}`);
                console.log(`   Email: ${profile.email}`);
                console.log(`   Name: ${profile.name}`);
                console.log(`   Role: ${profile.role}`);
                console.log('   ---');
            });
        }
        
    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

checkExistingUsers();