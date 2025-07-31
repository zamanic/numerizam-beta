# Sync User Edge Function

This Supabase Edge Function automatically syncs user data from Supabase Auth to the `numerizamauth` table when a new user signs up.

## Purpose

- Automatically creates user records in the `numerizamauth` table when users sign up
- Assigns roles and company information based on email addresses
- Handles user metadata extraction and safe defaults
- Provides robust error handling and logging

## Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
ENVIRONMENT=development  # Optional: for detailed error messages
```

**Important**: Make sure to use the `service_role` key, not the `anon` key, as this function needs admin privileges to insert into the database.

## Features

### Type Safety
- Full TypeScript interfaces for webhook payload and user records
- Proper type checking for all data operations

### Error Handling
- Validates request method (POST only)
- Validates JSON payload structure
- Validates required user fields
- Handles duplicate user scenarios with upsert logic
- Environment variable validation
- Detailed logging for debugging

### User Role Assignment
The function assigns roles based on email addresses:
- `shuvo@admin.com` → Admin role, Numerizam Corp
- `shuvo3@accountant.com` → Accountant role, Numerizam Corp  
- `shuvo4@investor.com` → Investor role, Amazon
- `shuvo5@auditor.com` → Auditor role, Auditor
- All other emails → Viewer role, Numerizam Corp

### Safe Data Extraction
- Safely extracts user metadata with fallbacks
- Handles missing or undefined user_metadata
- Provides sensible defaults for all fields

## Database Schema

The function inserts/updates records in the `numerizamauth` table with these fields:
- `auth_user_id` (string) - Supabase Auth user ID
- `email` (string) - User email address
- `name` (string) - User's full name or "New User" default
- `role` (string) - Assigned role based on email
- `company_name` (string) - Company assignment
- `country` (string) - User's country from metadata
- `region` (string) - User's region from metadata
- `is_approved` (boolean) - Auto-approved as true

## Deployment

Deploy this function using the Supabase CLI:

```bash
supabase functions deploy sync-user
```

## Webhook Setup

Configure this function as a webhook in your Supabase Auth settings to trigger on `USER_SIGNUP` events.

## Testing

You can test the function locally using:

```bash
supabase functions serve sync-user
```

Then send a POST request with a sample payload:

```json
{
  "user": {
    "id": "test-user-id",
    "email": "test@example.com",
    "user_metadata": {
      "full_name": "Test User",
      "country": "US",
      "region": "California"
    }
  },
  "event": "USER_SIGNUP"
}
```