-- Fix foreign key constraints for channel_members to reference auth.users directly
ALTER TABLE public.channel_members DROP CONSTRAINT IF EXISTS channel_members_user_id_fkey;
ALTER TABLE public.channel_members 
ADD CONSTRAINT channel_members_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id);

-- Now create just the channels first
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