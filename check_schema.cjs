const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rbelmynhqpfmkmwcegrn.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiZWxteW5ocXBmbWttd2NlZ3JuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI3NzIyMywiZXhwIjoyMDY4ODUzMjIzfQ.FXGbrdKXYCl8z553690Yri7gwwXmkwmbaoA4vTobeKk';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkSchema() {
  console.log('=== Checking Database Schema ===');
  
  try {
    // List all tables
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (tablesError) {
      console.error('Error checking tables:', tablesError);
    } else {
      console.log('Available tables:', tables.map(t => t.table_name));
    }
    
    // Check if companies table exists and its structure
    const { data: companyColumns, error: companyError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'companies')
      .eq('table_schema', 'public');
    
    if (companyError) {
      console.error('Error checking companies columns:', companyError);
    } else {
      console.log('Companies table columns:', companyColumns);
    }
    
    // Check numerizamauth table structure
    const { data: authColumns, error: authError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'numerizamauth')
      .eq('table_schema', 'public');
    
    if (authError) {
      console.error('Error checking numerizamauth columns:', authError);
    } else {
      console.log('Numerizamauth table columns:', authColumns);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkSchema().catch(console.error);