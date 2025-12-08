-- Shift types/templates table
CREATE TABLE public.shift_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  name TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Shift schedules (actual assignments)
CREATE TABLE public.shift_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  shift_type_id UUID REFERENCES public.shift_types(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  schedule_date DATE NOT NULL,
  actual_start_time TIMESTAMP WITH TIME ZONE,
  actual_end_time TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_employee_date UNIQUE (employee_id, schedule_date)
);

-- Shift swap requests
CREATE TABLE public.shift_swap_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  requester_schedule_id UUID REFERENCES public.shift_schedules(id) ON DELETE CASCADE,
  target_schedule_id UUID REFERENCES public.shift_schedules(id) ON DELETE CASCADE,
  requester_id UUID REFERENCES public.profiles(id),
  target_employee_id UUID REFERENCES public.profiles(id),
  status TEXT NOT NULL DEFAULT 'pending',
  requester_reason TEXT,
  target_response TEXT,
  manager_approved_by UUID REFERENCES public.profiles(id),
  manager_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shift_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_swap_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for shift_types
CREATE POLICY "Users can view shift types in their org" ON public.shift_types
FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can manage shift types" ON public.shift_types
FOR ALL USING (
  organization_id = get_user_organization_id() 
  AND is_any_admin(auth.uid())
);

-- RLS Policies for shift_schedules
CREATE POLICY "Users can view schedules in their org" ON public.shift_schedules
FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can manage schedules" ON public.shift_schedules
FOR ALL USING (
  organization_id = get_user_organization_id() 
  AND is_any_admin(auth.uid())
);

CREATE POLICY "Users can view their own schedules" ON public.shift_schedules
FOR SELECT USING (employee_id = get_user_profile_id());

-- RLS Policies for shift_swap_requests
CREATE POLICY "Users can view swap requests they're involved in" ON public.shift_swap_requests
FOR SELECT USING (
  requester_id = get_user_profile_id() 
  OR target_employee_id = get_user_profile_id()
  OR is_any_admin(auth.uid())
);

CREATE POLICY "Users can create swap requests" ON public.shift_swap_requests
FOR INSERT WITH CHECK (requester_id = get_user_profile_id());

CREATE POLICY "Target can update swap request" ON public.shift_swap_requests
FOR UPDATE USING (
  target_employee_id = get_user_profile_id() 
  OR is_any_admin(auth.uid())
);

CREATE POLICY "Admins can manage all swap requests" ON public.shift_swap_requests
FOR ALL USING (is_any_admin(auth.uid()));

-- Indexes for performance
CREATE INDEX idx_shift_schedules_date ON public.shift_schedules(schedule_date);
CREATE INDEX idx_shift_schedules_employee ON public.shift_schedules(employee_id);
CREATE INDEX idx_shift_schedules_org ON public.shift_schedules(organization_id);
CREATE INDEX idx_shift_swap_requests_status ON public.shift_swap_requests(status);