-- Attendance Regularization Requests Table
CREATE TABLE public.attendance_regularization_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  employee_id UUID NOT NULL REFERENCES public.profiles(id),
  attendance_record_id UUID REFERENCES public.attendance_records(id),
  request_date DATE NOT NULL,
  request_type VARCHAR(50) NOT NULL DEFAULT 'missed_punch',
  original_clock_in TIMESTAMPTZ,
  original_clock_out TIMESTAMPTZ,
  requested_clock_in TIMESTAMPTZ NOT NULL,
  requested_clock_out TIMESTAMPTZ NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.attendance_regularization_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own regularization requests"
ON public.attendance_regularization_requests
FOR SELECT
USING (employee_id = auth.uid() OR organization_id IN (
  SELECT organization_id FROM public.profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can create own regularization requests"
ON public.attendance_regularization_requests
FOR INSERT
WITH CHECK (employee_id = auth.uid());

CREATE POLICY "Managers can update regularization requests"
ON public.attendance_regularization_requests
FOR UPDATE
USING (organization_id IN (
  SELECT organization_id FROM public.profiles WHERE id = auth.uid()
));

-- Employee of the Month Tables
CREATE TABLE public.employee_of_month_nominations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  nominee_id UUID NOT NULL REFERENCES public.profiles(id),
  nominator_id UUID NOT NULL REFERENCES public.profiles(id),
  month VARCHAR(7) NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.employee_of_month_nominations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view nominations in their org"
ON public.employee_of_month_nominations
FOR SELECT
USING (organization_id IN (
  SELECT organization_id FROM public.profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can create nominations"
ON public.employee_of_month_nominations
FOR INSERT
WITH CHECK (nominator_id = auth.uid());

CREATE TABLE public.employee_of_month_winners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  winner_id UUID NOT NULL REFERENCES public.profiles(id),
  month VARCHAR(7) NOT NULL,
  reason TEXT,
  announced_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, month)
);

ALTER TABLE public.employee_of_month_winners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view winners in their org"
ON public.employee_of_month_winners
FOR SELECT
USING (organization_id IN (
  SELECT organization_id FROM public.profiles WHERE id = auth.uid()
));

CREATE POLICY "Admins can create winners"
ON public.employee_of_month_winners
FOR INSERT
WITH CHECK (announced_by = auth.uid());