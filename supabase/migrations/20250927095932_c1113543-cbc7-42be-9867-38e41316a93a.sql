-- Create chat_users table for managing chat participants
CREATE TABLE IF NOT EXISTS public.chat_users (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'busy', 'away')),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.chat_users ENABLE ROW LEVEL SECURITY;

-- Create policies for chat_users
CREATE POLICY "Users can view all chat users" ON public.chat_users FOR SELECT USING (true);
CREATE POLICY "Users can update their own chat status" ON public.chat_users FOR UPDATE USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "System can insert chat users" ON public.chat_users FOR INSERT WITH CHECK (true);

-- Update existing call_history table to be more comprehensive
ALTER TABLE public.call_history ADD COLUMN IF NOT EXISTS answered_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.call_history ADD COLUMN IF NOT EXISTS missed BOOLEAN DEFAULT false;

-- Create message_states table for tracking message delivery
CREATE TABLE IF NOT EXISTS public.message_states (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    state TEXT NOT NULL DEFAULT 'sent' CHECK (state IN ('sent', 'delivered', 'read')),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(message_id, user_id)
);

-- Enable RLS
ALTER TABLE public.message_states ENABLE ROW LEVEL SECURITY;

-- Create policies for message_states
CREATE POLICY "Users can view message states for their messages" ON public.message_states FOR SELECT 
USING (
    message_id IN (
        SELECT id FROM messages 
        WHERE sender_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        OR receiver_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        OR channel_id IN (SELECT channel_id FROM channel_members WHERE user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
    )
);

CREATE POLICY "Users can update message states" ON public.message_states FOR ALL 
USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Create file_attachments table
CREATE TABLE IF NOT EXISTS public.file_attachments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    file_type TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.file_attachments ENABLE ROW LEVEL SECURITY;

-- Create policies for file_attachments
CREATE POLICY "Users can view attachments for accessible messages" ON public.file_attachments FOR SELECT 
USING (
    message_id IN (
        SELECT id FROM messages 
        WHERE sender_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        OR receiver_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        OR channel_id IN (SELECT channel_id FROM channel_members WHERE user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
    )
);

CREATE POLICY "Users can upload attachments" ON public.file_attachments FOR INSERT 
WITH CHECK (uploaded_by IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Create groups table
CREATE TABLE IF NOT EXISTS public.groups (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    avatar_url TEXT,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    is_private BOOLEAN DEFAULT false,
    member_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create group_members table (create this before adding policies that reference it)
CREATE TABLE IF NOT EXISTS public.group_members (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(group_id, user_id)
);

-- Enable RLS for groups
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Create policies for groups
CREATE POLICY "Users can view groups they are members of" ON public.groups FOR SELECT 
USING (
    id IN (SELECT group_id FROM group_members WHERE user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
    OR created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can create groups" ON public.groups FOR INSERT 
WITH CHECK (created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Group creators can update their groups" ON public.groups FOR UPDATE 
USING (created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Create policies for group_members
CREATE POLICY "Users can view group members for their groups" ON public.group_members FOR SELECT 
USING (
    group_id IN (SELECT group_id FROM group_members WHERE user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
    OR user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Group admins can manage members" ON public.group_members FOR ALL 
USING (
    group_id IN (
        SELECT group_id FROM group_members 
        WHERE user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) 
        AND role = 'admin'
    )
);

-- Create functions for real-time status updates
CREATE OR REPLACE FUNCTION public.update_chat_user_status(
    p_user_id UUID,
    p_status TEXT
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.chat_users (user_id, status, last_seen)
    VALUES (p_user_id, p_status, now())
    ON CONFLICT (user_id) 
    DO UPDATE SET
        status = EXCLUDED.status,
        last_seen = EXCLUDED.last_seen,
        updated_at = now();
END;
$$;

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_chat_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.chat_users (user_id, status)
    VALUES (NEW.id, 'offline')
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
    AFTER INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_chat_user();

-- Update updated_at trigger for tables
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_chat_users_updated_at BEFORE UPDATE ON public.chat_users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON public.groups FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Enable realtime for new tables
ALTER TABLE public.chat_users REPLICA IDENTITY FULL;
ALTER TABLE public.message_states REPLICA IDENTITY FULL;
ALTER TABLE public.file_attachments REPLICA IDENTITY FULL;
ALTER TABLE public.groups REPLICA IDENTITY FULL;
ALTER TABLE public.group_members REPLICA IDENTITY FULL;