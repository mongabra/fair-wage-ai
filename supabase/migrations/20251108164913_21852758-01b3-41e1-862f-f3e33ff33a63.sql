-- Drop the duplicate trigger that's causing the duplicate key error
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;

-- Create a combined function that handles both profile and role creation
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role app_role;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  -- Get role from user metadata, default to 'user' if not specified
  user_role := COALESCE(
    (NEW.raw_user_meta_data->>'role')::app_role,
    'user'::app_role
  );
  
  -- Insert the role (with ON CONFLICT to handle edge cases)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Update the trigger to use the combined function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_signup();