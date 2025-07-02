-- Fix the handle_new_user trigger function to handle the role enum properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
END;
$function$