-- Add missing tables for advanced messaging features

-- Typing indicators table
CREATE TABLE IF NOT EXISTS public.typing_indicators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID NOT NULL,
  user_id UUID NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '10 seconds'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Notification settings table
CREATE TABLE IF NOT EXISTS public.notification_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  push_notifications BOOLEAN NOT NULL DEFAULT true,
  mention_notifications BOOLEAN NOT NULL DEFAULT true,
  channel_notifications JSONB NOT NULL DEFAULT '{}',
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Message threads table  
CREATE TABLE IF NOT EXISTS public.message_threads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_message_id UUID NOT NULL,
  channel_id UUID NOT NULL,
  participant_count INTEGER NOT NULL DEFAULT 0,
  last_message_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Message read receipts table
CREATE TABLE IF NOT EXISTS public.message_read_receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL,
  user_id UUID NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id)
);

-- Update messages table to add threading and status fields
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS thread_id UUID,
ADD COLUMN IF NOT EXISTS message_status TEXT NOT NULL DEFAULT 'sent',
ADD COLUMN IF NOT EXISTS forwarded_from UUID,
ADD COLUMN IF NOT EXISTS is_system_message BOOLEAN NOT NULL DEFAULT false;

-- Update communication_channels table for better management
ALTER TABLE public.communication_channels
ADD COLUMN IF NOT EXISTS settings JSONB NOT NULL DEFAULT '{}',
ADD COLUMN IF NOT EXISTS permissions JSONB NOT NULL DEFAULT '{}',
ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMP WITH TIME ZONE;

-- Enable Row Level Security
ALTER TABLE public.typing_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_read_receipts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for typing_indicators
CREATE POLICY "Users can view typing indicators in their channels"
ON public.typing_indicators FOR SELECT
USING (
  channel_id IN (
    SELECT channel_id FROM public.channel_members 
    WHERE user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Users can insert typing indicators for their channels"
ON public.typing_indicators FOR INSERT
WITH CHECK (
  user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) AND
  channel_id IN (
    SELECT channel_id FROM public.channel_members 
    WHERE user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  )
);

-- RLS Policies for notification_settings
CREATE POLICY "Users can manage their own notification settings"
ON public.notification_settings FOR ALL
USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- RLS Policies for message_threads
CREATE POLICY "Users can view threads in accessible channels"
ON public.message_threads FOR SELECT
USING (
  channel_id IN (
    SELECT channel_id FROM public.channel_members 
    WHERE user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Users can create threads in accessible channels"
ON public.message_threads FOR INSERT
WITH CHECK (
  channel_id IN (
    SELECT channel_id FROM public.channel_members 
    WHERE user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  )
);

-- RLS Policies for message_read_receipts
CREATE POLICY "Users can view read receipts for accessible messages"
ON public.message_read_receipts FOR SELECT
USING (
  message_id IN (
    SELECT id FROM public.messages m
    WHERE m.channel_id IN (
      SELECT channel_id FROM public.channel_members 
      WHERE user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    )
  )
);

CREATE POLICY "Users can create their own read receipts"
ON public.message_read_receipts FOR INSERT
WITH CHECK (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_typing_indicators_channel_user ON public.typing_indicators(channel_id, user_id);
CREATE INDEX IF NOT EXISTS idx_typing_indicators_expires ON public.typing_indicators(expires_at);
CREATE INDEX IF NOT EXISTS idx_message_threads_parent ON public.message_threads(parent_message_id);
CREATE INDEX IF NOT EXISTS idx_message_read_receipts_message ON public.message_read_receipts(message_id);
CREATE INDEX IF NOT EXISTS idx_messages_thread ON public.messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_channels_last_message ON public.communication_channels(last_message_at);

-- Trigger to clean up expired typing indicators
CREATE OR REPLACE FUNCTION public.cleanup_expired_typing_indicators()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.typing_indicators
  WHERE expires_at < now();
END;
$$;

-- Trigger to update thread participant count
CREATE OR REPLACE FUNCTION public.update_thread_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.thread_id IS NOT NULL THEN
    UPDATE public.message_threads
    SET 
      participant_count = (
        SELECT COUNT(DISTINCT sender_id) 
        FROM public.messages 
        WHERE thread_id = NEW.thread_id
      ),
      last_message_at = NEW.created_at,
      updated_at = now()
    WHERE id = NEW.thread_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER update_thread_stats_trigger
  AFTER INSERT OR UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_thread_stats();

-- Trigger to update channel last message timestamp
CREATE OR REPLACE FUNCTION public.update_channel_last_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.channel_id IS NOT NULL THEN
    UPDATE public.communication_channels
    SET 
      last_message_at = NEW.created_at,
      updated_at = now()
    WHERE id = NEW.channel_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER update_channel_last_message_trigger
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_channel_last_message();