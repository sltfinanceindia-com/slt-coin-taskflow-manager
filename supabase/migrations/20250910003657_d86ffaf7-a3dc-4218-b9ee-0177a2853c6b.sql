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

-- Create trigger to auto-add users to default channels
DROP TRIGGER IF EXISTS auto_add_to_default_channels_trigger ON public.profiles;
CREATE TRIGGER auto_add_to_default_channels_trigger
    AFTER INSERT ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.auto_add_user_to_default_channels();

-- Fix session logs policy issue
DROP POLICY IF EXISTS "Users can view their own session logs" ON public.session_logs;
DROP POLICY IF EXISTS "Users can insert their own session logs" ON public.session_logs;
DROP POLICY IF EXISTS "Users can update their own session logs" ON public.session_logs;

CREATE POLICY "Users can view their own session logs" ON public.session_logs
    FOR SELECT USING (user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own session logs" ON public.session_logs
    FOR INSERT WITH CHECK (user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own session logs" ON public.session_logs
    FOR UPDATE USING (user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));