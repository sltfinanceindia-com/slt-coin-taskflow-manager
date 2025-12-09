
-- Leave Types table
CREATE TABLE public.leave_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  name TEXT NOT NULL,
  description TEXT,
  days_per_year INTEGER NOT NULL DEFAULT 0,
  is_paid BOOLEAN DEFAULT true,
  color TEXT DEFAULT '#3B82F6',
  is_active BOOLEAN DEFAULT true,
  allow_carry_forward BOOLEAN DEFAULT false,
  max_carry_forward_days INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Leave Balances table
CREATE TABLE public.leave_balances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES public.leave_types(id) ON DELETE CASCADE,
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  total_days NUMERIC(5,2) NOT NULL DEFAULT 0,
  used_days NUMERIC(5,2) NOT NULL DEFAULT 0,
  pending_days NUMERIC(5,2) NOT NULL DEFAULT 0,
  carried_forward NUMERIC(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id, leave_type_id, year)
);

-- Leave Requests table
CREATE TABLE public.leave_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES public.leave_types(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days NUMERIC(5,2) NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  is_half_day BOOLEAN DEFAULT false,
  half_day_type TEXT CHECK (half_day_type IN ('first_half', 'second_half')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Attendance Settings (for geo-fencing)
CREATE TABLE public.attendance_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  office_latitude NUMERIC(10, 7),
  office_longitude NUMERIC(10, 7),
  geo_fence_radius_meters INTEGER DEFAULT 100,
  enable_geo_fencing BOOLEAN DEFAULT false,
  work_start_time TIME DEFAULT '09:00',
  work_end_time TIME DEFAULT '18:00',
  late_threshold_minutes INTEGER DEFAULT 15,
  early_leave_threshold_minutes INTEGER DEFAULT 15,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Attendance Records (enhanced)
CREATE TABLE public.attendance_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL,
  clock_in_time TIMESTAMP WITH TIME ZONE,
  clock_out_time TIMESTAMP WITH TIME ZONE,
  clock_in_latitude NUMERIC(10, 7),
  clock_in_longitude NUMERIC(10, 7),
  clock_out_latitude NUMERIC(10, 7),
  clock_out_longitude NUMERIC(10, 7),
  clock_in_within_geofence BOOLEAN,
  clock_out_within_geofence BOOLEAN,
  status TEXT DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'half_day', 'on_leave', 'wfh')),
  total_hours NUMERIC(5,2),
  overtime_hours NUMERIC(5,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id, attendance_date)
);

-- WFH Requests table
CREATE TABLE public.wfh_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  request_date DATE NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id, request_date)
);

-- WFH Policy table
CREATE TABLE public.wfh_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  max_wfh_days_per_month INTEGER DEFAULT 8,
  require_approval BOOLEAN DEFAULT true,
  advance_notice_days INTEGER DEFAULT 1,
  blackout_days TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wfh_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wfh_policies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for leave_types
CREATE POLICY "Authenticated users can view leave types" ON public.leave_types
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage leave types" ON public.leave_types
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
  ));

-- RLS Policies for leave_balances
CREATE POLICY "Users can view their own leave balances" ON public.leave_balances
  FOR SELECT USING (employee_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all leave balances" ON public.leave_balances
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
  ));

-- RLS Policies for leave_requests
CREATE POLICY "Users can view their own leave requests" ON public.leave_requests
  FOR SELECT USING (employee_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) 
    OR EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'));

CREATE POLICY "Users can create their own leave requests" ON public.leave_requests
  FOR INSERT WITH CHECK (employee_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own pending leave requests" ON public.leave_requests
  FOR UPDATE USING (
    (employee_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) AND status = 'pending')
    OR EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin')
  );

-- RLS Policies for attendance_settings
CREATE POLICY "Authenticated users can view attendance settings" ON public.attendance_settings
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage attendance settings" ON public.attendance_settings
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
  ));

-- RLS Policies for attendance_records
CREATE POLICY "Users can view their own attendance" ON public.attendance_records
  FOR SELECT USING (employee_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) 
    OR EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'));

CREATE POLICY "Users can manage their own attendance" ON public.attendance_records
  FOR ALL USING (employee_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) 
    OR EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'));

-- RLS Policies for wfh_requests
CREATE POLICY "Users can view their own WFH requests" ON public.wfh_requests
  FOR SELECT USING (employee_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) 
    OR EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'));

CREATE POLICY "Users can create their own WFH requests" ON public.wfh_requests
  FOR INSERT WITH CHECK (employee_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own pending WFH requests" ON public.wfh_requests
  FOR UPDATE USING (
    (employee_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) AND status = 'pending')
    OR EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin')
  );

-- RLS Policies for wfh_policies
CREATE POLICY "Authenticated users can view WFH policies" ON public.wfh_policies
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage WFH policies" ON public.wfh_policies
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
  ));

-- Insert default leave types
INSERT INTO public.leave_types (name, description, days_per_year, color, allow_carry_forward, max_carry_forward_days) VALUES
  ('Annual Leave', 'Regular vacation leave', 21, '#3B82F6', true, 5),
  ('Sick Leave', 'Medical or health-related leave', 10, '#EF4444', false, 0),
  ('Casual Leave', 'Personal or emergency leave', 7, '#F59E0B', false, 0),
  ('Maternity Leave', 'Leave for new mothers', 90, '#EC4899', false, 0),
  ('Paternity Leave', 'Leave for new fathers', 14, '#8B5CF6', false, 0);
