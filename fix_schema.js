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

async function fixDatabaseSchema() {
    try {
        console.log('Fixing database schema...');
        
        // Step 1: Backup existing data
        const { data: existingData, error: backupError } = await supabase
            .from('numerizamauth')
            .select('*');
        
        if (backupError) {
            console.error('Error backing up data:', backupError);
            return;
        }
        
        console.log('Backed up existing data:', existingData);
        
        // Step 2: Drop the existing table
        const { error: dropError } = await supabase.rpc('exec_sql', {
            sql_query: 'DROP TABLE IF EXISTS numerizamauth CASCADE;'
        });
        
        if (dropError) {
            console.error('Error dropping table:', dropError);
        } else {
            console.log('Dropped existing numerizamauth table');
        }
        
        // Step 3: Create the new table with correct structure
        const createTableSQL = `
            CREATE TABLE numerizamauth (
                id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                company_name VARCHAR(255) NOT NULL,
                country VARCHAR(100) NOT NULL,
                region VARCHAR(100) NOT NULL,
                role VARCHAR(50) DEFAULT 'Accountant' CHECK (role IN ('Accountant', 'Admin')),
                is_approved BOOLEAN DEFAULT FALSE,
                approved_by UUID REFERENCES auth.users(id),
                approved_at TIMESTAMP WITH TIME ZONE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `;
        
        const { error: createError } = await supabase.rpc('exec_sql', {
            sql_query: createTableSQL
        });
        
        if (createError) {
            console.error('Error creating table:', createError);
        } else {
            console.log('Created new numerizamauth table');
        }
        
        // Step 4: Enable RLS
        const { error: rlsError } = await supabase.rpc('exec_sql', {
            sql_query: 'ALTER TABLE numerizamauth ENABLE ROW LEVEL SECURITY;'
        });
        
        if (rlsError) {
            console.error('Error enabling RLS:', rlsError);
        } else {
            console.log('Enabled RLS on numerizamauth table');
        }
        
        // Step 5: Create RLS policies
        const policies = [
            `CREATE POLICY "Users can view their own profile" ON numerizamauth FOR SELECT USING (id = auth.uid());`,
            `CREATE POLICY "Users can insert their own profile" ON numerizamauth FOR INSERT WITH CHECK (id = auth.uid());`,
            `CREATE POLICY "Users can update their own profile" ON numerizamauth FOR UPDATE USING (id = auth.uid());`
        ];
        
        for (const policy of policies) {
            const { error: policyError } = await supabase.rpc('exec_sql', {
                sql_query: policy
            });
            
            if (policyError) {
                console.error('Error creating policy:', policyError);
            } else {
                console.log('Created RLS policy');
            }
        }
        
        // Step 6: Create updated_at trigger
        const triggerSQL = `
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = NOW();
                RETURN NEW;
            END;
            $$ language 'plpgsql';
            
            CREATE TRIGGER update_numerizamauth_updated_at 
                BEFORE UPDATE ON numerizamauth 
                FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        `;
        
        const { error: triggerError } = await supabase.rpc('exec_sql', {
            sql_query: triggerSQL
        });
        
        if (triggerError) {
            console.error('Error creating trigger:', triggerError);
        } else {
            console.log('Created updated_at trigger');
        }
        
        console.log('Database schema fixed successfully!');
        console.log('Now you need to create a new admin user.');
        
    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

fixDatabaseSchema();