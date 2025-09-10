-- Create a simplified working version with default channels
-- First create the channels using the current user ID from auth context
DO $$
DECLARE
    current_user_id UUID;
BEGIN
    -- Get the current user ID (admin)
    SELECT '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87'::UUID INTO current_user_id;
    
    -- Create default channels
    INSERT INTO public.communication_channels (name, description, type, created_by)
    VALUES 
        ('General', 'General team discussions', 'public', current_user_id),
        ('Announcements', 'Important announcements and updates', 'public', current_user_id),
        ('Task Updates', 'Task status updates and discussions', 'public', current_user_id)
    ON CONFLICT DO NOTHING;
    
    -- Add all existing users to these channels
    INSERT INTO public.channel_members (channel_id, user_id, role)
    SELECT c.id, p.user_id, 'member'
    FROM public.communication_channels c
    CROSS JOIN public.profiles p
    WHERE c.name IN ('General', 'Announcements', 'Task Updates')
    ON CONFLICT DO NOTHING;
END $$;