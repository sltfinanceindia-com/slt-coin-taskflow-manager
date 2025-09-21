-- Create webhook endpoints table
CREATE TABLE public.webhook_endpoints (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    url TEXT NOT NULL,
    secret TEXT,
    events TEXT[] NOT NULL DEFAULT '{}',
    active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create webhook deliveries table for logging
CREATE TABLE public.webhook_deliveries (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    endpoint_id UUID NOT NULL REFERENCES public.webhook_endpoints(id) ON DELETE CASCADE,
    event_id TEXT NOT NULL,
    status_code INTEGER NOT NULL,
    success BOOLEAN NOT NULL DEFAULT false,
    delivered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    response_body TEXT,
    retry_count INTEGER NOT NULL DEFAULT 0
);

-- Create calendar events table
CREATE TABLE public.calendar_events (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    event_type TEXT NOT NULL DEFAULT 'meeting',
    attendees TEXT[] DEFAULT '{}',
    location TEXT,
    is_online BOOLEAN DEFAULT false,
    meeting_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for webhook_endpoints
CREATE POLICY "Admins can manage webhook endpoints" 
ON public.webhook_endpoints 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- RLS Policies for webhook_deliveries
CREATE POLICY "Admins can view webhook deliveries" 
ON public.webhook_deliveries 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- RLS Policies for calendar_events
CREATE POLICY "Users can manage their own calendar events" 
ON public.calendar_events 
FOR ALL 
USING (user_id IN (
  SELECT id FROM public.profiles WHERE user_id = auth.uid()
));

-- Create indexes for performance
CREATE INDEX idx_webhook_endpoints_active ON public.webhook_endpoints(active);
CREATE INDEX idx_webhook_deliveries_endpoint_id ON public.webhook_deliveries(endpoint_id);
CREATE INDEX idx_calendar_events_user_id ON public.calendar_events(user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_webhook_endpoints_updated_at
    BEFORE UPDATE ON public.webhook_endpoints
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_calendar_events_updated_at
    BEFORE UPDATE ON public.calendar_events
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();