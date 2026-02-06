-- Create reimbursements table
CREATE TABLE IF NOT EXISTS public.reimbursements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  employee_id UUID NOT NULL REFERENCES public.profiles(id),
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  description TEXT,
  receipt_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'approved', 'rejected', 'paid')),
  submitted_date DATE NOT NULL DEFAULT CURRENT_DATE,
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  payment_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reimbursements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (using text role column on profiles, not enum)
CREATE POLICY "Users can view own reimbursements"
  ON public.reimbursements FOR SELECT
  USING (
    employee_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.organization_id = reimbursements.organization_id
      AND ur.role IN ('admin', 'org_admin', 'super_admin')
    )
  );

CREATE POLICY "Users can create own reimbursements"
  ON public.reimbursements FOR INSERT
  WITH CHECK (
    employee_id = auth.uid() 
    AND organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can update reimbursements"
  ON public.reimbursements FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.organization_id = reimbursements.organization_id
      AND ur.role IN ('admin', 'org_admin', 'super_admin')
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_reimbursements_updated_at
  BEFORE UPDATE ON public.reimbursements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();