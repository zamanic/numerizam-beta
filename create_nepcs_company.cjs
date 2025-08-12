const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rbelmynhqpfmkmwcegrn.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiZWxteW5ocXBmbWttd2NlZ3JuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI3NzIyMywiZXhwIjoyMDY4ODUzMjIzfQ.FXGbrdKXYCl8z553690Yri7gwwXmkwmbaoA4vTobeKk';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupNEPCS() {
  console.log('=== Creating NEPCS Company ===');
  
  try {
    // First, let's check if NEPCS company already exists
    console.log('0. Checking existing companies...');
    const { data: existingCompanies, error: checkError } = await supabase
      .from('companies')
      .select('*')
      .eq('company_name', 'NEPCS');

    if (checkError) {
      console.error('Error checking companies:', checkError);
      // Continue anyway, might be RLS issue
    } else {
      console.log('Existing NEPCS companies:', existingCompanies);
    }

    // 1. Create NEPCS company (use upsert to avoid duplicates)
    console.log('1. Creating/updating NEPCS company...');
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .upsert([{
        company_name: 'NEPCS'
      }])
      .select()
      .single();

    if (companyError) {
      console.error('Error creating company:', companyError);
      return;
    } else {
      console.log('✓ Company created:', companyData);
    }

    const companyId = companyData.company_id;
    console.log('Company ID:', companyId);

    // 2. Create territory for NEPCS
    console.log('2. Creating territory...');
    const { data: territoryData, error: territoryError } = await supabase
      .from('territory')
      .upsert([{
        company_id: companyId,
        country: 'Bangladesh',
        region: 'Asia'
      }])
      .select()
      .single();

    if (territoryError) {
      console.error('Error creating territory:', territoryError);
      return;
    }

    console.log('✓ Territory created:', territoryData);

    // 3. Check if user already exists in auth
    console.log('3. Checking existing auth user...');
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    let userId = null;
    if (!listError && existingUsers?.users) {
      const existingUser = existingUsers.users.find(u => u.email === 'shuvo@admin.com');
      if (existingUser) {
        userId = existingUser.id;
        console.log('✓ Found existing auth user:', userId);
      }
    }

    // Create auth user if doesn't exist
    if (!userId) {
      console.log('3b. Creating new auth user...');
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: 'shuvo@admin.com',
        password: 'temp123456',
        email_confirm: true
      });

      if (authError) {
        console.error('Error creating auth user:', authError);
        return;
      }

      userId = authData.user.id;
      console.log('✓ Auth user created:', userId);
    }

    // 4. Upsert user profile in numerizamauth
    console.log('4. Setting up user profile...');
    const { data: profileData, error: profileError } = await supabase
      .from('numerizamauth')
      .upsert([{
        id: userId,
        name: 'Shuvo Admin',
        email: 'shuvo@admin.com',
        company_name: 'NEPCS',
        country: 'Bangladesh',
        region: 'Asia',
        role: 'Admin',
        is_approved: true,
        approved_at: new Date().toISOString()
      }])
      .select();

    if (profileError) {
      console.error('Error creating profile:', profileError);
      return;
    }

    console.log('✓ User profile created:', profileData);
    console.log('=== Setup Complete! ===');
    console.log('User shuvo@admin.com can now access the territory table.');

    // 5. Verify the setup by testing access
    console.log('5. Verifying setup...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('territory')
      .select('*');
    
    if (verifyError) {
      console.error('Verification failed:', verifyError);
    } else {
      console.log('✓ Territory access verified:', verifyData);
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

setupNEPCS();