// Script to insert admin user directly into numerizamauth table
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

async function insertAdminUserDirectly() {
  try {
    console.log('Inserting admin user directly into numerizamauth table...')
    
    // Insert directly into numerizamauth table
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

    // Also insert other test users
    console.log('\nInserting other test users...')
    const testUsers = [
      {
        email: 'shuvo2@viewer.com',
        name: 'Viewer User',
        role: 'Viewer',
        company_name: 'Viewer Corp',
        country: 'Global',
        region: 'Global',
        is_approved: true
      },
      {
        email: 'shuvo3@accountant.com',
        name: 'Accountant User',
        role: 'Accountant',
        company_name: 'Accounting Corp',
        country: 'Global',
        region: 'Global',
        is_approved: true
      },
      {
        email: 'shuvo4@investor.com',
        name: 'Investor User',
        role: 'Investor',
        company_name: 'Investment Corp',
        country: 'Global',
        region: 'Global',
        is_approved: true
      },
      {
        email: 'shuvo5@auditor.com',
        name: 'Auditor User',
        role: 'Auditor',
        company_name: 'Audit Corp',
        country: 'Global',
        region: 'Global',
        is_approved: true
      }
    ]

    for (const user of testUsers) {
      const { data, error } = await supabase
        .from('numerizamauth')
        .upsert([user])
        .select()

      if (error) {
        console.error(`Error inserting ${user.email}:`, error.message)
      } else {
        console.log(`✅ ${user.email} inserted/updated successfully`)
      }
    }

    // Verify all users
    console.log('\nVerifying all users...')
    const { data: allUsers, error: verifyError } = await supabase
      .from('numerizamauth')
      .select('*')

    if (verifyError) {
      console.error('Verification error:', verifyError.message)
    } else {
      console.log('✅ All users in database:', allUsers.length)
      allUsers.forEach(user => {
        console.log(`- ${user.email} (${user.role}) - Approved: ${user.is_approved}`)
      })
    }

    console.log('\n🎉 Setup completed!')
    console.log('You can now login with any of these accounts:')
    console.log('- shuvo@admin.com / 123456 (Admin)')
    console.log('- shuvo2@viewer.com / 234567 (Viewer)')
    console.log('- shuvo3@accountant.com / 345678 (Accountant)')
    console.log('- shuvo4@investor.com / 456789 (Investor)')
    console.log('- shuvo5@auditor.com / 567890 (Auditor)')

  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

insertAdminUserDirectly()