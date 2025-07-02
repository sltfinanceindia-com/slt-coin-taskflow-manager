-- Fix function search_path security warnings by setting proper search_path

-- Update update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Update handle_new_user function  
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  BEGIN
    INSERT INTO public.profiles (user_id, full_name, email, role)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
      NEW.email,
      CASE 
        WHEN NEW.raw_user_meta_data->>'role' = 'admin' THEN 'admin'::public.user_role
        WHEN NEW.raw_user_meta_data->>'role' = 'intern' THEN 'intern'::public.user_role
        ELSE 'intern'::public.user_role
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
$$;

-- Update increment_user_coins function
CREATE OR REPLACE FUNCTION public.increment_user_coins(
  user_profile_id UUID,
  coin_amount INTEGER
)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles 
  SET total_coins = total_coins + coin_amount
  WHERE id = user_profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';