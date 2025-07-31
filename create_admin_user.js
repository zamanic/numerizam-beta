// Script to create the admin user in Supabase
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiZWxteW5ocXBmbWttd2NlZ3JuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI3NzIyMywiZXhwIjoyMDY4ODUzMjIzfQ.FXGbrdKXYCl8z553690Yri7gwwXmkwmbaoA4vTobeKk'

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration. Please check your .env file.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createAdminUser() {
  try {
    console.log('Creating admin user...')
    
    // First, try to sign up the admin user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'shuvo@admin.com',
    password: '123456',
      email_confirm: true,
      user_metadata: {
        full_name: 'Admin User',
        company_name: 'Numerizam Corp',
        country: 'Global',
        region: 'Global'
      }
    })

    if (authError) {
      console.error('Auth error:', authError.message)
      
      // If user already exists, that's okay
      if (authError.message.includes('already registered')) {
        console.log('Admin user already exists in auth, checking profile...')
      } else {
        throw authError
      }
    } else {
      console.log('Admin user created in auth successfully')
    }

    // Check if profile exists in numerizamauth table
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('numerizamauth')
      .select('*')
      .eq('email', 'shuvo@admin.com')
      .single()

    if (profileCheckError && profileCheckError.code !== 'PGRST116') {
      console.error('Error checking profile:', profileCheckError.message)
      throw profileCheckError
    }

    if (existingProfile) {
      console.log('Admin profile already exists:', existingProfile)
      
      // Update to ensure admin is approved
      const { error: updateError } = await supabase
        .from('numerizamauth')
        .update({ 
          is_approved: true,
          role: 'Admin'
        })
        .eq('email', 'shuvo@admin.com')

      if (updateError) {
        console.error('Error updating admin profile:', updateError.message)
      } else {
        console.log('Admin profile updated successfully')
      }
    } else {
      // Create profile manually if it doesn't exist
      const { data: profileData, error: profileError } = await supabase
        .from('numerizamauth')
        .insert([
          {
            email: 'shuvo@admin.com',
            name: 'Admin User',
            role: 'Admin',
            company_name: 'Numerizam Corp',
            country: 'Global',
            region: 'Global',
            is_approved: true
          }
        ])
        .select()

      if (profileError) {
        console.error('Error creating admin profile:', profileError.message)
        throw profileError
      } else {
        console.log('Admin profile created successfully:', profileData)
      }
    }

    console.log('✅ Admin user setup completed!')
    console.log('You can now login with:')
    console.log('Email: shuvo@admin.com')
    console.log('Password: 123456')

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message)
    process.exit(1)
  }
}

createAdminUser()