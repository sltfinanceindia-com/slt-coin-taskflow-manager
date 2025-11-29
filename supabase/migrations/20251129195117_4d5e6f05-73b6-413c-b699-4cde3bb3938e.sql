-- Create coin_rates table
CREATE TABLE IF NOT EXISTS public.coin_rates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rate DECIMAL(18, 8) NOT NULL CHECK (rate > 0),
  rate_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  change_percentage DECIMAL(10, 4),
  volume_24h DECIMAL(18, 2),
  market_cap DECIMAL(18, 2),
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.coin_rates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view coin rates"
  ON public.coin_rates FOR SELECT 
  USING (true);

CREATE POLICY "Only admins can insert coin rates"
  ON public.coin_rates FOR INSERT 
  TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can update coin rates"
  ON public.coin_rates FOR UPDATE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete coin rates"
  ON public.coin_rates FOR DELETE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Create indexes for performance
CREATE INDEX idx_coin_rates_date ON public.coin_rates(rate_date DESC);
CREATE INDEX idx_coin_rates_created_at ON public.coin_rates(created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_coin_rates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for updated_at
CREATE TRIGGER coin_rates_updated_at
  BEFORE UPDATE ON public.coin_rates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_coin_rates_updated_at();

-- Insert initial coin rate data (optional)
INSERT INTO public.coin_rates (rate, rate_date, change_percentage, volume_24h, market_cap, notes)
VALUES 
  (1.00, NOW(), 0.00, 100000.00, 1000000.00, 'Initial SLT coin rate'),
  (1.02, NOW() - INTERVAL '1 day', 2.00, 98000.00, 1020000.00, 'Day 1 rate'),
  (0.98, NOW() - INTERVAL '2 days', -2.00, 95000.00, 980000.00, 'Day 2 rate'),
  (1.05, NOW() - INTERVAL '3 days', 5.00, 110000.00, 1050000.00, 'Day 3 rate'),
  (1.01, NOW() - INTERVAL '4 days', 1.00, 102000.00, 1010000.00, 'Day 4 rate'),
  (0.99, NOW() - INTERVAL '5 days', -1.00, 97000.00, 990000.00, 'Day 5 rate'),
  (1.03, NOW() - INTERVAL '6 days', 3.00, 105000.00, 1030000.00, 'Day 6 rate')
ON CONFLICT DO NOTHING;