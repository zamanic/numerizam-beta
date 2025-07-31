-- 1. Enable RLS on numerizamauth table 
ALTER TABLE numerizamauth ENABLE ROW LEVEL SECURITY; 

-- 2. Drop all existing policies to avoid duplication (including old and linked) 
DROP POLICY IF EXISTS "Allow read for Admin, Accountant, and Auditor" ON numerizamauth; 
DROP POLICY IF EXISTS "Allow write for Admin, Accountant" ON numerizamauth; 
DROP POLICY IF EXISTS "Users can read own profile" ON numerizamauth; 
DROP POLICY IF EXISTS "Users can update own profile" ON numerizamauth; 
DROP POLICY IF EXISTS "Admin can read all profiles" ON numerizamauth; 
DROP POLICY IF EXISTS "Admin can update all profiles" ON numerizamauth; 
DROP POLICY IF EXISTS "Admin can delete profiles" ON numerizamauth; 
DROP POLICY IF EXISTS "Allow user registration" ON numerizamauth; 
DROP POLICY IF EXISTS "Select own records" ON numerizamauth; 
DROP POLICY IF EXISTS "Update own records" ON numerizamauth; 
DROP POLICY IF EXISTS "Delete own records" ON numerizamauth; 
DROP POLICY IF EXISTS "Insert own records" ON numerizamauth; 

-- 3. SELECT policy: users can read their own profile 
CREATE POLICY "Users can read own profile" 
ON numerizamauth 
FOR SELECT 
USING ( 
  auth.uid() IS NOT NULL AND 
  auth_user_id = auth.uid() 
); 

-- 4. SELECT policy: Admins can read all profiles 
CREATE POLICY "Admin can read all profiles" 
ON numerizamauth 
FOR SELECT 
USING ( 
  auth.uid() IS NOT NULL AND 
  EXISTS ( 
    SELECT 1 FROM numerizamauth admin_check 
    WHERE admin_check.auth_user_id = auth.uid() 
      AND admin_check.role = 'Admin' 
      AND admin_check.is_approved = true 
  ) 
); 

-- 5. UPDATE policy: users can update their own profile 
CREATE POLICY "Users can update own profile" 
ON numerizamauth 
FOR UPDATE 
USING ( 
  auth.uid() IS NOT NULL AND 
  auth_user_id = auth.uid() 
) 
WITH CHECK ( 
  auth.uid() IS NOT NULL AND 
  auth_user_id = auth.uid() 
); 

-- 6. UPDATE policy: Admin can update any profile 
CREATE POLICY "Admin can update all profiles" 
ON numerizamauth 
FOR UPDATE 
USING ( 
  auth.uid() IS NOT NULL AND 
  EXISTS ( 
    SELECT 1 FROM numerizamauth admin_check 
    WHERE admin_check.auth_user_id = auth.uid() 
      AND admin_check.role = 'Admin' 
      AND admin_check.is_approved = true 
  ) 
) 
WITH CHECK ( 
  auth.uid() IS NOT NULL AND 
  EXISTS ( 
    SELECT 1 FROM numerizamauth admin_check 
    WHERE admin_check.auth_user_id = auth.uid() 
      AND admin_check.role = 'Admin' 
      AND admin_check.is_approved = true 
  ) 
); 

-- 7. DELETE policy: Only Admins can delete 
CREATE POLICY "Admin can delete profiles" 
ON numerizamauth 
FOR DELETE 
USING ( 
  auth.uid() IS NOT NULL AND 
  EXISTS ( 
    SELECT 1 FROM numerizamauth admin_check 
    WHERE admin_check.auth_user_id = auth.uid() 
      AND admin_check.role = 'Admin' 
      AND admin_check.is_approved = true 
  ) 
); 

-- 8. INSERT policy: Allow registered user to insert their own record 
CREATE POLICY "Allow user registration" 
ON numerizamauth 
FOR INSERT 
WITH CHECK ( 
  auth.uid() IS NOT NULL AND 
  auth_user_id = auth.uid() 
); 

-- 9. Enforce auth_user_id to be non-null at schema level 
DO $$ 
BEGIN 
  IF NOT EXISTS ( 
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'chk_auth_user_id_not_null' 
      AND table_name = 'numerizamauth' 
  ) THEN 
    ALTER TABLE numerizamauth 
    ADD CONSTRAINT chk_auth_user_id_not_null CHECK (auth_user_id IS NOT NULL); 
  END IF; 
END $$; 

-- 10. Trigger function to insert into numerizamauth after signup 
CREATE OR REPLACE FUNCTION public.handle_new_auth_user() 
RETURNS TRIGGER AS $$ 
DECLARE 
  user_name TEXT; 
  user_role TEXT := 'Viewer'; 
  user_company TEXT := 'Unknown'; 
BEGIN 
  -- Get full name from user_metadata if available 
  user_name := NEW.raw_user_meta_data ->> 'full_name'; 

  -- Assign roles and companies based on email 
  IF LOWER(NEW.email) = 'shuvo@admin.com' THEN 
    user_role := 'Admin'; 
    user_company := 'Numerizam Corp'; 
  ELSIF LOWER(NEW.email) = 'shuvo2@viewer.com' THEN 
    user_role := 'Viewer'; 
    user_company := 'Numerizam Corp'; 
  ELSIF LOWER(NEW.email) = 'shuvo3@accountant.com' THEN 
    user_role := 'Accountant'; 
    user_company := 'Numerizam Corp'; 
  ELSIF LOWER(NEW.email) = 'shuvo4@investor.com' THEN 
    user_role := 'Investor'; 
    user_company := 'Amazon'; 
  ELSIF LOWER(NEW.email) = 'shuvo5@auditor.com' THEN 
    user_role := 'Auditor'; 
    user_company := 'Auditor'; 
  END IF; 

  INSERT INTO public.numerizamauth ( 
    auth_user_id, 
    name, 
    email, 
    password, 
    company_name, 
    role, 
    is_approved 
  ) 
  VALUES ( 
    NEW.id, 
    COALESCE(user_name, 'New User'), 
    NEW.email, 
    '', 
    user_company, 
    user_role, 
    true 
  ); 

  RETURN NEW; 
END; 
$$ LANGUAGE plpgsql; 

-- 11. Attach trigger to auth.users 
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users; 

CREATE TRIGGER on_auth_user_created 
AFTER INSERT ON auth.users 
FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user(); 

-- 12. Backfill auth_user_id for manually created users 
UPDATE numerizamauth 
SET auth_user_id = ( 
  SELECT id FROM auth.users 
  WHERE LOWER(auth.users.email) = LOWER(numerizamauth.email) 
  LIMIT 1 
) 
WHERE auth_user_id IS NULL 
AND email IN ( 
  'shuvo@admin.com', 
  'shuvo2@viewer.com', 
  'shuvo3@accountant.com', 
  'shuvo4@investor.com', 
  'shuvo5@auditor.com' 
);