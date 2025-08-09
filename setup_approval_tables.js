import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

dotenv.config();

// Use service role key for admin operations
const supabase = createClient(
  process.env.VITE_SUPABASE_URL, 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiZWxteW5ocXBmbWttd2NlZ3JuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI3NzIyMywiZXhwIjoyMDY4ODUzMjIzfQ.FXGbrdKXYCl8z553690Yri7gwwXmkwmbaoA4vTobeKk'
);

async function setupApprovalTables() {
  try {
    console.log('🚀 Setting up approval system tables...');
    
    // First, let's create the update_updated_at_column function if it doesn't exist
    console.log('📝 Creating update_updated_at_column function...');
    const updateFunctionSQL = `
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `;
    
    const { error: funcError } = await supabase.rpc('query', { 
      query: updateFunctionSQL 
    });
    
    if (funcError) {
      console.log('⚠️  Function creation error:', funcError.message);
    } else {
      console.log('✅ Function created successfully');
    }

    // Create approval_requests table
    console.log('📋 Creating approval_requests table...');
    const createRequestsTableSQL = `
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
    `;
    
    const { error: requestsError } = await supabase.rpc('query', { 
      query: createRequestsTableSQL 
    });
    
    if (requestsError) {
      console.log('⚠️  Requests table error:', requestsError.message);
    } else {
      console.log('✅ approval_requests table created successfully');
    }

    // Create approval_notifications table
    console.log('📬 Creating approval_notifications table...');
    const createNotificationsTableSQL = `
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
    `;
    
    const { error: notificationsError } = await supabase.rpc('query', { 
      query: createNotificationsTableSQL 
    });
    
    if (notificationsError) {
      console.log('⚠️  Notifications table error:', notificationsError.message);
    } else {
      console.log('✅ approval_notifications table created successfully');
    }

    // Create indexes
    console.log('🔍 Creating indexes...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_approval_requests_user_id ON approval_requests(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_approval_requests_status ON approval_requests(status);',
      'CREATE INDEX IF NOT EXISTS idx_approval_requests_created_at ON approval_requests(created_at);',
      'CREATE INDEX IF NOT EXISTS idx_approval_notifications_admin_email ON approval_notifications(admin_email);',
      'CREATE INDEX IF NOT EXISTS idx_approval_notifications_is_read ON approval_notifications(is_read);',
      'CREATE INDEX IF NOT EXISTS idx_approval_notifications_request_id ON approval_notifications(request_id);'
    ];

    for (const indexSQL of indexes) {
      const { error: indexError } = await supabase.rpc('query', { 
        query: indexSQL 
      });
      
      if (indexError) {
        console.log('⚠️  Index error:', indexError.message);
      }
    }
    console.log('✅ Indexes created successfully');

    // Test table access
    console.log('🧪 Testing table access...');
    const { data, error } = await supabase
      .from('approval_requests')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Tables still not accessible:', error.message);
      console.log('🔧 You may need to run the SQL manually in Supabase dashboard');
      console.log('📋 SQL file location: approval_system_setup.sql');
    } else {
      console.log('✅ Tables are now accessible!');
      console.log('🎉 Approval system setup completed successfully!');
    }
    
  } catch (err) {
    console.error('💥 Exception:', err.message);
    console.log('🔧 Please run the approval_system_setup.sql manually in Supabase dashboard');
  }
}

setupApprovalTables();