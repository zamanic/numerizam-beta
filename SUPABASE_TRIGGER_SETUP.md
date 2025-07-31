# PostgreSQL Trigger Setup for User Synchronization

This guide explains how to set up automatic user synchronization using PostgreSQL triggers instead of webhooks. This approach is more reliable, immediate, and doesn't require webhook subscriptions.

## Why Use Triggers Instead of Webhooks?

✅ **Immediate**: Executes instantly when a user is created  
✅ **Reliable**: No network dependencies or HTTP failures  
✅ **Server-side**: Runs directly in the database  
✅ **No subscription required**: Works with any Supabase plan  
✅ **Atomic**: Part of the same database transaction  

## Setup Instructions

### 1. Run the Trigger Script

1. **Open Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to **SQL Editor**

2. **Execute the Trigger Script**
   - Copy the contents of `supabase_auth_trigger.sql`
   - Paste it into the SQL Editor
   - Click **Run** to execute

### 2. Verify the Setup

After running the script, you should see:

- ✅ `numerizamauth` table created
- ✅ `sync_user_to_numerizamauth()` function created
- ✅ `on_auth_user_created` trigger attached to `auth.users`
- ✅ Row Level Security policies enabled

### 3. Test the Integration

The trigger will automatically:

1. **Detect new user creation** in `auth.users`
2. **Extract metadata** from the signup process:
   - `full_name` → `name`
   - `company_name` → `company_name`
   - `country` → `country`
   - `region` → `region`
3. **Assign roles** based on email patterns:
   - `@numerizam.com` → Admin (auto-approved)
   - `@accountant.*` or `@cpa.*` → Accountant (needs approval)
   - Others → User (needs approval)
4. **Insert record** into `numerizamauth` table

## How It Works

### Trigger Function Logic

```sql
-- The trigger function:
1. Extracts user metadata from raw_user_meta_data
2. Determines role based on email domain
3. Sets approval status based on role
4. Inserts complete user record into numerizamauth
5. Handles errors gracefully without failing user creation
```

### Role Assignment Rules

| Email Pattern | Role | Auto-Approved |
|---------------|------|---------------|
| `@numerizam.com` | Admin | ✅ Yes |
| `@accountant.*` | Accountant | ❌ No |
| `@cpa.*` | Accountant | ❌ No |
| Others | User | ❌ No |

### Data Mapping

| Supabase Auth Field | numerizamauth Field |
|---------------------|---------------------|
| `id` | `id` |
| `email` | `email` |
| `raw_user_meta_data.full_name` | `name` |
| `raw_user_meta_data.company_name` | `company_name` |
| `raw_user_meta_data.country` | `country` |
| `raw_user_meta_data.region` | `region` |
| (calculated) | `role` |
| (calculated) | `is_approved` |

## Frontend Integration

The React signup form already sends the correct metadata:

```typescript
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      full_name: name,
      company_name: companyName,
      country,
      region
    }
  }
})
```

## Advantages Over Edge Functions

| Aspect | PostgreSQL Trigger | Edge Function |
|--------|-------------------|---------------|
| **Reliability** | ✅ Database-level | ❌ HTTP dependency |
| **Speed** | ✅ Immediate | ❌ Network latency |
| **Cost** | ✅ No extra cost | ❌ Function invocations |
| **Subscription** | ✅ Works on free tier | ❌ Requires webhook plan |
| **Maintenance** | ✅ Self-contained | ❌ Separate deployment |

## Troubleshooting

### Check if Trigger is Working

```sql
-- Check if trigger exists
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Check recent user syncs
SELECT * FROM numerizamauth 
ORDER BY created_at DESC 
LIMIT 10;
```

### Common Issues

1. **Trigger not firing**
   - Verify trigger exists: Check `information_schema.triggers`
   - Check permissions: Ensure trigger function has proper access

2. **Missing user data**
   - Check `raw_user_meta_data` in `auth.users`
   - Verify frontend is sending metadata correctly

3. **Role assignment issues**
   - Check email patterns in trigger function
   - Verify role assignment logic

### Manual Testing

```sql
-- Test the trigger function directly
SELECT sync_user_to_numerizamauth();

-- Check auth.users for metadata
SELECT id, email, raw_user_meta_data 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;
```

## Security Notes

- ✅ Trigger runs with `SECURITY DEFINER` (elevated privileges)
- ✅ Row Level Security enabled on `numerizamauth`
- ✅ Users can only access their own records
- ✅ Error handling prevents user creation failures
- ✅ No sensitive data exposed in logs

## Next Steps

1. **Test user registration** through your app
2. **Verify data appears** in `numerizamauth` table
3. **Check role assignment** is working correctly
4. **Test login flow** with the new authentication system

The trigger approach provides a robust, immediate, and cost-effective solution for user synchronization without requiring webhook subscriptions or external dependencies.