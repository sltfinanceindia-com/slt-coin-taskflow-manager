-- Add user activation tracking fields to profiles table
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS deactivated_by UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS deactivation_reason TEXT,
  ADD COLUMN IF NOT EXISTS reactivated_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS reactivated_by UUID REFERENCES public.profiles(id);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_deactivated_at ON public.profiles(deactivated_at);

-- Update the cleanup trigger to track deactivation time
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
    
    -- Set deactivation timestamp
    NEW.deactivated_at = NOW();
    
    -- Step 1: Delete ALL messages in channels where user is a participant
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
    
  -- Track reactivation
  ELSIF OLD.is_active = FALSE AND NEW.is_active = TRUE THEN
    NEW.reactivated_at = NOW();
    
    -- Reactivate chat_users entry or create if missing
    INSERT INTO public.chat_users (user_id, status, is_active)
    VALUES (NEW.id, 'offline', true)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      is_active = true,
      status = 'offline',
      updated_at = now();
    
    RAISE LOG 'Reactivated user and chat status: %', NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;