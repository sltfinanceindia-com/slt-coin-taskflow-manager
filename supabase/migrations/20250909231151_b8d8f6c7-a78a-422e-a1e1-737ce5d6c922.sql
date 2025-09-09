-- Create communication channels table
CREATE TABLE public.communication_channels (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  type text NOT NULL DEFAULT 'public',
  created_by uuid NOT NULL REFERENCES public.profiles(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  member_count integer DEFAULT 0
);

-- Create messages table
CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content text NOT NULL,
  sender_id uuid NOT NULL REFERENCES public.profiles(id),
  receiver_id uuid REFERENCES public.profiles(id),
  channel_id uuid REFERENCES public.communication_channels(id),
  message_type text NOT NULL DEFAULT 'text',
  attachments jsonb DEFAULT '[]'::jsonb,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create channel members table
CREATE TABLE public.channel_members (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id uuid NOT NULL REFERENCES public.communication_channels(id),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  role text DEFAULT 'member',
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(channel_id, user_id)
);

-- Enable RLS
ALTER TABLE public.communication_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_members ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for communication_channels
CREATE POLICY "Users can view channels they are members of" 
ON public.communication_channels 
FOR SELECT 
USING (
  id IN (
    SELECT channel_id FROM public.channel_members 
    WHERE user_id IN (
      SELECT id FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  ) OR 
  type = 'public' OR
  created_by IN (
    SELECT id FROM public.profiles 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create channels" 
ON public.communication_channels 
FOR INSERT 
WITH CHECK (
  created_by IN (
    SELECT id FROM public.profiles 
    WHERE user_id = auth.uid()
  )
);

-- Create RLS policies for messages
CREATE POLICY "Users can view messages in their channels" 
ON public.messages 
FOR SELECT 
USING (
  channel_id IN (
    SELECT channel_id FROM public.channel_members 
    WHERE user_id IN (
      SELECT id FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  ) OR
  sender_id IN (
    SELECT id FROM public.profiles 
    WHERE user_id = auth.uid()
  ) OR
  receiver_id IN (
    SELECT id FROM public.profiles 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can send messages to their channels" 
ON public.messages 
FOR INSERT 
WITH CHECK (
  sender_id IN (
    SELECT id FROM public.profiles 
    WHERE user_id = auth.uid()
  ) AND (
    channel_id IN (
      SELECT channel_id FROM public.channel_members 
      WHERE user_id IN (
        SELECT id FROM public.profiles 
        WHERE user_id = auth.uid()
      )
    ) OR 
    receiver_id IS NOT NULL
  )
);

-- Create RLS policies for channel_members
CREATE POLICY "Users can view channel memberships" 
ON public.channel_members 
FOR SELECT 
USING (
  channel_id IN (
    SELECT id FROM public.communication_channels 
    WHERE type = 'public' OR 
    created_by IN (
      SELECT id FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  ) OR
  user_id IN (
    SELECT id FROM public.profiles 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can join channels" 
ON public.channel_members 
FOR INSERT 
WITH CHECK (
  user_id IN (
    SELECT id FROM public.profiles 
    WHERE user_id = auth.uid()
  )
);

-- Create updated_at trigger
CREATE TRIGGER update_communication_channels_updated_at
  BEFORE UPDATE ON public.communication_channels
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();