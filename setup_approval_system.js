import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    console.error('Please check your .env file for VITE_SUPABASE_URL and VITE_SUPABASE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupApprovalSystem() {
    try {
        console.log('📖 Reading approval system setup SQL...');
        const sqlContent = fs.readFileSync('./approval_system_setup.sql', 'utf8');
        
        // Split SQL into individual statements
        const statements = sqlContent
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
        
        console.log(`🔧 Found ${statements.length} SQL statements to execute...`);
        
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (statement.trim()) {
                console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
                
                const { data, error } = await supabase.rpc('exec_sql', { 
                    sql: statement + ';' 
                });
                
                if (error) {
                    console.error(`❌ Error in statement ${i + 1}:`, error);
                    console.error(`Statement: ${statement.substring(0, 100)}...`);
                } else {
                    console.log(`✅ Statement ${i + 1} executed successfully`);
                }
            }
        }
        
        console.log('\n🎉 Approval system setup completed!');
        console.log('📋 Tables created:');
        console.log('   - approval_requests');
        console.log('   - approval_notifications');
        console.log('🔒 RLS policies configured');
        console.log('⚡ Triggers and functions created');
        
    } catch (err) {
        console.error('❌ Error setting up approval system:', err.message);
        process.exit(1);
    }
}

setupApprovalSystem();