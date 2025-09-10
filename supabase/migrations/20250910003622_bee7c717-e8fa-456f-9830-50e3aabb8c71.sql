-- Create communication channels table
CREATE TABLE IF NOT EXISTS public.communication_channels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL DEFAULT 'public', -- 'public', 'private', 'direct'
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create channel members table
CREATE TABLE IF NOT EXISTS public.channel_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    channel_id UUID REFERENCES public.communication_channels(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member', -- 'member', 'admin', 'moderator'
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(channel_id, user_id)
);

-- Create channel messages table
CREATE TABLE IF NOT EXISTS public.channel_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    channel_id UUID REFERENCES public.communication_channels(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type TEXT NOT NULL DEFAULT 'text', -- 'text', 'file', 'image', 'system'
    reply_to UUID REFERENCES public.channel_messages(id),
    edited_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.communication_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_messages ENABLE ROW LEVEL SECURITY;

-- Create simplified policies for communication_channels
CREATE POLICY "Enable read access for authenticated users" ON public.communication_channels
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON public.communication_channels
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for creators and admins" ON public.communication_channels
    FOR UPDATE USING (
        created_by = auth.uid() OR 
        (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin'
    );

CREATE POLICY "Enable delete for creators and admins" ON public.communication_channels
    FOR DELETE USING (
        created_by = auth.uid() OR 
        (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin'
    );

-- Create simplified policies for channel_members
CREATE POLICY "Enable read access for authenticated users" ON public.channel_members
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON public.channel_members
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for own membership or admins" ON public.channel_members
    FOR DELETE USING (
        user_id = auth.uid() OR 
        (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin'
    );

-- Create simplified policies for channel_messages
CREATE POLICY "Enable read for authenticated users" ON public.channel_messages
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON public.channel_messages
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for message authors" ON public.channel_messages
    FOR UPDATE USING (sender_id = auth.uid());

CREATE POLICY "Enable delete for authors and admins" ON public.channel_messages
    FOR DELETE USING (
        sender_id = auth.uid() OR 
        (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin'
    );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_channel_members_channel_id ON public.channel_members(channel_id);
CREATE INDEX IF NOT EXISTS idx_channel_members_user_id ON public.channel_members(user_id);
CREATE INDEX IF NOT EXISTS idx_channel_messages_channel_id ON public.channel_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_channel_messages_sender_id ON public.channel_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_channel_messages_created_at ON public.channel_messages(created_at);

-- Create triggers for updated_at
CREATE TRIGGER update_communication_channels_updated_at
    BEFORE UPDATE ON public.communication_channels
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_channel_messages_updated_at
    BEFORE UPDATE ON public.channel_messages
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();