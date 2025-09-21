-- Add missing tables for comprehensive communication system

-- Enhanced channel read status tracking  
CREATE TABLE IF NOT EXISTS public.channel_read_status (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    channel_id UUID REFERENCES public.communication_channels(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    unread_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(channel_id, user_id)
);

-- Message threads for nested conversations
CREATE TABLE IF NOT EXISTS public.message_threads (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
    channel_id UUID REFERENCES public.communication_channels(id) ON DELETE CASCADE,
    reply_count INTEGER DEFAULT 0,
    last_reply_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Real-time typing indicators
CREATE TABLE IF NOT EXISTS public.typing_indicators (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    channel_id UUID REFERENCES public.communication_channels(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    is_typing BOOLEAN DEFAULT false,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '10 seconds'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(channel_id, user_id)
);

-- User notification preferences
CREATE TABLE IF NOT EXISTS public.notification_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    mention_notifications BOOLEAN DEFAULT true,
    dm_notifications BOOLEAN DEFAULT true,
    call_notifications BOOLEAN DEFAULT true,
    notification_sounds BOOLEAN DEFAULT true,
    quiet_hours_start TIME DEFAULT '22:00',
    quiet_hours_end TIME DEFAULT '08:00',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Meeting rooms for scheduled meetings
CREATE TABLE IF NOT EXISTS public.meeting_rooms (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    channel_id UUID REFERENCES public.communication_channels(id) ON DELETE CASCADE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    scheduled_start TIMESTAMP WITH TIME ZONE NOT NULL,
    scheduled_end TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_start TIMESTAMP WITH TIME ZONE,
    actual_end TIMESTAMP WITH TIME ZONE,
    meeting_url TEXT,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'ended', 'cancelled')),
    max_participants INTEGER DEFAULT 50,
    is_recording BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Screen share sessions tracking
CREATE TABLE IF NOT EXISTS public.screen_share_sessions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    meeting_id UUID REFERENCES public.meeting_rooms(id) ON DELETE CASCADE,
    presenter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    session_data JSONB DEFAULT '{}',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enhanced message read receipts
CREATE TABLE IF NOT EXISTS public.message_read_receipts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(message_id, user_id)
);

-- Enable RLS on all new tables
ALTER TABLE public.channel_read_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.typing_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.screen_share_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_read_receipts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for channel_read_status
CREATE POLICY "Users can manage their own read status" ON public.channel_read_status
FOR ALL USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- RLS Policies for message_threads
CREATE POLICY "Users can view threads in accessible channels" ON public.message_threads
FOR SELECT USING (
    channel_id IN (
        SELECT cm.channel_id FROM public.channel_members cm 
        JOIN public.profiles p ON cm.user_id = p.id 
        WHERE p.user_id = auth.uid()
    )
);

CREATE POLICY "Users can create threads in accessible channels" ON public.message_threads
FOR INSERT WITH CHECK (
    channel_id IN (
        SELECT cm.channel_id FROM public.channel_members cm 
        JOIN public.profiles p ON cm.user_id = p.id 
        WHERE p.user_id = auth.uid()
    )
);

-- RLS Policies for typing_indicators
CREATE POLICY "Users can manage their own typing status" ON public.typing_indicators
FOR ALL USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can view typing in accessible channels" ON public.typing_indicators
FOR SELECT USING (
    channel_id IN (
        SELECT cm.channel_id FROM public.channel_members cm 
        JOIN public.profiles p ON cm.user_id = p.id 
        WHERE p.user_id = auth.uid()
    )
);

-- RLS Policies for notification_settings
CREATE POLICY "Users can manage their own notification settings" ON public.notification_settings
FOR ALL USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- RLS Policies for meeting_rooms
CREATE POLICY "Users can view meetings in accessible channels" ON public.meeting_rooms
FOR SELECT USING (
    channel_id IN (
        SELECT cm.channel_id FROM public.channel_members cm 
        JOIN public.profiles p ON cm.user_id = p.id 
        WHERE p.user_id = auth.uid()
    )
);

CREATE POLICY "Users can create meetings in accessible channels" ON public.meeting_rooms
FOR INSERT WITH CHECK (
    created_by IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) AND
    channel_id IN (
        SELECT cm.channel_id FROM public.channel_members cm 
        JOIN public.profiles p ON cm.user_id = p.id 
        WHERE p.user_id = auth.uid()
    )
);

-- RLS Policies for screen_share_sessions
CREATE POLICY "Users can manage their own screen shares" ON public.screen_share_sessions
FOR ALL USING (presenter_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- RLS Policies for message_read_receipts
CREATE POLICY "Users can manage their own read receipts" ON public.message_read_receipts
FOR ALL USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can view read receipts for accessible messages" ON public.message_read_receipts
FOR SELECT USING (
    message_id IN (
        SELECT m.id FROM public.messages m
        WHERE m.channel_id IN (
            SELECT cm.channel_id FROM public.channel_members cm 
            JOIN public.profiles p ON cm.user_id = p.id 
            WHERE p.user_id = auth.uid()
        )
    )
);

-- Add triggers for automatic updates
CREATE OR REPLACE FUNCTION update_channel_read_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update unread count when new message is sent
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.channel_read_status (channel_id, user_id, unread_count)
        SELECT NEW.channel_id, cm.user_id, 1
        FROM public.channel_members cm
        JOIN public.profiles p ON cm.user_id = p.id
        WHERE cm.channel_id = NEW.channel_id AND p.user_id != auth.uid()
        ON CONFLICT (channel_id, user_id) 
        DO UPDATE SET 
            unread_count = public.channel_read_status.unread_count + 1,
            updated_at = now();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER message_read_status_trigger
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION update_channel_read_status();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_channel_read_status_user_channel ON public.channel_read_status(user_id, channel_id);
CREATE INDEX IF NOT EXISTS idx_message_threads_parent ON public.message_threads(parent_message_id);
CREATE INDEX IF NOT EXISTS idx_typing_indicators_channel ON public.typing_indicators(channel_id, expires_at);
CREATE INDEX IF NOT EXISTS idx_meeting_rooms_channel_date ON public.meeting_rooms(channel_id, scheduled_start);
CREATE INDEX IF NOT EXISTS idx_message_read_receipts_message ON public.message_read_receipts(message_id);