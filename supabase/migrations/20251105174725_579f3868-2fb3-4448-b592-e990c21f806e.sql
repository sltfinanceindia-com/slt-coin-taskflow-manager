-- Fix user deactivation trigger to delete messages first
-- This prevents foreign key violations when deactivating users

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS cleanup_deactivated_user_channels_trigger ON public.profiles;

-- Recreate the cleanup function with correct deletion order
CREATE OR REPLACE FUNCTION public.cleanup_deactivated_user_channels()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only run if user is being deactivated
  IF OLD.is_active = TRUE AND NEW.is_active = FALSE THEN
    
    RAISE LOG 'Starting cleanup for deactivated user: %', NEW.id;
    
    -- Step 1: Delete ALL messages in channels where user is a participant
    -- This MUST happen first before deleting channels
    DELETE FROM public.messages
    WHERE channel_id IN (
      SELECT id FROM public.communication_channels
      WHERE NEW.id = ANY(participant_ids)
    );
    
    RAISE LOG 'Deleted messages for user: %', NEW.id;
    
    -- Step 2: Remove user from ALL channel memberships
    DELETE FROM public.channel_members
    WHERE user_id = NEW.id;
    
    RAISE LOG 'Deleted channel memberships for user: %', NEW.id;
    
    -- Step 3: Delete direct message channels where user was a participant
    -- Only delete DM channels, keep group channels for other users
    DELETE FROM public.communication_channels
    WHERE is_direct_message = TRUE
      AND NEW.id = ANY(participant_ids);
    
    RAISE LOG 'Deleted DM channels for user: %', NEW.id;
    
    -- Step 4: Update chat_users status to offline
    UPDATE public.chat_users
    SET status = 'offline',
        is_active = false,
        last_seen = now()
    WHERE user_id = NEW.id;
    
    RAISE LOG 'Updated chat status for user: %', NEW.id;
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER cleanup_deactivated_user_channels_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.cleanup_deactivated_user_channels();

-- Add CASCADE to messages foreign key constraint for safety
-- Drop existing constraint
ALTER TABLE public.messages 
DROP CONSTRAINT IF EXISTS messages_channel_id_fkey;

-- Re-add with ON DELETE CASCADE
ALTER TABLE public.messages
ADD CONSTRAINT messages_channel_id_fkey 
FOREIGN KEY (channel_id) 
REFERENCES public.communication_channels(id) 
ON DELETE CASCADE;

COMMENT ON CONSTRAINT messages_channel_id_fkey ON public.messages IS 
'Automatically delete messages when their channel is deleted';
