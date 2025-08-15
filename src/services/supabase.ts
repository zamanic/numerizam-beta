import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Initialize Supabase client with environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rbelmynhqpfmkmwcegrn.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if Supabase is properly configured
const isSupabaseConfigured = supabaseKey && supabaseKey !== 'your_supabase_anon_key_here' && supabaseKey.length > 10;

if (!isSupabaseConfigured) {
  console.warn('⚠️ Supabase not configured properly. OCR functionality will work but database features may be limited.');
  console.warn('📝 To enable full functionality, configure these environment variables:');
  console.warn('   - VITE_SUPABASE_URL');
  console.warn('   - VITE_SUPABASE_ANON_KEY');
}

// Create a single supabase client for interacting with your database
export const supabase = isSupabaseConfigured 
  ? createClient<Database>(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        flowType: 'pkce'
      }
    })
  : null; // Return null if not configured to prevent errors

export default supabase;