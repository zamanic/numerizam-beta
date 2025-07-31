// Simple script to register admin user through the normal signup process
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rbelmynhqpfmkmwcegrn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiZWxteW5ocXBmbWttd2NlZ3JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNzcyMjMsImV4cCI6MjA2ODg1MzIyM30.28nVyFMV09BxdY27F7W_8LTpDwPKzEIPKgpKrTnQKbI'

const supabase = createClient(supabaseUrl, supabaseKey)

async function registerAdminUser() {
  try {
    console.log('Registering admin user...')
    
    // Sign up the admin user
    const { data: authData, error: authError } = await supabase.auth.signUp({
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

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('✅ Admin user already exists!')
        console.log('You can now login with:')
        console.log('Email: shuvo@admin.com')
        console.log('Password: 123456')
        return
      }
      console.error('❌ Error registering admin user:', authError.message)
      return
    }

    if (authData.user) {
      console.log('✅ Admin user registered successfully!')
      console.log('The Supabase trigger should automatically:')
      console.log('- Set role to Admin')
      console.log('- Set is_approved to true')
      console.log('- Create profile in numerizamauth table')
      console.log('')
      console.log('You can now login with:')
      console.log('Email: shuvo@admin.com')
      console.log('Password: 123456')
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

registerAdminUser()