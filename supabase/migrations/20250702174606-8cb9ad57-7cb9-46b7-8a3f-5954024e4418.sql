-- Fix the profile creation to handle admin accounts properly
-- First ensure the user_role enum exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'intern');
    END IF;
END $$;

-- Recreate the handle_new_user function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  BEGIN
    INSERT INTO public.profiles (user_id, full_name, email, role)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
      NEW.email,
      CASE 
        WHEN NEW.raw_user_meta_data->>'role' = 'admin' THEN 'admin'::user_role
        WHEN NEW.raw_user_meta_data->>'role' = 'intern' THEN 'intern'::user_role
        ELSE 'intern'::user_role
      END
    );
    RETURN NEW;
  EXCEPTION
    WHEN unique_violation THEN
      -- Profile already exists, just return
      RETURN NEW;
    WHEN others THEN
      -- Log the error but don't block user creation
      RAISE LOG 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
      RETURN NEW;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Make sure the trigger is properly set up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();