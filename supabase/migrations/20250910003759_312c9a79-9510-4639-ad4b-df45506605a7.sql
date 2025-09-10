-- Create default channels with correct admin user
INSERT INTO public.communication_channels (name, description, type, created_by)
SELECT 'General', 'General team discussions', 'public', 
       'cbc4df08-b653-4006-ab26-20ad66e5e65e'
WHERE NOT EXISTS (SELECT 1 FROM public.communication_channels WHERE name = 'General');

INSERT INTO public.communication_channels (name, description, type, created_by)
SELECT 'Announcements', 'Important announcements and updates', 'public', 
       'cbc4df08-b653-4006-ab26-20ad66e5e65e'
WHERE NOT EXISTS (SELECT 1 FROM public.communication_channels WHERE name = 'Announcements');

INSERT INTO public.communication_channels (name, description, type, created_by)
SELECT 'Task Updates', 'Task status updates and discussions', 'public', 
       'cbc4df08-b653-4006-ab26-20ad66e5e65e'
WHERE NOT EXISTS (SELECT 1 FROM public.communication_channels WHERE name = 'Task Updates');

-- Auto-add all users to default channels
WITH default_channels AS (
    SELECT id FROM public.communication_channels 
    WHERE name IN ('General', 'Announcements', 'Task Updates')
),
all_users AS (
    SELECT user_id FROM public.profiles
)
INSERT INTO public.channel_members (channel_id, user_id, role)
SELECT dc.id, au.user_id, 'member'
FROM default_channels dc
CROSS JOIN all_users au
WHERE NOT EXISTS (
    SELECT 1 FROM public.channel_members cm 
    WHERE cm.channel_id = dc.id AND cm.user_id = au.user_id
);