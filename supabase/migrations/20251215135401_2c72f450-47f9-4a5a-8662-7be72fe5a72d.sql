-- Fix remaining functions with mutable search_path

-- Fix expire_old_scratch_cards
ALTER FUNCTION public.expire_old_scratch_cards() SET search_path = 'public';

-- Fix mark_card_scratched
ALTER FUNCTION public.mark_card_scratched(p_card_id uuid) SET search_path = 'public';

-- Fix update_updated_at_column (this is used by triggers)
ALTER FUNCTION public.update_updated_at_column() SET search_path = 'public';

-- Fix verify_scratch_card
ALTER FUNCTION public.verify_scratch_card(p_card_id uuid, p_verified_by uuid, p_status verification_status_enum, p_notes text) SET search_path = 'public';