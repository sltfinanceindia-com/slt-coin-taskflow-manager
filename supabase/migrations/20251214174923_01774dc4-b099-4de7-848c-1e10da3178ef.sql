-- Fix the generate_scratch_card function with properly qualified column names
CREATE OR REPLACE FUNCTION public.generate_scratch_card(
  p_feedback_response_id UUID,
  p_user_email TEXT,
  p_user_name TEXT,
  p_user_phone TEXT DEFAULT NULL
)
RETURNS TABLE (
  card_id UUID,
  card_type card_type_enum,
  card_value INTEGER,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_card_type card_type_enum;
  v_card_value INTEGER;
  v_card_id UUID;
  v_high_remaining INTEGER;
  v_medium_remaining INTEGER;
  v_random INTEGER;
BEGIN
  -- Check if card already exists for this feedback
  IF EXISTS (SELECT 1 FROM scratch_cards sc WHERE sc.feedback_response_id = p_feedback_response_id) THEN
    -- Return existing card
    RETURN QUERY 
    SELECT 
      sc.id,
      sc.card_type,
      sc.card_value,
      CASE 
        WHEN sc.card_type = 'better_luck' THEN 'Better luck next time!'
        ELSE 'Congratulations! You won ₹' || sc.card_value::TEXT
      END AS message
    FROM scratch_cards sc
    WHERE sc.feedback_response_id = p_feedback_response_id;
    RETURN;
  END IF;

  -- Get current inventory
  SELECT sci.remaining_count INTO v_high_remaining 
  FROM scratch_card_inventory sci 
  WHERE sci.card_type = 'high_value';
  
  SELECT sci.remaining_count INTO v_medium_remaining 
  FROM scratch_card_inventory sci 
  WHERE sci.card_type = 'medium_value';
  
  -- Generate random number 1-100
  v_random := floor(random() * 100 + 1)::INTEGER;
  
  -- Determine card type based on inventory and random number
  IF v_high_remaining > 0 AND v_random <= 10 THEN
    -- 10% chance for high value (₹50-500)
    v_card_type := 'high_value';
    v_card_value := floor(random() * 451 + 50)::INTEGER;
    
    -- Decrement inventory
    UPDATE scratch_card_inventory sci
    SET remaining_count = sci.remaining_count - 1 
    WHERE sci.card_type = 'high_value';
    
  ELSIF v_medium_remaining > 0 AND v_random <= 60 THEN
    -- 50% chance for medium value (₹10-50)
    v_card_type := 'medium_value';
    v_card_value := floor(random() * 41 + 10)::INTEGER;
    
    -- Decrement inventory
    UPDATE scratch_card_inventory sci
    SET remaining_count = sci.remaining_count - 1 
    WHERE sci.card_type = 'medium_value';
    
  ELSE
    -- Better luck next time
    v_card_type := 'better_luck';
    v_card_value := 0;
  END IF;
  
  -- Create scratch card record
  INSERT INTO scratch_cards (
    feedback_response_id,
    user_email,
    user_name,
    user_phone,
    card_type,
    card_value
  ) VALUES (
    p_feedback_response_id,
    p_user_email,
    p_user_name,
    p_user_phone,
    v_card_type,
    v_card_value
  )
  RETURNING id INTO v_card_id;
  
  -- Return card details
  RETURN QUERY SELECT 
    v_card_id,
    v_card_type,
    v_card_value,
    CASE 
      WHEN v_card_type = 'better_luck' THEN 'Better luck next time!'
      ELSE 'Congratulations! You won ₹' || v_card_value::TEXT
    END AS message;
END;
$$;