import { serve } from "std/http/server.ts";
import { createClient } from "supabase";

// Types for better type safety
interface WebhookPayload {
  user: {
    id: string;
    email: string;
    user_metadata?: {
      full_name?: string;
      country?: string;
      region?: string;
      [key: string]: any;
    };
  };
  event: string;
}

interface UserRecord {
  auth_user_id: string;
  email: string;
  name: string;
  role: string;
  company_name: string;
  country: string;
  region: string;
  is_approved: boolean;
}

// Helper function to determine user role and company based on email
function getUserRoleAndCompany(email: string): { role: string; company_name: string } {
  const emailRoleMap: Record<string, { role: string; company_name: string }> = {
    "shuvo@admin.com": { role: "Admin", company_name: "Numerizam Corp" },
    "shuvo3@accountant.com": { role: "Accountant", company_name: "Numerizam Corp" },
    "shuvo4@investor.com": { role: "Investor", company_name: "Amazon" },
    "shuvo5@auditor.com": { role: "Auditor", company_name: "Auditor" },
  };

  return emailRoleMap[email] || { role: "Viewer", company_name: "Numerizam Corp" };
}

// Helper function to validate environment variables
function validateEnvironment(): { supabaseUrl: string; serviceRoleKey: string } {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl) {
    throw new Error("SUPABASE_URL environment variable is not set");
  }

  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY environment variable is not set");
  }

  return { supabaseUrl, serviceRoleKey };
}

serve(async (req) => {
  try {
    // Validate request method
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    // Parse request body
    let payload: WebhookPayload;
    try {
      payload = await req.json();
    } catch (error) {
      console.error("Failed to parse request body:", error);
      return new Response("Invalid JSON payload", { status: 400 });
    }

    const { user, event } = payload;

    // Validate required fields
    if (!user || !user.id || !user.email) {
      console.error("Missing required user fields:", { user, event });
      return new Response("Missing required user fields", { status: 400 });
    }

    // Only process USER_SIGNUP events
    if (event !== "USER_SIGNUP") {
      console.log(`Ignoring event: ${event}`);
      return new Response("Ignored event", { status: 200 });
    }

    // Validate environment variables
    const { supabaseUrl, serviceRoleKey } = validateEnvironment();

    // Create Supabase admin client
    const supabaseAdminClient = createClient(supabaseUrl, serviceRoleKey);

    // Extract user information with safe defaults
    const email = user.email;
    const { role, company_name } = getUserRoleAndCompany(email);
    
    // Safely extract user metadata
    const userMetadata = user.user_metadata || {};
    const name = userMetadata.full_name || userMetadata.name || "New User";
    const country = userMetadata.country || "";
    const region = userMetadata.region || "";

    // Prepare user record
    const userRecord: UserRecord = {
      auth_user_id: user.id,
      email,
      name,
      role,
      company_name,
      country,
      region,
      is_approved: true, // Auto-approve for now, can be changed based on business logic
    };

    console.log("Inserting user record:", userRecord);

    // Insert user into numerizamauth table
    const { data, error } = await supabaseAdminClient
      .from("numerizamauth")
      .insert([userRecord])
      .select();

    if (error) {
      console.error("Database insert error:", error);
      
      // Handle duplicate user case
      if (error.code === "23505") { // PostgreSQL unique violation
        console.log("User already exists, updating instead");
        
        const { error: updateError } = await supabaseAdminClient
          .from("numerizamauth")
          .update({
            name,
            role,
            company_name,
            country,
            region,
          })
          .eq("auth_user_id", user.id);

        if (updateError) {
          console.error("Update error:", updateError);
          return new Response("Error updating existing user", { status: 500 });
        }

        return new Response("User updated successfully", { status: 200 });
      }

      return new Response("Error inserting user", { status: 500 });
    }

    console.log("User synced successfully:", data);
    return new Response("User synced successfully", { status: 200 });

  } catch (error) {
    console.error("Function error:", error);
    
    // Return more specific error messages in development
    const isDevelopment = Deno.env.get("ENVIRONMENT") === "development";
    const errorMessage = isDevelopment 
      ? `Internal server error: ${error.message}` 
      : "Internal server error";
    
    return new Response(errorMessage, { status: 500 });
  }
});
