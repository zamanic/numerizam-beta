import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = 'https://rbelmynhqpfmkmwcegrn.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiZWxteW5ocXBmbWttd2NlZ3JuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI3NzIyMywiZXhwIjoyMDY4ODUzMjIzfQ.FXGbrdKXYCl8z553690Yri7gwwXmkwmbaoA4vTobeKk'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkTableSchema() {
  try {
    console.log('🔍 Checking numerizamauth table schema...\n')

    // Get a sample record to see the structure
    const { data: sampleData, error: sampleError } = await supabase
      .from('numerizamauth')
      .select('*')
      .limit(1)
    
    if (sampleError) {
      console.error('❌ Error getting sample data:', sampleError.message)
      return
    }

    if (sampleData && sampleData.length > 0) {
      console.log('✅ Sample record from numerizamauth:')
      console.log(JSON.stringify(sampleData[0], null, 2))
      
      console.log('\n📋 Available columns:')
      Object.keys(sampleData[0]).forEach(key => {
        const value = sampleData[0][key]
        const type = typeof value
        console.log(`   - ${key}: ${type} (value: ${value})`)
      })
    } else {
      console.log('❌ No records found in numerizamauth table')
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

checkTableSchema()