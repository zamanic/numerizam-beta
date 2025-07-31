// Supabase Connection and Data Test Tool
// Run this after updating your .env file to verify everything works

import { supabase, supabaseConfig } from "./src/services/supabase.js";

console.log("=== Supabase Configuration Test ===");
console.log("Supabase URL:", supabaseConfig.url);
console.log("Supabase Key configured:", !!supabaseConfig.key);
console.log("Supabase Key length:", supabaseConfig.key?.length || 0);
console.log("Is Configured:", supabaseConfig.isConfigured);

// Check if we're in mock mode
const isMockMode =
  !supabaseConfig.key ||
  supabaseConfig.key === "your_supabase_anon_key_here" ||
  supabaseConfig.key.length < 50;

console.log("Is Mock Mode:", isMockMode);

if (isMockMode) {
  console.log("\n❌ ISSUE: Supabase is running in MOCK MODE!");
  console.log("Your data is NOT being saved to the real database.");
  console.log("\n🔧 To fix this:");
  console.log("1. Go to https://supabase.com/dashboard");
  console.log("2. Select your project: rbelmynhqpfmkmwcegrn");
  console.log("3. Go to Settings → API");
  console.log('4. Copy your anon/public key (starts with "eyJ...")');
  console.log("5. Update VITE_SUPABASE_KEY in your .env file");
  console.log("6. Restart the development server");
} else {
  console.log("\n✅ Supabase is properly configured");

  // Test actual connection and data operations
  try {
    console.log("\n=== Testing Database Connection ===");

    // Test 1: Check if we can connect
    console.log("Testing basic connection...");
    const { data: testData, error: testError } = await supabase
      .from("companies")
      .select("*")
      .limit(1);

    if (testError) {
      console.log("❌ Connection Error:", testError.message);
      if (
        testError.message.includes("JWT") ||
        testError.message.includes("RLS")
      ) {
        console.log("💡 This is likely an RLS (Row Level Security) issue");
        console.log(
          "   You may need to update your RLS policies or authenticate first"
        );
      }
    } else {
      console.log("✅ Basic connection successful");
      console.log("Companies found:", testData?.length || 0);
    }

    // Test 2: Try to insert a test company
    console.log("\nTesting data insertion...");
    const { data: insertData, error: insertError } = await supabase
      .from("companies")
      .insert([{ company_name: "Test Company " + Date.now() }])
      .select();

    if (insertError) {
      console.log("❌ Insert Error:", insertError.message);
      if (insertError.message.includes("RLS")) {
        console.log("💡 RLS Policy is blocking the insert");
        console.log("   You may need to authenticate or update RLS policies");
      }
    } else {
      console.log("✅ Data insertion successful");
      console.log("Inserted company:", insertData);
    }

    // Test 3: Check all tables exist
    console.log("\n=== Checking Database Schema ===");
    const tables = [
      "companies",
      "territory",
      "calendar",
      "chartofaccounts",
      "generalledger",
      "numerizamauth",
    ];

    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select("*").limit(1);
        if (error) {
          console.log(`❌ Table '${table}': ${error.message}`);
        } else {
          console.log(`✅ Table '${table}': exists and accessible`);
        }
      } catch (err) {
        console.log(`❌ Table '${table}': ${err.message}`);
      }
    }
  } catch (err) {
    console.log("❌ Connection test failed:", err.message);
  }
}

console.log("\n=== Test Complete ===");
