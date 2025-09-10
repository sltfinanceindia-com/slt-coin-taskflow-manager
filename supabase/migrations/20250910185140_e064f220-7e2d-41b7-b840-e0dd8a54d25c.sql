-- Add missing fields for enhanced team communication
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS reactions JSONB DEFAULT '[]';
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS reply_to UUID REFERENCES public.messages(id);
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS is_starred BOOLEAN DEFAULT FALSE;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS thread_replies INTEGER DEFAULT 0;

-- Enable realtime for messages
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Add missing fields for communication channels
ALTER TABLE public.communication_channels ADD COLUMN IF NOT EXISTS is_muted BOOLEAN DEFAULT FALSE;
ALTER TABLE public.communication_channels ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT FALSE;
ALTER TABLE public.communication_channels ADD COLUMN IF NOT EXISTS unread_count INTEGER DEFAULT 0;

-- Enable realtime for communication channels
ALTER TABLE public.communication_channels REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.communication_channels;

-- Create presence tracking table for real-time user status
CREATE TABLE IF NOT EXISTS public.user_presence (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'Available' CHECK (status IN ('Available', 'Busy', 'Away', 'Do not disturb', 'Offline')),
    status_message TEXT,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_online BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable RLS for user presence
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

-- Create policies for user presence
CREATE POLICY "Users can view all presence status" 
ON public.user_presence 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own presence" 
ON public.user_presence 
FOR UPDATE 
USING (auth.uid()::text = (SELECT user_id::text FROM public.profiles WHERE id = user_presence.user_id));

CREATE POLICY "Users can insert their own presence" 
ON public.user_presence 
FOR INSERT 
WITH CHECK (auth.uid()::text = (SELECT user_id::text FROM public.profiles WHERE id = user_presence.user_id));

-- Create trigger for updating timestamps
CREATE TRIGGER update_user_presence_updated_at
BEFORE UPDATE ON public.user_presence
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for user presence
ALTER TABLE public.user_presence REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_presence;