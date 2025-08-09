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
    console.log('🔧 Creating approval_requests table...');
    
    // Create approval_requests table using raw SQL
    const { error: createError } = await supabase
      .from('approval_requests')
      .select('*')
      .limit(1);
    
    if (createError && createError.message.includes('does not exist')) {
      console.log('📋 Table does not exist, need to create it manually in Supabase dashboard');
      console.log('Please run the following SQL in your Supabase SQL editor:');
      console.log(`
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

CREATE TABLE IF NOT EXISTS approval_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_email TEXT NOT NULL,
  request_id UUID REFERENCES approval_requests(id) ON DELETE CASCADE NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  requested_role TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for approval_requests
CREATE POLICY "Users can view their own requests" ON approval_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own requests" ON approval_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all requests" ON approval_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND role = 'Admin'
    )
  );

CREATE POLICY "Admins can update all requests" ON approval_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND role = 'Admin'
    )
  );

-- Create policies for approval_notifications
CREATE POLICY "Admins can view all notifications" ON approval_notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND role = 'Admin'
    )
  );

CREATE POLICY "System can create notifications" ON approval_notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update notifications" ON approval_notifications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND role = 'Admin'
    )
  );
      `);
      return;
    }
    
    console.log('✅ approval_requests table already exists or is accessible');
    console.log('📊 Current data count:', createError ? 0 : 'accessible');
    
  } catch (err) {
    console.error('💥 Exception:', err.message);
  }
}

createApprovalTables();