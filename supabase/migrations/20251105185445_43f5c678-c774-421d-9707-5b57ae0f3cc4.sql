-- Fix Security Issues: Restrict public access to chat_users and communication_channels

-- ============================================================================
-- 1. FIX: User Activity Data Exposed (chat_users table)
-- ============================================================================

-- Drop the insecure public policy
DROP POLICY IF EXISTS "Users can view all chat users" ON public.chat_users;

-- Create secure policy: Only authenticated users can view active chat users
CREATE POLICY "Authenticated users can view active chat users"
ON public.chat_users
FOR SELECT
TO authenticated
USING (is_active = true);

-- ============================================================================
-- 2. FIX: Private Conversations Discovery (communication_channels table)
-- ============================================================================

-- Drop the insecure public policy
DROP POLICY IF EXISTS "Users can view channels they are members of" ON public.communication_channels;

-- Create secure policy: Users can only view channels they are members of
CREATE POLICY "Users can view their channels only"
ON public.communication_channels
FOR SELECT
TO authenticated
USING (
  -- User must be a member of the channel
  id IN (
    SELECT channel_id 
    FROM public.channel_members 
    WHERE user_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  )
  OR
  -- Or user created the channel
  created_by IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

-- Add comment explaining the security fix
COMMENT ON POLICY "Users can view their channels only" 
ON public.communication_channels 
IS 'Security fix: Prevents unauthorized users from discovering private conversations. Users can only see channels where they are members or creators.';