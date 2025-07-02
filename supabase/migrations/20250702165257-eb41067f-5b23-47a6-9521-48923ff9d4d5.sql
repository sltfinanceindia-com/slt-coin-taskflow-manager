-- Create function to increment user coins
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
$$ LANGUAGE plpgsql SECURITY DEFINER;