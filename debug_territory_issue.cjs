const { createClient } = require('@supabase/supabase-js');

// Use the service role key to bypass RLS
const supabaseUrl = 'https://rbelmynhqpfmkmwcegrn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiZWxteW5ocXBmbWttd2NlZ3JuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI3NzIyMywiZXhwIjoyMDY4ODUzMjIzfQ.FXGbrdKXYCl8z553690Yri7gwwXmkwmbaoA4vTobeKk';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function debugTerritoryIssue() {
  try {
    console.log('=== Debugging Territory Issue ===');
    
    // Check existing territories
    const { data: territories, error: territoryError } = await supabase
      .from('territory')
      .select('*')
      .order('territory_key');
    
    console.log('Existing territories:', territories);
    console.log('Territory error:', territoryError);
    
    // Check companies
    const { data: companies, error: companyError } = await supabase
      .from('companies')
      .select('*');
    
    console.log('Existing companies:', companies);
    console.log('Company error:', companyError);
    
    // Check if there's a territory with territory_key = 1
    const { data: territory1, error: territory1Error } = await supabase
      .from('territory')
      .select('*')
      .eq('territory_key', 1);
    
    console.log('Territory with key 1:', territory1);
    console.log('Territory 1 error:', territory1Error);
    
  } catch (error) {
    console.error('Error debugging territory:', error);
  }
}

debugTerritoryIssue();