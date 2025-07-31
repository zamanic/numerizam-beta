-- Database functions for Numerizam custom authentication

-- Function to login user with password verification
CREATE OR REPLACE FUNCTION login_user(user_email TEXT, user_password TEXT)
RETURNS TABLE(
    id UUID,
    name TEXT,
    email TEXT,
    company_name TEXT,
    country TEXT,
    region TEXT,
    role TEXT,
    is_approved BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        n.id,
        n.name,
        n.email,
        n.company_name,
        n.country,
        n.region,
        n.role,
        n.is_approved,
        n.created_at
    FROM numerizamauth n
    WHERE n.email = user_email 
    AND n.password = crypt(user_password, n.password);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to register new user
CREATE OR REPLACE FUNCTION register_user(
    user_name TEXT,
    user_email TEXT,
    user_password TEXT,
    user_company_name TEXT,
    user_country TEXT DEFAULT 'Global',
    user_region TEXT DEFAULT 'Global',
    user_role TEXT DEFAULT 'Accountant'
)
RETURNS TABLE(
    id UUID,
    name TEXT,
    email TEXT,
    company_name TEXT,
    country TEXT,
    region TEXT,
    role TEXT,
    is_approved BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    new_user_id UUID;
BEGIN
    -- Check if user already exists
    IF EXISTS (SELECT 1 FROM numerizamauth WHERE email = user_email) THEN
        RAISE EXCEPTION 'User with this email already exists';
    END IF;

    -- Insert new user
    INSERT INTO numerizamauth (name, email, password, company_name, country, region, role, is_approved)
    VALUES (
        user_name,
        user_email,
        crypt(user_password, gen_salt('bf')),
        user_company_name,
        user_country,
        user_region,
        user_role,
        CASE WHEN user_role = 'Admin' THEN true ELSE false END
    )
    RETURNING numerizamauth.id INTO new_user_id;

    -- Return the created user
    RETURN QUERY
    SELECT 
        n.id,
        n.name,
        n.email,
        n.company_name,
        n.country,
        n.region,
        n.role,
        n.is_approved,
        n.created_at
    FROM numerizamauth n
    WHERE n.id = new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION login_user(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION register_user(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- Allow anonymous access for login and registration
GRANT EXECUTE ON FUNCTION login_user(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION register_user(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon;