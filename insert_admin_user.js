// Script to manually insert admin user into numerizamauth table
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration. Please check your .env file.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function insertAdminUser() {
  try {
    console.log('Inserting admin user into numerizamauth table...')
    
    // First, create the user in Supabase Auth
    console.log('Creating user in Supabase Auth...')
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

    if (authError && !authError.message.includes('already registered')) {
      console.error('Auth error:', authError.message)
      throw authError
    }

    console.log('Auth user created or already exists')

    // Now insert into numerizamauth table
    console.log('Inserting into numerizamauth table...')
    const { data: insertData, error: insertError } = await supabase
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

    if (insertError) {
      console.error('Insert error:', insertError.message)
      
      // If user already exists, update instead
      if (insertError.message.includes('duplicate') || insertError.code === '23505') {
        console.log('User already exists, updating...')
        const { data: updateData, error: updateError } = await supabase
          .from('numerizamauth')
          .update({
            name: 'Admin User',
            role: 'Admin',
            company_name: 'Numerizam Corp',
            country: 'Global',
            region: 'Global',
            is_approved: true
          })
          .eq('email', 'shuvo@admin.com')
          .select()

        if (updateError) {
          console.error('Update error:', updateError.message)
          throw updateError
        } else {
          console.log('✅ Admin user updated successfully:', updateData)
        }
      } else {
        throw insertError
      }
    } else {
      console.log('✅ Admin user inserted successfully:', insertData)
    }

    // Verify the user exists and can be retrieved
    console.log('\nVerifying admin user...')
    const { data: verifyData, error: verifyError } = await supabase
      .from('numerizamauth')
      .select('*')
      .eq('email', 'shuvo@admin.com')
      .single()

    if (verifyError) {
      console.error('Verification error:', verifyError.message)
    } else {
      console.log('✅ Admin user verified:', verifyData)
    }

    console.log('\n🎉 Setup completed!')
    console.log('You can now login with:')
    console.log('Email: shuvo@admin.com')
    console.log('Password: 123456')

  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

insertAdminUser()