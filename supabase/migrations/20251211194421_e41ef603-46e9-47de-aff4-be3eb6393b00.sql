-- Create portfolios table
CREATE TABLE public.portfolios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES public.profiles(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'on_hold', 'completed', 'archived')),
  budget NUMERIC DEFAULT 0,
  spent_budget NUMERIC DEFAULT 0,
  target_roi NUMERIC,
  risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  start_date DATE,
  target_end_date DATE,
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create programs table
CREATE TABLE public.programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  portfolio_id UUID REFERENCES public.portfolios(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES public.profiles(id),
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'on_hold', 'completed', 'cancelled')),
  budget NUMERIC DEFAULT 0,
  spent_budget NUMERIC DEFAULT 0,
  start_date DATE,
  target_end_date DATE,
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add new columns to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS stage TEXT DEFAULT 'planned' CHECK (stage IN ('planned', 'in_progress', 'on_hold', 'completed', 'cancelled')),
ADD COLUMN IF NOT EXISTS health_status TEXT DEFAULT 'green' CHECK (health_status IN ('green', 'amber', 'red')),
ADD COLUMN IF NOT EXISTS health_reason TEXT,
ADD COLUMN IF NOT EXISTS sponsor_id UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS business_case TEXT,
ADD COLUMN IF NOT EXISTS budget NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS spent_budget NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS target_end_date DATE,
ADD COLUMN IF NOT EXISTS actual_end_date DATE,
ADD COLUMN IF NOT EXISTS kpis JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical'));

-- Enable RLS on portfolios
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;

-- Portfolios policies
CREATE POLICY "Users can view portfolios in their org"
ON public.portfolios FOR SELECT
USING (organization_id = get_my_org_id());

CREATE POLICY "Admins can manage portfolios"
ON public.portfolios FOR ALL
USING (is_any_admin(auth.uid()));

-- Enable RLS on programs
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

-- Programs policies
CREATE POLICY "Users can view programs in their org"
ON public.programs FOR SELECT
USING (organization_id = get_my_org_id());

CREATE POLICY "Admins can manage programs"
ON public.programs FOR ALL
USING (is_any_admin(auth.uid()));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_portfolios_org ON public.portfolios(organization_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_owner ON public.portfolios(owner_id);
CREATE INDEX IF NOT EXISTS idx_programs_portfolio ON public.programs(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_programs_org ON public.programs(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_program ON public.projects(program_id);
CREATE INDEX IF NOT EXISTS idx_projects_stage ON public.projects(stage);
CREATE INDEX IF NOT EXISTS idx_projects_health ON public.projects(health_status);

-- Update trigger for portfolios
CREATE TRIGGER update_portfolios_updated_at
BEFORE UPDATE ON public.portfolios
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update trigger for programs
CREATE TRIGGER update_programs_updated_at
BEFORE UPDATE ON public.programs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();