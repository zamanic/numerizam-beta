// Temporary script to create admin user with proper password
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rbelmynhqpfmkmwcegrn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiZWxteW5ocXBmbWttd2NlZ3JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNzcyMjMsImV4cCI6MjA2ODg1MzIyM30.28nVyFMV09BxdY27F7W_8LTpDwPKzEIPKgpKrTnQKbI'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testLogin() {
  try {
    console.log('Testing login with existing credentials...')
    
    // Try to sign in with the credentials
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'shuvo@admin.com',
      password: '123456'
    })

    if (authError) {
      console.log('❌ Login failed:', authError.message)
      
      // If login fails, try to register
      console.log('Attempting to register user...')
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: 'shuvo@admin.com',
        password: '123456',
        options: {
          data: {
            full_name: 'Admin User',
            company_name: 'Numerizam Corp',
            country: 'Global',
            region: 'Global'
          }
        }
      })

      if (signUpError) {
        console.log('❌ Registration failed:', signUpError.message)
      } else {
        console.log('✅ User registered successfully!')
        console.log('User ID:', signUpData.user?.id)
      }
    } else {
      console.log('✅ Login successful!')
      console.log('User ID:', authData.user?.id)
      console.log('Email:', authData.user?.email)
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

testLogin()