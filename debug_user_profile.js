import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = 'https://rbelmynhqpfmkmwcegrn.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiZWxteW5ocXBmbWttd2NlZ3JuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI3NzIyMywiZXhwIjoyMDY4ODUzMjIzfQ.FXGbrdKXYCl8z553690Yri7gwwXmkwmbaoA4vTobeKk'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function debugUserProfile() {
  try {
    console.log('🔍 Debugging user profile issue...\n')

    // 1. Check auth.users table
    console.log('1. Checking auth.users table:')
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError.message)
    } else {
      console.log(`✅ Found ${authUsers.users.length} users in auth.users:`)
      authUsers.users.forEach(user => {
        console.log(`   - ID: ${user.id}`)
        console.log(`   - Email: ${user.email}`)
        console.log(`   - Created: ${user.created_at}`)
        console.log(`   - Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`)
        console.log('   ---')
      })
    }

    console.log('\n2. Checking numerizamauth table:')
    const { data: profiles, error: profileError } = await supabase
      .from('numerizamauth')
      .select('*')
    
    if (profileError) {
      console.error('❌ Error fetching profiles:', profileError.message)
    } else {
      console.log(`✅ Found ${profiles.length} profiles in numerizamauth:`)
      profiles.forEach(profile => {
        console.log(`   - ID: ${profile.id}`)
        console.log(`   - Email: ${profile.email}`)
        console.log(`   - Name: ${profile.name}`)
        console.log(`   - Auth User ID: ${profile.auth_user_id}`)
        console.log(`   - Approved: ${profile.is_approved}`)
        console.log(`   - Role: ${profile.role}`)
        console.log('   ---')
      })
    }

    // 3. Check for mismatches
    console.log('\n3. Checking for mismatches:')
    if (authUsers && profiles) {
      const adminEmail = 'shuvo@admin.com'
      const authUser = authUsers.users.find(u => u.email === adminEmail)
      const profile = profiles.find(p => p.email === adminEmail)

      if (authUser && profile) {
        console.log(`✅ Admin user found in both tables`)
        console.log(`   Auth ID: ${authUser.id}`)
        console.log(`   Profile Auth ID: ${profile.auth_user_id}`)
        
        if (authUser.id === profile.auth_user_id) {
          console.log(`✅ IDs match correctly`)
        } else {
          console.log(`❌ ID MISMATCH! This is the problem.`)
          console.log(`   Need to update profile.auth_user_id to: ${authUser.id}`)
        }
      } else {
        console.log(`❌ Admin user missing:`)
        console.log(`   In auth.users: ${authUser ? 'Yes' : 'No'}`)
        console.log(`   In numerizamauth: ${profile ? 'Yes' : 'No'}`)
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

debugUserProfile()