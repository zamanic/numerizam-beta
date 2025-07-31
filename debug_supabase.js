/**
 * Supabase Connection Debug Utility
 * Add this to your browser console to test Supabase connection
 */

// Test Supabase connection from browser console
window.testSupabaseConnection = async function() {
  console.log('🔍 Testing Supabase Connection...\n');
  
  try {
    // Import the supabase client
    const { supabase } = await import('./src/services/supabase.ts');
    
    console.log('✅ Supabase client imported successfully');
    
    // Test 1: Basic connection test
    console.log('\n🔗 Testing basic connection...');
    try {
      const { data, error } = await supabase.from('numerizamauth').select('count', { count: 'exact', head: true });
      
      if (error) {
        console.log('❌ Connection test failed:');
        console.log(`   Error: ${error.message}`);
        console.log(`   Details: ${error.details || 'No details'}`);
        console.log(`   Hint: ${error.hint || 'No hint'}`);
        
        if (error.message.includes('API key') || error.message.includes('apikey')) {
          console.log('\n🚨 DIAGNOSIS: API Key Issue!');
          console.log('   The request is missing the API key header.');
        }
      } else {
        console.log('✅ Basic connection successful');
        console.log(`   Table accessible: numerizamauth`);
      }
    } catch (err) {
      console.log('❌ Connection test error:', err.message);
    }
    
    // Test 2: Auth endpoint test
    console.log('\n🔐 Testing auth endpoint...');
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.log('❌ Auth test failed:', error.message);
      } else {
        console.log('✅ Auth endpoint accessible');
        console.log(`   Current session: ${session ? 'Active' : 'None'}`);
      }
    } catch (err) {
      console.log('❌ Auth test error:', err.message);
    }
    
    // Test 3: Login test
    console.log('\n🔑 Testing login with admin credentials...');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'admin@numerizam.com',
        password: 'admin123'
      });
      
      if (error) {
        console.log('❌ Login test failed:');
        console.log(`   Error: ${error.message}`);
        console.log(`   Status: ${error.status || 'Unknown'}`);
        
        if (error.message.includes('API key') || error.message.includes('apikey')) {
          console.log('\n🚨 DIAGNOSIS: API Key Issue Detected!');
          console.log('   The Supabase client is not properly sending the API key.');
        } else if (error.message.includes('Invalid login credentials')) {
          console.log('\n✅ GOOD NEWS: API key is working!');
          console.log('   The error is just invalid credentials, which means the connection is fine.');
        }
      } else {
        console.log('✅ Login test successful');
        console.log(`   User: ${data.user?.email || 'Unknown'}`);
      }
    } catch (err) {
      console.log('❌ Login test error:', err.message);
    }
    
    console.log('\n📊 Test Complete!');
    console.log('   Check the results above to diagnose any issues.');
    
  } catch (err) {
    console.log('❌ Failed to import Supabase client:', err.message);
  }
};

console.log('🛠️  Supabase Debug Utility Loaded!');
console.log('   Run: testSupabaseConnection()');
console.log('   This will test your Supabase connection and diagnose issues.');