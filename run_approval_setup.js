import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

dotenv.config();

// Use service role key for admin operations
const supabase = createClient(
  process.env.VITE_SUPABASE_URL, 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiZWxteW5ocXBmbWttd2NlZ3JuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI3NzIyMywiZXhwIjoyMDY4ODUzMjIzfQ.FXGbrdKXYCl8z553690Yri7gwwXmkwmbaoA4vTobeKk'
);

async function runApprovalSetup() {
  try {
    console.log('📋 Reading approval system setup SQL...');
    
    const sqlContent = fs.readFileSync('approval_system_setup.sql', 'utf8');

    console.log('⚡ Executing approval system SQL via RPC exec_sql...');

    // Execute the entire SQL script in one call using the exec_sql RPC
    const { data: execResult, error: execError } = await supabase.rpc('exec_sql', { 
      sql_query: sqlContent 
    });

    if (execError) {
      console.log('❌ SQL execution error:', execError.message || execError);
    } else {
      console.log('✅ SQL executed successfully');
      if (execResult) {
        console.log('ℹ️ exec_sql result:', JSON.stringify(execResult).slice(0, 500));
      }
    }
    
    // Test if tables are now accessible
    console.log('🧪 Testing table access...');
    const { data, error } = await supabase
      .from('approval_requests')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Tables still not accessible:', error.message);
      console.log('🔧 Please run the SQL manually in Supabase dashboard');
    } else {
      console.log('✅ approval_requests table is accessible!');
      console.log('📊 Current approval_requests count (sample size):', data.length);
    }

    // Also verify approval_notifications
    const { data: notifData, error: notifError } = await supabase
      .from('approval_notifications')
      .select('*')
      .limit(1);

    if (notifError) {
      console.log('❌ approval_notifications table not accessible:', notifError.message);
    } else {
      console.log('✅ approval_notifications table is accessible!');
      console.log('📊 Current approval_notifications count (sample size):', notifData.length);
    }
    
  } catch (err) {
    console.error('💥 Exception:', err.message);
    console.log('🔧 Please run the approval_system_setup.sql manually in Supabase dashboard');
  }
}

runApprovalSetup();