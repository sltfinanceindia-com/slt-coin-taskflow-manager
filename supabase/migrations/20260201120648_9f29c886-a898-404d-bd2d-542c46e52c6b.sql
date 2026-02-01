-- Create trial_signups table to store lead data from the start trial form
CREATE TABLE IF NOT EXISTS public.trial_signups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company_name TEXT NOT NULL,
  company_size TEXT NOT NULL,
  industry TEXT NOT NULL,
  selected_modules TEXT[] NOT NULL DEFAULT '{}',
  source TEXT DEFAULT 'website',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'converted', 'declined')),
  notes TEXT,
  converted_to_org_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for quick lookups
CREATE INDEX idx_trial_signups_email ON public.trial_signups(email);
CREATE INDEX idx_trial_signups_status ON public.trial_signups(status);
CREATE INDEX idx_trial_signups_created_at ON public.trial_signups(created_at DESC);

-- Enable RLS
ALTER TABLE public.trial_signups ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert trial signups (public form)
CREATE POLICY "Anyone can submit trial signups"
ON public.trial_signups
FOR INSERT
WITH CHECK (true);

-- Only admins can view trial signups
CREATE POLICY "Super admins can view trial signups"
ON public.trial_signups
FOR SELECT
USING (public.is_super_admin());

-- Super admins can update trial signups
CREATE POLICY "Super admins can update trial signups"
ON public.trial_signups
FOR UPDATE
USING (public.is_super_admin());

-- Create trigger for updated_at
CREATE TRIGGER update_trial_signups_updated_at
  BEFORE UPDATE ON public.trial_signups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();