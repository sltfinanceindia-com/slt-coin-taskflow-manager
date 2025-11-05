-- Fix the cleanup trigger to handle channels with multiple members correctly
CREATE OR REPLACE FUNCTION cleanup_deactivated_user_channels()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only run if user is being deactivated
  IF OLD.is_active = TRUE AND NEW.is_active = FALSE THEN
    
    -- Step 1: Get all channel IDs where this user is a member
    -- We'll need this to clean up later
    
    -- Step 2: Remove user from ALL channel memberships (this must happen first)
    DELETE FROM public.channel_members
    WHERE user_id = NEW.id;
    
    -- Step 3: Delete direct message channels where this user was a participant
    -- DM channels should be deleted because they're 1-on-1 conversations
    DELETE FROM public.communication_channels
    WHERE is_direct_message = TRUE
      AND NEW.id = ANY(participant_ids);
    
    -- Step 4: For group channels, we leave them intact since other users may still be using them
    -- The channel will continue to exist for the remaining members
    
    -- Step 5: Update chat_users status
    UPDATE public.chat_users
    SET status = 'offline',
        is_active = false
    WHERE user_id = NEW.id;
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- Also ensure the foreign key has proper cascade behavior for future safety
-- This allows us to delete channels without manually deleting members first if needed
ALTER TABLE public.channel_members 
DROP CONSTRAINT IF EXISTS channel_members_channel_id_fkey;

ALTER TABLE public.channel_members
ADD CONSTRAINT channel_members_channel_id_fkey 
FOREIGN KEY (channel_id) 
REFERENCES public.communication_channels(id) 
ON DELETE CASCADE;