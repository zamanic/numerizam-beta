/**
 * Test Supabase Connection
 * This script helps diagnose Supabase connection issues
 */

import { createClient } from '@supabase/supabase-js';

// Test environment variables
console.log('🔍 Testing Supabase Configuration...\n');

const supabaseUrl = 'https://rbelmynhqpfmkmwcegrn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiZWxteW5ocXBmbWttd2NlZ3JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNzcyMjMsImV4cCI6MjA2ODg1MzIyM30.28nVyFMV09BxdY27F7W_8LTpDwPKzEIPKgpKrTnQKbI';

console.log('📋 Configuration:');
console.log(`   URL: ${supabaseUrl}`);
console.log(`   Key: ${supabaseKey.substring(0, 20)}...`);
console.log(`   Key Length: ${supabaseKey.length} characters\n`);

// Create Supabase client with explicit configuration
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  }
});

console.log('✅ Supabase client created successfully\n');

// Test if we're in mock mode
const isMockMode = !supabaseConfig.key || supabaseConfig.key === 'your_supabase_anon_key_here';
console.log('Is Mock Mode:', isMockMode);

if (isMockMode) {
  console.log('\n❌ ISSUE FOUND: Supabase is running in MOCK MODE!');
  console.log('This means your data is NOT being saved to the real Supabase database.');
  console.log('\nTo fix this:');
  console.log('1. Go to your Supabase project dashboard');
  console.log('2. Get your anon/public key from Settings > API');
  console.log('3. Update VITE_SUPABASE_KEY in your .env file');
  console.log('4. Restart the development server');
} else {
  console.log('\n✅ Supabase is properly configured');
  
  // Test actual connection
  try {
    console.log('\nTesting Supabase connection...');
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Connection Error:', error.message);
      if (error.message.includes('JWT')) {
        console.log('This might be an RLS (Row Level Security) issue');
      }
    } else {
      console.log('✅ Connection successful');
      console.log('Sample data:', data);
    }
  } catch (err) {
    console.log('❌ Connection failed:', err.message);
  }
}