
-- Seed holidays
INSERT INTO public.holidays (organization_id, name, holiday_date, holiday_type, description, is_recurring, created_by) VALUES
  ('81ce98aa-c524-4872-ab4c-95e66fe49a08', 'Republic Day', '2026-01-26', 'public', 'National holiday', true, '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87'),
  ('81ce98aa-c524-4872-ab4c-95e66fe49a08', 'Sankranti', '2026-01-14', 'regional', 'Harvest festival', true, '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87'),
  ('81ce98aa-c524-4872-ab4c-95e66fe49a08', 'Holi', '2026-03-17', 'public', 'Festival of Colors', true, '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87'),
  ('81ce98aa-c524-4872-ab4c-95e66fe49a08', 'Ugadi', '2026-03-28', 'regional', 'Telugu New Year', true, '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87'),
  ('81ce98aa-c524-4872-ab4c-95e66fe49a08', 'Good Friday', '2026-04-03', 'restricted', 'Christian holiday', true, '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87'),
  ('81ce98aa-c524-4872-ab4c-95e66fe49a08', 'Independence Day', '2026-08-15', 'public', 'National holiday', true, '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87'),
  ('81ce98aa-c524-4872-ab4c-95e66fe49a08', 'Gandhi Jayanti', '2026-10-02', 'public', 'Birthday of Mahatma Gandhi', true, '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87'),
  ('81ce98aa-c524-4872-ab4c-95e66fe49a08', 'Dussehra', '2026-10-20', 'public', 'Victory of good over evil', true, '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87'),
  ('81ce98aa-c524-4872-ab4c-95e66fe49a08', 'Diwali', '2026-11-08', 'public', 'Festival of Lights', true, '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87'),
  ('81ce98aa-c524-4872-ab4c-95e66fe49a08', 'Christmas', '2026-12-25', 'restricted', 'Christian holiday', true, '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87')
ON CONFLICT DO NOTHING;

-- Seed announcements
INSERT INTO public.announcements (organization_id, title, content, created_by, priority, is_pinned) VALUES
  ('81ce98aa-c524-4872-ab4c-95e66fe49a08', 'Welcome to TeneXA Platform', 'We are excited to announce the launch of our new workforce management platform.', '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87', 'high', true),
  ('81ce98aa-c524-4872-ab4c-95e66fe49a08', 'Q1 2026 Performance Review Cycle', 'Performance review cycle begins April 1st. Ensure task updates and time logs are current.', '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87', 'medium', false)
ON CONFLICT DO NOTHING;

-- Seed notifications
INSERT INTO public.notifications (user_id, organization_id, type, title, message, data) VALUES
  ('6fb191ba-81d6-4302-8fc9-e76e2dfcbe87', '81ce98aa-c524-4872-ab4c-95e66fe49a08', 'system', 'Platform Audit Complete', 'All database functions and profile metadata have been updated.', '{}'),
  ('6fb191ba-81d6-4302-8fc9-e76e2dfcbe87', '81ce98aa-c524-4872-ab4c-95e66fe49a08', 'system', 'Role Permissions Initialized', '10 custom roles configured.', '{}'),
  ('2ebb7605-9210-42e6-bddb-7a896563fcef', '81ce98aa-c524-4872-ab4c-95e66fe49a08', 'system', 'Profile Updated', 'Your department and employee ID have been assigned.', '{}'),
  ('2ebb7605-9210-42e6-bddb-7a896563fcef', '81ce98aa-c524-4872-ab4c-95e66fe49a08', 'announcement', 'New Announcement', 'Welcome to TeneXA Platform.', '{}'),
  ('6fb191ba-81d6-4302-8fc9-e76e2dfcbe87', '81ce98aa-c524-4872-ab4c-95e66fe49a08', 'task', 'Tasks Summary', 'Review your 43 created tasks.', '{}')
ON CONFLICT DO NOTHING;

-- Seed shifts
INSERT INTO public.shifts (organization_id, name, start_time, end_time, description, is_active, break_duration_minutes, is_night_shift, days_of_week, created_by) VALUES
  ('81ce98aa-c524-4872-ab4c-95e66fe49a08', 'Morning Shift', '09:00', '17:00', 'Standard 9AM-5PM', true, 60, false, '{1,2,3,4,5}', '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87'),
  ('81ce98aa-c524-4872-ab4c-95e66fe49a08', 'Evening Shift', '14:00', '22:00', 'Afternoon 2PM-10PM', true, 30, false, '{1,2,3,4,5}', '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87'),
  ('81ce98aa-c524-4872-ab4c-95e66fe49a08', 'Night Shift', '22:00', '06:00', 'Overnight 10PM-6AM', true, 30, true, '{1,2,3,4,5}', '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87')
ON CONFLICT DO NOTHING;

-- Seed training programs
INSERT INTO public.training_programs (organization_id, title, description, category, duration_hours, is_mandatory, status, created_by, start_date, end_date) VALUES
  ('81ce98aa-c524-4872-ab4c-95e66fe49a08', 'New Employee Onboarding', 'Comprehensive onboarding covering policies, tools, culture.', 'onboarding', 16, true, 'active', '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87', '2026-04-01', '2026-04-03'),
  ('81ce98aa-c524-4872-ab4c-95e66fe49a08', 'Finance Compliance Training', 'Annual compliance training for financial regulations.', 'compliance', 8, true, 'active', '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87', '2026-04-15', '2026-04-16')
ON CONFLICT DO NOTHING;

-- Seed job postings (type: intern not internship)
INSERT INTO public.job_postings (organization_id, title, department, location, type, experience, description, requirements, salary_range_min, salary_range_max, status, hiring_manager_id, posted_on, closes_on) VALUES
  ('81ce98aa-c524-4872-ab4c-95e66fe49a08', 'Senior Software Engineer', 'Engineering', 'Hyderabad', 'full_time', '5+ years', 'Platform team engineer.', 'React, TypeScript, Node.js', 1500000, 2500000, 'open', '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87', '2026-03-10', '2026-04-30'),
  ('81ce98aa-c524-4872-ab4c-95e66fe49a08', 'HR Business Partner', 'Human Resources', 'Hyderabad', 'full_time', '3+ years', 'HR professional.', 'HR experience, SHRM preferred', 800000, 1400000, 'open', '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87', '2026-03-12', '2026-05-15'),
  ('81ce98aa-c524-4872-ab4c-95e66fe49a08', 'Finance Analyst Intern', 'Finance', 'Remote', 'intern', 'Fresher', 'Summer internship.', 'Pursuing MBA/CA', 300000, 500000, 'open', '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87', '2026-03-15', '2026-06-30')
ON CONFLICT DO NOTHING;

-- Seed calendar events
INSERT INTO public.calendar_events (user_id, organization_id, title, description, start_time, end_time, event_type) VALUES
  ('6fb191ba-81d6-4302-8fc9-e76e2dfcbe87', '81ce98aa-c524-4872-ab4c-95e66fe49a08', 'Weekly Team Standup', 'Monday standup', '2026-03-16 10:00:00+05:30', '2026-03-16 10:30:00+05:30', 'meeting'),
  ('6fb191ba-81d6-4302-8fc9-e76e2dfcbe87', '81ce98aa-c524-4872-ab4c-95e66fe49a08', 'Q1 Review', 'Quarterly review', '2026-03-20 14:00:00+05:30', '2026-03-20 16:00:00+05:30', 'meeting'),
  ('2ebb7605-9210-42e6-bddb-7a896563fcef', '81ce98aa-c524-4872-ab4c-95e66fe49a08', 'Platform Training', 'Intro training', '2026-03-17 11:00:00+05:30', '2026-03-17 12:00:00+05:30', 'training'),
  ('6fb191ba-81d6-4302-8fc9-e76e2dfcbe87', '81ce98aa-c524-4872-ab4c-95e66fe49a08', 'Sprint Planning', 'Sprint tasks', '2026-03-18 09:00:00+05:30', '2026-03-18 10:30:00+05:30', 'meeting'),
  ('2ebb7605-9210-42e6-bddb-7a896563fcef', '81ce98aa-c524-4872-ab4c-95e66fe49a08', '1:1 with Manager', 'Monthly check-in', '2026-03-19 15:00:00+05:30', '2026-03-19 15:30:00+05:30', 'meeting')
ON CONFLICT DO NOTHING;
