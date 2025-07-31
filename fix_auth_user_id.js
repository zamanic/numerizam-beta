import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = 'https://rbelmynhqpfmkmwcegrn.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiZWxteW5ocXBmbWttd2NlZ3JuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI3NzIyMywiZXhwIjoyMDY4ODUzMjIzfQ.FXGbrdKXYCl8z553690Yri7gwwXmkwmbaoA4vTobeKk'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixAuthUserIdMismatch() {
  try {
    console.log('🔧 Fixing auth_user_id mismatch...\n')

    const adminEmail = 'shuvo@admin.com'
    const authUserId = '9c8abe3b-af09-4f83-9744-93d5c96ead0a'

    // Update the auth_user_id in numerizamauth table
    console.log('1. Updating auth_user_id in numerizamauth table...')
    const { data: updateResult, error: updateError } = await supabase
      .from('numerizamauth')
      .update({ auth_user_id: authUserId })
      .eq('email', adminEmail)
      .select()

    if (updateError) {
      console.error('❌ Error updating auth_user_id:', updateError.message)
      return
    }

    console.log('✅ Successfully updated auth_user_id')
    console.log('Updated record:', updateResult[0])

    // Verify the fix
    console.log('\n2. Verifying the fix...')
    const { data: verifyResult, error: verifyError } = await supabase
      .from('numerizamauth')
      .select('*')
      .eq('email', adminEmail)
      .single()

    if (verifyError) {
      console.error('❌ Error verifying fix:', verifyError.message)
      return
    }

    console.log('✅ Verification successful:')
    console.log(`   - Email: ${verifyResult.email}`)
    console.log(`   - Name: ${verifyResult.name}`)
    console.log(`   - Auth User ID: ${verifyResult.auth_user_id}`)
    console.log(`   - Approved: ${verifyResult.is_approved}`)
    console.log(`   - Role: ${verifyResult.role}`)

    console.log('\n🎉 Fix completed! The userInfo null error should now be resolved.')
    console.log('You can now navigate to /app/query without issues.')

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

fixAuthUserIdMismatch()