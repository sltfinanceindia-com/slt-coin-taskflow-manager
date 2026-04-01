
-- Seed salary_structures
INSERT INTO salary_structures (organization_id, employee_id, basic_salary, hra, da, special_allowance, pf_contribution, professional_tax, effective_from, is_active)
VALUES
  ('81ce98aa-c524-4872-ab4c-95e66fe49a08', '2ebb7605-9210-42e6-bddb-7a896563fcef', 50000, 20000, 5000, 10000, 6000, 200, '2026-01-01', true),
  ('81ce98aa-c524-4872-ab4c-95e66fe49a08', '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87', 120000, 48000, 12000, 24000, 14400, 200, '2026-01-01', true);

-- Seed employee_contracts
INSERT INTO employee_contracts (organization_id, employee_id, contract_type, start_date, end_date, terms, status, salary)
VALUES
  ('81ce98aa-c524-4872-ab4c-95e66fe49a08', '2ebb7605-9210-42e6-bddb-7a896563fcef', 'permanent', '2025-06-01', '2027-05-31', '2-year employment term', 'active', 85000),
  ('81ce98aa-c524-4872-ab4c-95e66fe49a08', '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87', 'permanent', '2024-01-01', NULL, 'Permanent employment', 'active', 204000);

-- Seed employee_documents
INSERT INTO employee_documents (organization_id, employee_id, document_type, document_name, document_number, file_url, is_verified)
VALUES
  ('81ce98aa-c524-4872-ab4c-95e66fe49a08', '2ebb7605-9210-42e6-bddb-7a896563fcef', 'aadhaar', 'Aadhaar Card', 'XXXX-XXXX-1234', 'https://placeholder.documents/aadhaar.pdf', true),
  ('81ce98aa-c524-4872-ab4c-95e66fe49a08', '2ebb7605-9210-42e6-bddb-7a896563fcef', 'pan', 'PAN Card', 'ABCDE1234F', 'https://placeholder.documents/pan.pdf', true);

-- Seed work_calendars
INSERT INTO work_calendars (organization_id, name, year, description, working_days, work_start_time, work_end_time, is_default, status, created_by)
VALUES
  ('81ce98aa-c524-4872-ab4c-95e66fe49a08', 'India Standard Calendar 2026', 2026, 'Standard Indian work calendar', '{1,2,3,4,5}', '09:00', '18:00', true, 'active', '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87');

-- Seed grievances
INSERT INTO grievances (organization_id, ticket_id, employee_id, category, subject, description, status, priority)
VALUES
  ('81ce98aa-c524-4872-ab4c-95e66fe49a08', 'GRV-000001', '2ebb7605-9210-42e6-bddb-7a896563fcef', 'workplace', 'Office Temperature Issue', 'The office AC is too cold.', 'open', 'low');

-- Seed exit_requests
INSERT INTO exit_requests (organization_id, employee_id, reason, last_working_date, status, notice_period_days, resignation_date)
VALUES
  ('81ce98aa-c524-4872-ab4c-95e66fe49a08', '1297fd0a-1b22-421b-b224-1ec4c28483fc', 'Personal reasons', '2026-05-15', 'pending', 30, '2026-04-01');

-- Seed tax_declarations (declaration_type is NOT NULL)
INSERT INTO tax_declarations (organization_id, employee_id, fiscal_year, section, declaration_type, declared_amount, approved_amount, proof_submitted, status)
VALUES
  ('81ce98aa-c524-4872-ab4c-95e66fe49a08', '2ebb7605-9210-42e6-bddb-7a896563fcef', '2025-2026', '80C', 'investment', 150000, 150000, true, 'approved'),
  ('81ce98aa-c524-4872-ab4c-95e66fe49a08', '2ebb7605-9210-42e6-bddb-7a896563fcef', '2025-2026', '80D', 'insurance', 25000, 25000, true, 'approved');

-- Seed issues
INSERT INTO issues (organization_id, title, description, status, priority, reporter_id, assignee_id)
VALUES
  ('81ce98aa-c524-4872-ab4c-95e66fe49a08', 'Login page slow on mobile', 'Users report 5+ second load times', 'open', 'high', '2ebb7605-9210-42e6-bddb-7a896563fcef', '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87'),
  ('81ce98aa-c524-4872-ab4c-95e66fe49a08', 'Update employee handbook 2026', 'Annual review of policies', 'open', 'medium', '6fb191ba-81d6-4302-8fc9-e76e2dfcbe87', NULL);
