const { createClient } = require("@supabase/supabase-js");

// Use service role key for admin operations
const supabase = createClient(
  "https://rbelmynhqpfmkmwcegrn.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiZWxteW5ocXBmbWttd2NlZ3JuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI3NzIyMywiZXhwIjoyMDY4ODUzMjIzfQ.FXGbrdKXYCl8z553690Yri7gwwXmkwmbaoA4vTobeKk"
);

async function setupSuperAdmin() {
  try {
    console.log("Setting up super admin for shuvo@admin.com...");

    // First, check if auth user exists
    console.log("1. Checking if auth user exists...");
    const { data: authUsers, error: authError } =
      await supabase.auth.admin.listUsers();

    if (authError) {
      console.error("Error checking auth users:", authError);
      return;
    }

    const adminUser = authUsers.users.find(
      (user) => user.email === "shuvo@admin.com"
    );

    if (!adminUser) {
      console.log("Creating auth user for shuvo@admin.com...");
      const { data: newUser, error: createError } =
        await supabase.auth.admin.createUser({
          email: "shuvo@admin.com",
          password: "123456",
          email_confirm: true,
        });

      if (createError) {
        console.error("Error creating auth user:", createError);
        return;
      }

      console.log("Auth user created:", newUser.user.id);
    } else {
      console.log("Auth user already exists:", adminUser.id);
    }

    // Get the auth user ID
    const authUserId = adminUser ? adminUser.id : newUser.user.id;

    // 2. Insert/update numerizamauth record
    console.log("2. Setting up numerizamauth record...");
    const { data: existingAuth, error: checkError } = await supabase
      .from("numerizamauth")
      .select("*")
      .eq("email", "shuvo@admin.com")
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking numerizamauth:", checkError);
      return;
    }

    if (!existingAuth) {
      // Insert new record
      const { data: insertData, error: insertError } = await supabase
        .from("numerizamauth")
        .insert({
          auth_user_id: authUserId,
          name: "Super Admin",
          email: "shuvo@admin.com",
          company_name: "Numerizam Corp",
          country: "Global",
          region: "Global",
          role: "Admin",
          is_approved: true,
        });

      if (insertError) {
        console.error("Error inserting numerizamauth record:", insertError);
        return;
      }

      console.log("numerizamauth record created successfully");
    } else {
      // Update existing record
      const { data: updateData, error: updateError } = await supabase
        .from("numerizamauth")
        .update({
          auth_user_id: authUserId,
          role: "Admin",
          is_approved: true,
          company_name: "Numerizam Corp",
        })
        .eq("email", "shuvo@admin.com");

      if (updateError) {
        console.error("Error updating numerizamauth record:", updateError);
        return;
      }

      console.log("numerizamauth record updated successfully");
    }

    console.log("\\n✅ Super admin setup completed for shuvo@admin.com");
    console.log("This user now has:");
    console.log("- Admin role with approval status");
    console.log("- Access to all companies through RLS policies");
    console.log("- Ability to create and manage all accounting data");

    // Verify the setup
    console.log("\\n3. Verifying setup...");
    const { data: verifyData, error: verifyError } = await supabase
      .from("numerizamauth")
      .select("*")
      .eq("email", "shuvo@admin.com");

    if (verifyError) {
      console.error("Error verifying setup:", verifyError);
    } else {
      console.log(
        "Verification successful:",
        JSON.stringify(verifyData, null, 2)
      );
    }
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

setupSuperAdmin();
