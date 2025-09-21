-- Create call_history table for tracking call activities
CREATE TABLE public.call_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  caller_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  call_type TEXT NOT NULL CHECK (call_type IN ('voice', 'video')),
  status TEXT NOT NULL CHECK (status IN ('completed', 'missed', 'declined', 'busy', 'no_answer')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.call_history ENABLE ROW LEVEL SECURITY;

-- Create policies for call history
CREATE POLICY "Users can view their own call history" 
ON public.call_history 
FOR SELECT 
USING (
  caller_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
  receiver_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can insert their own call records" 
ON public.call_history 
FOR INSERT 
WITH CHECK (
  caller_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can update their own call records" 
ON public.call_history 
FOR UPDATE 
USING (
  caller_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
  receiver_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

-- Create indexes for better performance
CREATE INDEX idx_call_history_caller ON public.call_history(caller_id);
CREATE INDEX idx_call_history_receiver ON public.call_history(receiver_id);
CREATE INDEX idx_call_history_started_at ON public.call_history(started_at);

-- Add realtime for call_history
ALTER TABLE public.call_history REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.call_history;