-- Update the scratch card to show as scratched
UPDATE scratch_cards 
SET is_scratched = TRUE, scratch_date = NOW()
WHERE id = 'f20b221f-6364-4c4d-90e0-0a9dac7a89bb';

-- Make sure the mark_card_scratched function can be executed by authenticated users
-- and update the scratch_cards table RLS to allow updates
DROP POLICY IF EXISTS "Users can update their own scratch cards" ON scratch_cards;

CREATE POLICY "Users can update their own scratch cards" 
ON scratch_cards FOR UPDATE 
USING (user_email = auth.email())
WITH CHECK (user_email = auth.email());