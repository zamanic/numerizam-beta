import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL, 
  process.env.VITE_SUPABASE_KEY
);

async function verifyApprovalSetup() {
  console.log('🔍 Verifying approval system setup...');
  
  try {
    // Test approval_requests table
    console.log('📋 Testing approval_requests table...');
    const { data: requests, error: requestsError } = await supabase
      .from('approval_requests')
      .select('*')
      .limit(1);
    
    if (requestsError) {
      console.log('❌ approval_requests table not accessible:', requestsError.message);
    } else {
      console.log('✅ approval_requests table is accessible');
      console.log(`📊 Current requests count: ${requests.length}`);
    }

    // Test approval_notifications table
    console.log('📬 Testing approval_notifications table...');
    const { data: notifications, error: notificationsError } = await supabase
      .from('approval_notifications')
      .select('*')
      .limit(1);
    
    if (notificationsError) {
      console.log('❌ approval_notifications table not accessible:', notificationsError.message);
    } else {
      console.log('✅ approval_notifications table is accessible');
      console.log(`📊 Current notifications count: ${notifications.length}`);
    }

    // Overall status
    if (!requestsError && !notificationsError) {
      console.log('');
      console.log('🎉 SUCCESS: Approval system is properly set up!');
      console.log('✅ Both tables are accessible and ready to use');
      console.log('');
      console.log('📋 Available tables:');
      console.log('   - approval_requests');
      console.log('   - approval_notifications');
      console.log('');
      console.log('🚀 You can now use the approval system in your app!');
    } else {
      console.log('');
      console.log('❌ SETUP INCOMPLETE: Some tables are not accessible');
      console.log('🔧 Please run the SQL script manually in Supabase dashboard');
    }
    
  } catch (error) {
    console.error('💥 Verification failed:', error.message);
    console.log('🔧 Please ensure the SQL script was executed in Supabase dashboard');
  }
}

verifyApprovalSetup();