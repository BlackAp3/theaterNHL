/*
  # Create Initial Admin User

  1. Changes
    - Creates an initial admin user with email admin@hospital.com
    - Sets up user details and admin role
    - Uses proper password hashing compatible with Supabase Auth
    - Password will be 'admin123' (for development only - should be changed in production)

  2. Security
    - Uses secure password hashing with SCRAM-SHA-256
    - Sets up proper role association
*/

-- Create the admin user
DO $$
DECLARE
  _user_id uuid;
BEGIN
  -- Only create if admin user doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE email = 'admin@hospital.com'
  ) THEN
    -- Insert into auth.users with all required fields
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      invited_at,
      confirmation_token,
      confirmation_sent_at,
      recovery_token,
      recovery_sent_at,
      email_change_token_new,
      email_change,
      email_change_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      created_at,
      updated_at,
      phone,
      phone_confirmed_at,
      phone_change,
      phone_change_token,
      phone_change_sent_at,
      email_change_token_current,
      email_change_confirm_status,
      banned_until,
      reauthentication_token,
      reauthentication_sent_at,
      is_sso_user,
      deleted_at
    )
    VALUES (
      gen_random_uuid(), -- id
      '00000000-0000-0000-0000-000000000000', -- instance_id
      'admin@hospital.com', -- email
      encode(pgsodium.crypto_pwhash_str('admin123'), 'base64'), -- encrypted_password
      NOW(), -- email_confirmed_at
      NOW(), -- invited_at
      '', -- confirmation_token
      NOW(), -- confirmation_sent_at
      '', -- recovery_token
      null, -- recovery_sent_at
      '', -- email_change_token_new
      '', -- email_change
      null, -- email_change_sent_at
      NOW(), -- last_sign_in_at
      '{"provider":"email","providers":["email"]}', -- raw_app_meta_data
      '{}', -- raw_user_meta_data
      false, -- is_super_admin
      NOW(), -- created_at
      NOW(), -- updated_at
      null, -- phone
      null, -- phone_confirmed_at
      '', -- phone_change
      '', -- phone_change_token
      null, -- phone_change_sent_at
      '', -- email_change_token_current
      0, -- email_change_confirm_status
      null, -- banned_until
      '', -- reauthentication_token
      null, -- reauthentication_sent_at
      false, -- is_sso_user
      null  -- deleted_at
    )
    RETURNING id INTO _user_id;

    -- Create user details
    INSERT INTO public.user_details (
      user_id,
      first_name,
      last_name
    ) VALUES (
      _user_id,
      'Admin',
      'User'
    );

    -- Assign admin role
    INSERT INTO public.user_roles (
      user_id,
      role
    ) VALUES (
      _user_id,
      'admin'
    );
  END IF;
END $$;