-- Update messages table to include better user identification and remove call-related columns
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS sender_name TEXT,
ADD COLUMN IF NOT EXISTS sender_role TEXT;

-- Update communication_channels table to include better metadata
ALTER TABLE public.communication_channels 
ADD COLUMN IF NOT EXISTS is_direct_message BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS participant_ids UUID[] DEFAULT '{}';

-- Create index for better performance on messages
CREATE INDEX IF NOT EXISTS idx_messages_channel_created_at ON public.messages(channel_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON public.messages(sender_id, receiver_id);

-- Update RLS policies for better communication access
DROP POLICY IF EXISTS "Users can view messages in their channels" ON public.messages;
CREATE POLICY "Users can view messages in their channels" ON public.messages
FOR SELECT USING (
  (channel_id IN (
    SELECT channel_members.channel_id
    FROM channel_members
    WHERE channel_members.user_id IN (
      SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
    )
  )) OR 
  (sender_id IN (
    SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
  )) OR 
  (receiver_id IN (
    SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
  ))
);

-- Update channel members policies for better access
DROP POLICY IF EXISTS "Users can view channel memberships" ON public.channel_members;
CREATE POLICY "Users can view channel memberships" ON public.channel_members
FOR SELECT USING (
  (channel_id IN (
    SELECT communication_channels.id
    FROM communication_channels
    WHERE (communication_channels.type = 'public') OR 
          (communication_channels.created_by IN (
            SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
          ))
  )) OR 
  (user_id IN (
    SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
  ))
);