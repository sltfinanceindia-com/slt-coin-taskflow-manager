
-- Seed leave_requests
INSERT INTO leave_requests (organization_id, employee_id, leave_type_id, start_date, end_date, total_days, reason, status) VALUES
('81ce98aa-c524-4872-ab4c-95e66fe49a08', '2ebb7605-9210-42e6-bddb-7a896563fcef', '694f9e1a-6801-4fdb-a4ab-04816736ee05', '2026-04-10', '2026-04-11', 2, 'Family function', 'pending'),
('81ce98aa-c524-4872-ab4c-95e66fe49a08', '2ebb7605-9210-42e6-bddb-7a896563fcef', '2e4fb062-b393-45c1-a5bc-6d5a0eef36ca', '2026-03-20', '2026-03-20', 1, 'Feeling unwell', 'approved'),
('81ce98aa-c524-4872-ab4c-95e66fe49a08', '2ebb7605-9210-42e6-bddb-7a896563fcef', '694f9e1a-6801-4fdb-a4ab-04816736ee05', '2026-02-14', '2026-02-14', 1, 'Personal work', 'approved');

-- Seed expense_claims
INSERT INTO expense_claims (organization_id, employee_id, title, category, amount, expense_date, status, submitted_at) VALUES
('81ce98aa-c524-4872-ab4c-95e66fe49a08', '2ebb7605-9210-42e6-bddb-7a896563fcef', 'Client meeting travel', 'travel', 2500, '2026-03-15', 'approved', now() - interval '10 days'),
('81ce98aa-c524-4872-ab4c-95e66fe49a08', '2ebb7605-9210-42e6-bddb-7a896563fcef', 'Office supplies purchase', 'supplies', 850, '2026-03-25', 'pending', now() - interval '3 days');

-- Seed loan_requests
INSERT INTO loan_requests (organization_id, employee_id, loan_type, amount, interest_rate, tenure_months, emi_amount, reason, status) VALUES
('81ce98aa-c524-4872-ab4c-95e66fe49a08', '2ebb7605-9210-42e6-bddb-7a896563fcef', 'personal_loan', 50000, 8.5, 12, 4356, 'Home renovation', 'pending');

-- Seed objectives (using valid levels: company, team, individual)
INSERT INTO objectives (organization_id, title, description, owner_id, level, quarter, year, start_date, end_date, status, progress_percentage, created_by) VALUES
('81ce98aa-c524-4872-ab4c-95e66fe49a08', 'Improve quarterly revenue by 15%', 'Focus on upselling and new client acquisition', '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87', 'company', 'Q2', 2026, '2026-04-01', '2026-06-30', 'on_track', 25, '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87'),
('81ce98aa-c524-4872-ab4c-95e66fe49a08', 'Complete finance module testing', 'End-to-end testing of all finance workflows', '2ebb7605-9210-42e6-bddb-7a896563fcef', 'individual', 'Q2', 2026, '2026-04-01', '2026-06-30', 'on_track', 40, '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87'),
('81ce98aa-c524-4872-ab4c-95e66fe49a08', 'Reduce employee onboarding time to 3 days', 'Streamline onboarding checklist and automate document collection', '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87', 'team', 'Q2', 2026, '2026-04-01', '2026-06-30', 'not_started', 0, '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87');

-- Seed sprints
INSERT INTO sprints (organization_id, project_id, name, goal, start_date, end_date, status, velocity, total_story_points, completed_story_points, created_by) VALUES
('81ce98aa-c524-4872-ab4c-95e66fe49a08', '232fd359-594b-4d71-91e8-89d270dbaca1', 'Sprint 1 - Foundation', 'Set up core infrastructure and user management', '2026-03-17', '2026-03-31', 'completed', 21, 21, 21, '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87'),
('81ce98aa-c524-4872-ab4c-95e66fe49a08', '232fd359-594b-4d71-91e8-89d270dbaca1', 'Sprint 2 - Features', 'Implement HR and finance modules', '2026-04-01', '2026-04-14', 'active', 0, 34, 8, '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87');

-- Seed onboarding_records
INSERT INTO onboarding_records (employee_id, start_date, status, buddy_id, notes, organization_id, created_by) VALUES
('2ebb7605-9210-42e6-bddb-7a896563fcef', '2026-01-15', 'completed', '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87', 'Completed all onboarding tasks on time', '81ce98aa-c524-4872-ab4c-95e66fe49a08', '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87'),
('cbc4df08-b653-4006-ab26-20ad66e5e65e', '2026-02-01', 'completed', '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87', 'Smooth onboarding process', '81ce98aa-c524-4872-ab4c-95e66fe49a08', '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87');
