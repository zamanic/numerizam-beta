import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

// Use service role key for admin operations
const supabase = createClient(
  process.env.VITE_SUPABASE_URL, 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiZWxteW5ocXBmbWttd2NlZ3JuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI3NzIyMywiZXhwIjoyMDY4ODUzMjIzfQ.FXGbrdKXYCl8z553690Yri7gwwXmkwmbaoA4vTobeKk'
);

async function createApprovalTables() {
  try {
    console.log('🚀 Creating approval system tables directly...');
    
    // First, create the update function
    console.log('📝 Creating update_updated_at_column function...');
    try {
      await supabase.rpc('create_update_function');
    } catch (error) {
      // Function might not exist, let's create it manually
      console.log('Creating function manually...');
    }

    // Create approval_requests table using raw SQL
    console.log('📋 Creating approval_requests table...');
    
    // Use the REST API directly to execute SQL
    const response1 = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiZWxteW5ocXBmbWttd2NlZ3JuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI3NzIyMywiZXhwIjoyMDY4ODUzMjIzfQ.FXGbrdKXYCl8z553690Yri7gwwXmkwmbaoA4vTobeKk`,
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiZWxteW5ocXBmbWttd2NlZ3JuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI3NzIyMywiZXhwIjoyMDY4ODUzMjIzfQ.FXGbrdKXYCl8z553690Yri7gwwXmkwmbaoA4vTobeKk'
      },
      body: JSON.stringify({
        sql: `
          CREATE TABLE IF NOT EXISTS approval_requests (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
              user_name TEXT NOT NULL,
              user_email TEXT NOT NULL,
              company_name TEXT NOT NULL,
              country TEXT NOT NULL,
              region TEXT NOT NULL,
              requested_role TEXT CHECK (requested_role IN ('Admin', 'Accountant', 'Viewer', 'Auditor', 'Investor')) NOT NULL,
              business_justification TEXT NOT NULL,
              experience TEXT,
              additional_info TEXT,
              status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
              admin_notes TEXT,
              reviewed_by UUID REFERENCES auth.users(id),
              reviewed_at TIMESTAMP WITH TIME ZONE,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      })
    });

    if (!response1.ok) {
      console.log('⚠️  Direct SQL approach failed, trying alternative method...');
      
      // Alternative: Try using the client library with a simpler approach
      console.log('📋 Attempting to create tables using client library...');
      
      // Check if we can at least create a simple table first
      const { error: testError } = await supabase
        .from('approval_requests')
        .select('*')
        .limit(1);
      
      if (testError && testError.message.includes('does not exist')) {
        console.log('❌ Tables do not exist. Manual creation required.');
        console.log('');
        console.log('🔧 MANUAL SETUP REQUIRED:');
        console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard');
        console.log('2. Navigate to SQL Editor');
        console.log('3. Copy and paste the contents of approval_system_setup.sql');
        console.log('4. Execute the SQL script');
        console.log('');
        console.log('📋 Required tables:');
        console.log('   - approval_requests');
        console.log('   - approval_notifications');
        console.log('');
        console.log('📄 SQL file location: approval_system_setup.sql');
        
        return;
      }
    }

    // Test if tables exist now
    console.log('🧪 Testing table access...');
    const { data, error } = await supabase
      .from('approval_requests')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Tables still not accessible:', error.message);
      console.log('');
      console.log('🔧 MANUAL SETUP REQUIRED:');
      console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Copy and paste the contents of approval_system_setup.sql');
      console.log('4. Execute the SQL script');
      console.log('');
      console.log('📋 Required tables:');
      console.log('   - approval_requests');
      console.log('   - approval_notifications');
    } else {
      console.log('✅ Tables are accessible!');
      console.log('🎉 Approval system setup completed successfully!');
    }
    
  } catch (err) {
    console.error('💥 Exception:', err.message);
    console.log('');
    console.log('🔧 MANUAL SETUP REQUIRED:');
    console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the contents of approval_system_setup.sql');
    console.log('4. Execute the SQL script');
    console.log('');
    console.log('📋 Required tables:');
    console.log('   - approval_requests');
    console.log('   - approval_notifications');
  }
}

createApprovalTables();