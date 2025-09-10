-- Create default communication channels and add all users as members

-- First, create the default channels using the correct admin profile ID
INSERT INTO public.communication_channels (name, description, type, created_by)
SELECT 'General', 'General team discussions', 'public', p.id
FROM public.profiles p
WHERE p.role = 'admin'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.communication_channels (name, description, type, created_by)
SELECT 'Announcements', 'Important announcements and updates', 'public', p.id
FROM public.profiles p
WHERE p.role = 'admin'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.communication_channels (name, description, type, created_by)
SELECT 'Task Updates', 'Task status updates and discussions', 'public', p.id
FROM public.profiles p
WHERE p.role = 'admin'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Add all existing users as members to all public channels
INSERT INTO public.channel_members (channel_id, user_id, role)
SELECT cc.id, p.id, 
       CASE 
         WHEN p.role = 'admin' THEN 'admin'
         ELSE 'member'
       END as role
FROM public.communication_channels cc
CROSS JOIN public.profiles p
WHERE cc.type = 'public'
ON CONFLICT (channel_id, user_id) DO NOTHING;