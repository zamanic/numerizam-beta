// Debug frontend login process
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_KEY

console.log('🔍 Debugging Frontend Login Process...')
console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Key:', supabaseKey ? 'Present' : 'Missing')

const supabase = createClient(supabaseUrl, supabaseKey)

async function testFrontendLogin() {
  try {
    console.log('\n1. Testing Supabase connection...')
    
    // Test basic connection
    const { data: testData, error: testError } = await supabase
      .from('numerizamauth')
      .select('count')
      .limit(1)
    
    if (testError) {
      console.error('❌ Supabase connection failed:', testError)
      return
    }
    
    console.log('✅ Supabase connection successful')
    
    console.log('\n2. Testing login with admin credentials...')
    
    // Test login
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'shuvo@admin.com',
      password: '123456'
    })
    
    if (authError) {
      console.error('❌ Login failed:', authError)
      return
    }
    
    console.log('✅ Login successful')
    console.log('User ID:', authData.user?.id)
    console.log('Email:', authData.user?.email)
    
    console.log('\n3. Testing profile fetch...')
    
    // Test profile fetch
    const { data: profileData, error: profileError } = await supabase
      .from('numerizamauth')
      .select('*')
      .eq('id', authData.user.id)
      .single()
    
    if (profileError) {
      console.error('❌ Profile fetch failed:', profileError)
      return
    }
    
    console.log('✅ Profile fetch successful')
    console.log('Profile:', JSON.stringify(profileData, null, 2))
    
    console.log('\n4. Testing approval status...')
    
    if (!profileData.is_approved) {
      console.log('❌ User is not approved')
      return
    }
    
    console.log('✅ User is approved')
    
    console.log('\n🎉 All tests passed! Frontend login should work.')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

testFrontendLogin()