// Test Supabase connection and check database
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_KEY

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Key:', supabaseKey ? 'Present' : 'Missing')

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration. Please check your .env file.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log('Testing Supabase connection...')
    
    // Test basic connection by checking auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('Auth check:', authError ? authError.message : 'Connected')
    
    // Check if numerizamauth table exists and what's in it
    console.log('\nChecking numerizamauth table...')
    const { data: users, error: tableError } = await supabase
      .from('numerizamauth')
      .select('*')
      .limit(5)
    
    if (tableError) {
      console.error('Table error:', tableError.message)
    } else {
      console.log('Users in table:', users.length)
      console.log('Sample data:', users)
    }
    
    // Check if admin user exists
    console.log('\nChecking for admin user...')
    const { data: adminUser, error: adminError } = await supabase
      .from('numerizamauth')
      .select('*')
      .eq('email', 'shuvo@admin.com')
      .single()
    
    if (adminError) {
      console.log('Admin user not found:', adminError.message)
    } else {
      console.log('Admin user found:', adminUser)
    }
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message)
  }
}

testConnection()