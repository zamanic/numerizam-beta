import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Initialize Supabase client with environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rbelmynhqpfmkmwcegrn.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || '';

// Check if Supabase is properly configured
const isSupabaseConfigured = supabaseKey && supabaseKey !== 'your_supabase_anon_key_here' && supabaseKey.length > 10;

if (!isSupabaseConfigured) {
  console.error('❌ Supabase not configured properly. Please check your environment variables.');
  console.error('📝 Required environment variables:');
  console.error('   - VITE_SUPABASE_URL');
  console.error('   - VITE_SUPABASE_KEY');
  throw new Error('Supabase configuration missing');
}

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce'
  }
});

export default supabase;