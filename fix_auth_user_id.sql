-- Fix the auth_user_id mismatch for the admin user
UPDATE numerizamauth 
SET auth_user_id = '9c8abe3b-af09-4f83-9744-93d5c96ead0a'
WHERE email = 'shuvo@admin.com';

-- Verify the update
SELECT id, email, name, auth_user_id, is_approved, role 
FROM numerizamauth 
WHERE email = 'shuvo@admin.com';