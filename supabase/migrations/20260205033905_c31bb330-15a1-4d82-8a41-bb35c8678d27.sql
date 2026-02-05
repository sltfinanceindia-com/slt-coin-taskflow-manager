-- Create teams table for team management
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create locations table for location/branch management
CREATE TABLE IF NOT EXISTS public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  location_type TEXT DEFAULT 'branch' CHECK (location_type IN ('headquarters', 'branch', 'remote')),
  address TEXT,
  city TEXT,
  country TEXT,
  timezone TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create investment_declarations table for tax declarations
CREATE TABLE IF NOT EXISTS public.investment_declarations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  section TEXT NOT NULL,
  category TEXT NOT NULL,
  declared_amount DECIMAL(12,2) DEFAULT 0,
  verified_amount DECIMAL(12,2) DEFAULT 0,
  max_limit DECIMAL(12,2) DEFAULT 0,
  proof_url TEXT,
  proof_submitted BOOLEAN DEFAULT false,
  financial_year TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  verified_by UUID REFERENCES public.profiles(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create form16_records table for Form 16 generation
CREATE TABLE IF NOT EXISTS public.form16_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  financial_year TEXT NOT NULL,
  gross_salary DECIMAL(12,2) DEFAULT 0,
  total_deductions DECIMAL(12,2) DEFAULT 0,
  taxable_income DECIMAL(12,2) DEFAULT 0,
  tax_paid DECIMAL(12,2) DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'generated', 'sent')),
  generated_date TIMESTAMP WITH TIME ZONE,
  sent_date TIMESTAMP WITH TIME ZONE,
  document_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(organization_id, employee_id, financial_year)
);

-- Enable RLS on all new tables
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_declarations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form16_records ENABLE ROW LEVEL SECURITY;

-- Teams RLS Policies
CREATE POLICY "Users can view teams in their organization"
  ON public.teams FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can manage teams"
  ON public.teams FOR ALL
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Locations RLS Policies
CREATE POLICY "Users can view locations in their organization"
  ON public.locations FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can manage locations"
  ON public.locations FOR ALL
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Investment Declarations RLS Policies
CREATE POLICY "Users can view their own declarations"
  ON public.investment_declarations FOR SELECT
  USING (
    employee_id = auth.uid() OR
    organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can create their own declarations"
  ON public.investment_declarations FOR INSERT
  WITH CHECK (
    employee_id = auth.uid() AND
    organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can update their own declarations"
  ON public.investment_declarations FOR UPDATE
  USING (
    employee_id = auth.uid() OR
    organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  );

-- Form16 Records RLS Policies
CREATE POLICY "Users can view their own Form 16"
  ON public.form16_records FOR SELECT
  USING (
    employee_id = auth.uid() OR
    organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins can manage Form 16 records"
  ON public.form16_records FOR ALL
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Add parent_id and code to departments if missing
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'departments' AND column_name = 'code') THEN
    ALTER TABLE public.departments ADD COLUMN code TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'departments' AND column_name = 'parent_id') THEN
    ALTER TABLE public.departments ADD COLUMN parent_id UUID REFERENCES public.departments(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'departments' AND column_name = 'status') THEN
    ALTER TABLE public.departments ADD COLUMN status TEXT DEFAULT 'active';
  END IF;
END $$;