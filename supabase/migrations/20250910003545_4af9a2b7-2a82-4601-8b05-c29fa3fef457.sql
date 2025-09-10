-- Fix infinite recursion in communication channel policies
DROP POLICY IF EXISTS "Users can view channels they are members of" ON public.communication_channels;
DROP POLICY IF EXISTS "Users can create channels" ON public.communication_channels;
DROP POLICY IF EXISTS "Users can update channels they created or are admins" ON public.communication_channels;
DROP POLICY IF EXISTS "Users can delete channels they created or are admins" ON public.communication_channels;

DROP POLICY IF EXISTS "Users can view their own channel memberships" ON public.channel_members;
DROP POLICY IF EXISTS "Users can join channels" ON public.channel_members;
DROP POLICY IF EXISTS "Users can leave channels or admins can remove members" ON public.channel_members;

DROP POLICY IF EXISTS "Users can view messages in channels they are members of" ON public.channel_messages;
DROP POLICY IF EXISTS "Users can send messages to channels they are members of" ON public.channel_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.channel_messages;
DROP POLICY IF EXISTS "Users can delete their own messages or admins can delete any" ON public.channel_messages;

-- Create simplified non-recursive policies for communication_channels
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

-- Create default channels for team communication
INSERT INTO public.communication_channels (name, description, type, created_by)
SELECT 'General', 'General team discussions', 'public', 
       (SELECT user_id FROM public.profiles WHERE role = 'admin' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.communication_channels WHERE name = 'General');

INSERT INTO public.communication_channels (name, description, type, created_by)
SELECT 'Announcements', 'Important announcements and updates', 'public', 
       (SELECT user_id FROM public.profiles WHERE role = 'admin' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.communication_channels WHERE name = 'Announcements');

INSERT INTO public.communication_channels (name, description, type, created_by)
SELECT 'Task Updates', 'Task status updates and discussions', 'public', 
       (SELECT user_id FROM public.profiles WHERE role = 'admin' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.communication_channels WHERE name = 'Task Updates');

-- Auto-add all users to default channels
WITH default_channels AS (
    SELECT id FROM public.communication_channels 
    WHERE name IN ('General', 'Announcements', 'Task Updates')
),
all_profiles AS (
    SELECT user_id FROM public.profiles
)
INSERT INTO public.channel_members (channel_id, user_id, role)
SELECT dc.id, ap.user_id, 'member'
FROM default_channels dc
CROSS JOIN all_profiles ap
WHERE NOT EXISTS (
    SELECT 1 FROM public.channel_members cm 
    WHERE cm.channel_id = dc.id AND cm.user_id = ap.user_id
);

-- Function to auto-add new users to default channels
CREATE OR REPLACE FUNCTION public.auto_add_user_to_default_channels()
RETURNS TRIGGER AS $$
BEGIN
    -- Add new user to default channels
    INSERT INTO public.channel_members (channel_id, user_id, role)
    SELECT c.id, NEW.user_id, 'member'
    FROM public.communication_channels c
    WHERE c.name IN ('General', 'Announcements', 'Task Updates');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;