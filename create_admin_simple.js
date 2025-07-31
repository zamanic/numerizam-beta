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

async function createAdminUserSimple() {
    try {
        console.log('Creating admin user...');
        
        // First, create the user in auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: 'shuvo@admin.com',
            password: '123456',
            email_confirm: true
        });
        
        if (authError) {
            console.error('Auth error:', authError);
            return;
        }
        
        console.log('User created in auth:', authData.user.id);
        
        // Now create/update the profile in numerizamauth table
        const { data: profileData, error: profileError } = await supabase
            .from('numerizamauth')
            .upsert({
                id: authData.user.id,
                name: 'Admin User',
                email: 'shuvo@admin.com',
                company_name: 'Test Company',
                country: 'USA',
                region: 'North America',
                role: 'Admin',
                is_approved: true,
                approved_at: new Date().toISOString()
            });
        
        if (profileError) {
            console.error('Profile error:', profileError);
            return;
        }
        
        console.log('Admin user created successfully!');
        console.log('Email: shuvo@admin.com');
        console.log('Password: 123456');
        
    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

createAdminUserSimple();