import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = 'https://rbelmynhqpfmkmwcegrn.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiZWxteW5ocXBmbWttd2NlZ3JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNzcyMjMsImV4cCI6MjA2ODg1MzIyM30.28nVyFMV09BxdY27F7W_8LTpDwPKzEIPKgpKrTnQKbI'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testAuthFlow() {
  try {
    console.log('🧪 Testing authentication flow...\n')

    // 1. Try to sign in
    console.log('1. Signing in with admin credentials...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'shuvo@admin.com',
      password: '123456'
    })

    if (authError) {
      console.error('❌ Auth error:', authError.message)
      return
    }

    console.log('✅ Successfully signed in')
    console.log(`   User ID: ${authData.user.id}`)
    console.log(`   Email: ${authData.user.email}`)

    // 2. Try to get current user
    console.log('\n2. Getting current user...')
    const { data: { user: currentUser }, error: currentUserError } = await supabase.auth.getUser()

    if (currentUserError || !currentUser) {
      console.error('❌ Error getting current user:', currentUserError?.message || 'No user')
      return
    }

    console.log('✅ Current user retrieved')
    console.log(`   User ID: ${currentUser.id}`)
    console.log(`   Email: ${currentUser.email}`)

    // 3. Try to get profile from numerizamauth
    console.log('\n3. Getting profile from numerizamauth...')
    const { data: userProfile, error: profileError } = await supabase
      .from('numerizamauth')
      .select('*')
      .eq('email', currentUser.email)
      .single()

    if (profileError) {
      console.error('❌ Profile error:', profileError.message)
      console.log('   Error details:', profileError)
      return
    }

    console.log('✅ Profile retrieved successfully')
    console.log('   Profile data:', JSON.stringify(userProfile, null, 2))

    // 4. Test the complete getCurrentUser flow
    console.log('\n4. Testing complete getCurrentUser flow...')
    
    // Simulate the numerizamAuthService.getCurrentUser() method
    const getCurrentUser = async () => {
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

        if (authError || !authUser) {
          return { user: null, error: 'No authenticated user' }
        }

        const { data: userProfile, error: profileError } = await supabase
          .from('numerizamauth')
          .select('*')
          .eq('email', authUser.email)
          .single()

        if (profileError) {
          return { user: null, error: `Profile not found: ${profileError.message}` }
        }

        return { user: userProfile, error: null }
      } catch (error) {
        return { user: null, error: `Failed to get current user: ${error.message}` }
      }
    }

    const result = await getCurrentUser()
    
    if (result.error) {
      console.error('❌ getCurrentUser failed:', result.error)
    } else {
      console.log('✅ getCurrentUser succeeded')
      console.log('   User data:', JSON.stringify(result.user, null, 2))
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

testAuthFlow()