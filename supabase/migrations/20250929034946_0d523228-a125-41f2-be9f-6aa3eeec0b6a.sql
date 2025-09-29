-- Create webrtc_signals table for call signaling
CREATE TABLE public.webrtc_signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  call_id TEXT NOT NULL,
  sender_id UUID NOT NULL,
  signal_type TEXT NOT NULL,
  signal_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.webrtc_signals ENABLE ROW LEVEL SECURITY;

-- Create policies for webrtc_signals
CREATE POLICY "Users can insert their own signals" 
ON public.webrtc_signals 
FOR INSERT 
WITH CHECK (sender_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()));

CREATE POLICY "Users can view signals for their calls" 
ON public.webrtc_signals 
FOR SELECT 
USING (sender_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()));

-- Update call_history table to add missing columns
ALTER TABLE public.call_history 
ADD COLUMN IF NOT EXISTS call_type TEXT DEFAULT 'voice',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ringing';

-- Create indexes for better performance
CREATE INDEX idx_webrtc_signals_call_id ON public.webrtc_signals(call_id);
CREATE INDEX idx_webrtc_signals_sender_id ON public.webrtc_signals(sender_id);
CREATE INDEX idx_call_history_status ON public.call_history(status);