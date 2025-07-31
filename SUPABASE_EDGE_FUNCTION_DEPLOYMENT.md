# Supabase Edge Function Deployment Guide

> **⚠️ IMPORTANT NOTE**: This guide covers the Edge Function + Webhook approach. However, we **strongly recommend using the PostgreSQL Trigger approach** instead, which is more reliable and doesn't require webhook subscriptions. See `SUPABASE_TRIGGER_SETUP.md` for the recommended implementation.

This guide explains how to deploy the `sync-user` edge function and configure the authentication webhook (alternative approach).

## Prerequisites

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Initialize Supabase in your project (if not already done):
```bash
supabase init
```

3. Login to Supabase:
```bash
supabase login
```

## Configuration

1. Update the environment file `supabase/functions/sync-user/.env` with your actual Supabase credentials:
```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

You can find these values in your Supabase Dashboard:
- Go to Settings > API
- Copy the Project URL for `SUPABASE_URL`
- Copy the service_role key for `SUPABASE_SERVICE_ROLE_KEY`

## Deployment

Deploy the edge function using the Supabase CLI:

```bash
supabase functions deploy sync-user --env-file ./supabase/functions/sync-user/.env
```

After successful deployment, you'll get a function URL like:
`https://your-project-id.functions.supabase.co/sync-user`

## Setting up the Authentication Webhook

1. Go to your Supabase Dashboard
2. Navigate to Authentication > Hooks
3. Click "Add a new hook"
4. Configure the hook:
   - **Hook Type**: User Created
   - **URL**: `https://your-project-id.functions.supabase.co/sync-user`
   - **Method**: POST
   - **Headers**: Leave default
5. Click "Save"

## Testing

To test the function:

1. Create a new user account through your application's signup form
2. Check the `numerizamauth` table in your Supabase database
3. Verify that a new row was created with the correct user data

## Function Logic

The `sync-user` function:

1. Receives user signup events from Supabase Auth
2. Determines the user's role based on their email address
3. Creates a corresponding record in the `numerizamauth` table
4. Sets appropriate company and role information

## Role Assignment Logic

The function assigns roles based on email patterns:

- `shuvo@admin.com` → Admin role, Numerizam Corp
- `shuvo3@accountant.com` → Accountant role, Numerizam Corp  
- `shuvo4@investor.com` → Investor role, Amazon
- `shuvo5@auditor.com` → Auditor role, Auditor
- All other emails → Viewer role, Numerizam Corp

You can modify this logic in the `index.ts` file to match your requirements.

## Troubleshooting

1. **Function deployment fails**: Check that you're logged in to Supabase CLI and have the correct project selected
2. **Webhook not triggering**: Verify the webhook URL is correct and the function is deployed
3. **Database errors**: Check that the `numerizamauth` table exists and has the correct schema
4. **Permission errors**: Ensure the service role key has the necessary permissions

## Security Notes

- Never commit the `.env` file with real credentials to version control
- The service role key has full database access - keep it secure
- Consider adding additional validation in the function for production use