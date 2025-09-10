-- Drop the foreign key constraint on communication_channels
ALTER TABLE public.communication_channels DROP CONSTRAINT IF EXISTS communication_channels_created_by_fkey;

-- Add correct foreign key constraint to auth.users
ALTER TABLE public.communication_channels 
ADD CONSTRAINT communication_channels_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES auth.users(id);

-- Create default channels with correct user reference
INSERT INTO public.communication_channels (name, description, type, created_by)
SELECT 'General', 'General team discussions', 'public', 
       '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87'
WHERE NOT EXISTS (SELECT 1 FROM public.communication_channels WHERE name = 'General');

INSERT INTO public.communication_channels (name, description, type, created_by)
SELECT 'Announcements', 'Important announcements and updates', 'public', 
       '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87'
WHERE NOT EXISTS (SELECT 1 FROM public.communication_channels WHERE name = 'Announcements');

INSERT INTO public.communication_channels (name, description, type, created_by)
SELECT 'Task Updates', 'Task status updates and discussions', 'public', 
       '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87'
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