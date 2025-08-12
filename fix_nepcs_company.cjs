const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rbelmynhqpfmkmwcegrn.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiZWxteW5ocXBmbWttd2NlZ3JuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI3NzIyMywiZXhwIjoyMDY4ODUzMjIzfQ.FXGbrdKXYCl8z553690Yri7gwwXmkwmbaoA4vTobeKk';

// Use service role key to bypass RLS for setup
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixNEPCSCompany() {
  console.log("=== Fixing NEPCS Company Setup ===");

  try {
    // 1. Check if NEPCS company exists
    console.log("1. Checking if NEPCS company exists...");
    const { data: existingCompany, error: companyCheckError } = await supabase
      .from("companies")
      .select("*")
      .eq("name", "NEPCS");

    if (companyCheckError) {
      console.error("Error checking company:", companyCheckError);
      return;
    }

    let companyId;
    if (existingCompany.length === 0) {
      // 2. Create NEPCS company
      console.log("2. Creating NEPCS company...");
      const { data: newCompany, error: createCompanyError } = await supabase
        .from("companies")
        .insert([
          {
            name: "NEPCS",
            country: "Bangladesh",
            region: "Asia",
          },
        ])
        .select()
        .single();

      if (createCompanyError) {
        console.error("Error creating company:", createCompanyError);
        return;
      }

      companyId = newCompany.id;
      console.log("✓ NEPCS company created with ID:", companyId);
    } else {
      companyId = existingCompany[0].id;
      console.log("✓ NEPCS company already exists with ID:", companyId);
    }

    // 3. Check if territory exists for NEPCS
    console.log("3. Checking territory for NEPCS...");
    const { data: existingTerritory, error: territoryCheckError } =
      await supabase.from("territory").select("*").eq("company_id", companyId);

    if (territoryCheckError) {
      console.error("Error checking territory:", territoryCheckError);
      return;
    }

    if (existingTerritory.length === 0) {
      // 4. Create territory for NEPCS
      console.log("4. Creating territory for NEPCS...");
      const { data: newTerritory, error: createTerritoryError } = await supabase
        .from("territory")
        .insert([
          {
            company_id: companyId,
            country: "Bangladesh",
            region: "Asia",
          },
        ])
        .select()
        .single();

      if (createTerritoryError) {
        console.error("Error creating territory:", createTerritoryError);
        return;
      }

      console.log("✓ Territory created for NEPCS with ID:", newTerritory.id);
    } else {
      console.log("✓ Territory already exists for NEPCS");
    }

    // 5. Verify shuvo@admin.com user
    console.log("5. Verifying shuvo@admin.com user...");
    const { data: user, error: userError } = await supabase
      .from("numerizamauth")
      .select("*")
      .eq("email", "shuvo@admin.com");

    if (userError) {
      console.error("Error fetching user:", userError);
      return;
    }

    if (user.length > 0) {
      console.log("✓ User found:");
      console.log("  - Email:", user[0].email);
      console.log("  - Company Name:", user[0].company_name);
      console.log("  - Is Approved:", user[0].is_approved);
      console.log("  - Role:", user[0].role);

      // Update user to be approved if not already
      if (!user[0].is_approved) {
        console.log("6. Approving user...");
        const { error: updateError } = await supabase
          .from("numerizamauth")
          .update({ is_approved: true })
          .eq("email", "shuvo@admin.com");

        if (updateError) {
          console.error("Error approving user:", updateError);
        } else {
          console.log("✓ User approved successfully");
        }
      }
    } else {
      console.log("❌ User shuvo@admin.com not found in numerizamauth table");
    }

    console.log("\n=== Setup Complete ===");
    console.log("NEPCS company and territory are now properly configured.");
    console.log(
      "shuvo@admin.com should now be able to access the territory table."
    );
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

fixNEPCSCompany().catch(console.error);
