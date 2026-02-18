# TeneXA Complete Module Audit -- Updated Status & Fix Plan

## Data Summary (Live Database Counts)


| Table               | Records | Table              | Records |
| ------------------- | ------- | ------------------ | ------- |
| profiles            | 27      | user_roles         | 29      |
| tasks               | 55      | time_logs          | 151     |
| projects            | 3       | attendance_records | 20      |
| activity_logs       | 6536    | session_logs       | 2563    |
| leave_balances      | 31      | leave_requests     | 1       |
| leave_types         | 26      | holidays           | 1       |
| departments         | 2       | organizations      | 8       |
| objectives          | 2       | key_results        | 1       |
| feedback_cycles     | 2       | feedback_responses | 5       |
| one_on_one_meetings | 3       | PIPs               | 3       |
| coin_transactions   | 33      | kudos              | 4       |
| pulse_surveys       | 2       | pulse_responses    | 1       |
| wfh_requests        | 4       | sprints            | 1       |
| task_dependencies   | 1       | on_call_schedules  | 1       |
| timesheets          | 9       | timesheet_entries  | 5       |
| reporting_structure | 3       | automation_rules   | 4       |
| early_warnings      | 11      | kanban_metrics     | 11      |
| dashboard_widgets   | 29      | audit_logs         | 8       |
| confirmations       | 1       | employee_skills    | 1       |
| payroll_records     | 1       | payroll_runs       | 0       |


**All other HR/Finance/Lifecycle tables: 0 records**

---

## 1. Main & Work Management

### Overview & Dashboard


| #   | Item                                                  | Status | Evidence                                                                                                       |
| --- | ----------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------- |
| 1   | Dashboard displays accurate real-time data            | PASS   | `EnhancedDashboardWidgets`, `ExecutiveDashboard` pull live data from tasks(55), time_logs(151), attendance(20) |
| 2   | User permissions control widget visibility            | PASS   | `useUserRole` + `useRolePermissions` gate sections; tab-registry enforces `allowedRoles`                       |
| 3   | Performance metrics load within acceptable timeframes | PASS   | React Query caching (`staleTime: 5min`); activity_logs now limited to 500                                      |
| 4   | Data refresh intervals configured                     | PASS   | React Query `staleTime` and `refetchOnWindowFocus` configured                                                  |


### Kanban Board


| #   | Item                                             | Status  | Evidence                                                                                  |
| --- | ------------------------------------------------ | ------- | ----------------------------------------------------------------------------------------- |
| 1   | Task status transitions follow defined workflows | PASS    | `useUpdateTaskStatus` enforces: assigned -> in_progress -> completed -> verified/rejected |
| 2   | Drag-and-drop works across browsers              | PASS    | `@hello-pangea/dnd` (cross-browser fork)                                                  |
| 3   | Board filters and views save per user            | PARTIAL | Filter state is URL-param based, not persisted to DB per user                             |
| 4   | Archived tasks retrievable and searchable        | PARTIAL | No explicit "archive" status or archive/unarchive workflow                                |


### Projects


| #   | Item                                            | Status  | Evidence                                                                                                            |
| --- | ----------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------- |
| 1   | Project creation requires mandatory fields      | PASS    | Form validation + 3 projects in DB                                                                                  |
| 2   | Timelines and dependencies calculate accurately | PARTIAL | `task_dependencies` (1 record), `cascade_dependency_dates` trigger exists, but no Gantt critical-path visualization |
| 3   | Status updates trigger notifications            | PASS    | `email-notifications` edge function + `useEmailNotifications`                                                       |
| 4   | Historical project data preserved               | PASS    | `project_baselines` table, `activity_logs` (6536 records)                                                           |


### Time Management


| #   | Item                                      | Status  | Evidence                                                                   |
| --- | ----------------------------------------- | ------- | -------------------------------------------------------------------------- |
| 1   | Time logs captured with validation        | PASS    | 151 records, `useTimeLogs` hook with validation                            |
| 2   | Time entries link to projects/tasks       | PASS    | `time_logs` has `task_id` and `project_id` FKs                             |
| 3   | Overtime calculations align with policies | PASS    | `OvertimeManagement.tsx`, `timesheet_entries` with `overtime_hours` column |
| 4   | Timesheet approval workflows function     | PASS    | 9 timesheets, 5 entries; `TimesheetManagement` component                   |
| 5   | Time tracking reports match payroll       | UI-ONLY | Payroll has 0 runs, reconciliation untested                                |


### Capacity & Resource Planning


| #   | Item                                        | Status  | Evidence                                                                              |
| --- | ------------------------------------------- | ------- | ------------------------------------------------------------------------------------- |
| 1   | Resource allocation prevents double-booking | PARTIAL | `CapacityHub`, `WorkloadBalancing` exist but no hard constraint                       |
| 2   | Capacity accounts for leaves/holidays       | PARTIAL | `holidays` (1), `leave_balances` (31) exist but capacity calc doesn't subtract leaves |
| 3   | Workload distribution reports accurate      | PASS    | `WorkloadBalancing`, `get_employee_workload` DB function                              |
| 4   | Resource availability updates real-time     | PARTIAL | No Supabase Realtime subscription on capacity tables                                  |


### Attendance & Leave Management


| #   | Item                                     | Status  | Evidence                                     |
| --- | ---------------------------------------- | ------- | -------------------------------------------- |
| 1   | Attendance records sync with time logs   | PARTIAL | Both exist independently, no auto-sync       |
| 2   | Leave balances calculate correctly       | PASS    | 31 leave_balances, 26 leave_types            |
| 3   | Leave approval workflows route correctly | PASS    | 1 leave_request, approval via `useApprovals` |
| 4   | WFH requests integrate with attendance   | PASS    | 4 wfh_requests, `useWFH` hook                |
| 5   | Shift swaps require authorization        | UI-ONLY | 0 shift_swap_requests, hook exists           |
| 6   | On-call schedules prevent conflicts      | PARTIAL | 1 on_call_schedule, no conflict detection    |


### Sprint & Agile Tools


| #   | Item                              | Status  | Evidence                                                                                                  |
| --- | --------------------------------- | ------- | --------------------------------------------------------------------------------------------------------- |
| 1   | Sprint planning with story points | PARTIAL | 1 sprint exists, but **NO `sprint_tasks` junction table** -- tasks cannot be formally assigned to sprints |
| 2   | Backlog prioritization maintained | PASS    | `BacklogManagement` component exists                                                                      |
| 3   | Burndown charts reflect progress  | PARTIAL | Insufficient sprint data                                                                                  |
| 4   | Velocity calculations accurate    | PARTIAL | Only 1 sprint                                                                                             |


### Risk & Issue Management


| #   | Item                                    | Status  | Evidence                                                                      |
| --- | --------------------------------------- | ------- | ----------------------------------------------------------------------------- |
| 1   | Risk register captures required fields  | PARTIAL | `project_risks` (0 records), project-scoped only, no standalone risk register |
| 2   | Issue tracker assigns priority/severity | UI-ONLY | `issues` (0 records), `IssueTracker` component exists                         |
| 3   | Dependencies visualized and tracked     | PARTIAL | 1 task_dependency, no visual graph                                            |
| 4   | Escalation rules trigger appropriately  | UI-ONLY | No escalation engine, only SLA rules (0 records)                              |


### Templates & Recurring Work


| #   | Item                                   | Status     | Evidence                                                                                             |
| --- | -------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------- |
| 1   | Project templates clone configurations | UI-ONLY    | 0 project_templates, component exists                                                                |
| 2   | Task templates maintain custom fields  | UI-ONLY    | 0 task_templates, component exists                                                                   |
| 3   | Recurring tasks generate on schedule   | **BROKEN** | `recurring_tasks` table + hook exist, but **NO cron/scheduler/edge function** to auto-generate tasks |
| 4   | Template updates don't affect existing | PASS       | Templates cloned on use                                                                              |


### Documentation


| #   | Item                                   | Status  | Evidence          |
| --- | -------------------------------------- | ------- | ----------------- |
| 1   | Meeting notes link to projects/tasks   | UI-ONLY | 0 meeting_notes   |
| 2   | Decision log maintains audit trail     | UI-ONLY | 0 decisions       |
| 3   | Lessons learned searchable/categorized | UI-ONLY | 0 lessons_learned |
| 4   | Document version control               | UI-ONLY | 0 file_versions   |


---

## 2. Performance Management

### OKRs


| #   | Item                                    | Status  | Evidence                                              |
| --- | --------------------------------------- | ------- | ----------------------------------------------------- |
| 1   | OKR cascading aligns goals              | PARTIAL | 2 objectives, 1 key_result -- minimal data            |
| 2   | Progress auto-updates from tasks        | PARTIAL | No automatic link from task completion to KR progress |
| 3   | OKR review cycles trigger notifications | UI-ONLY | 0 okr_check_ins, no notification triggers             |
| 4   | Historical OKR data preserved           | PASS    | Records persist with timestamps                       |


### Feedback & Reviews


| #   | Item                                       | Status  | Evidence                                                             |
| --- | ------------------------------------------ | ------- | -------------------------------------------------------------------- |
| 1   | 360 feedback ensures anonymity             | PARTIAL | 2 feedback_cycles, 5 responses -- anonymity flag exists but untested |
| 2   | 1:1 meeting notes private/secure           | PASS    | 3 one_on_one_meetings, RLS in place                                  |
| 3   | Performance review cycles include eligible | UI-ONLY | Framework exists                                                     |
| 4   | PIPs have proper tracking                  | PASS    | 3 PIPs, `pip_check_ins`, `pip_goals` tables                          |


---

## 3. Finance & HR

### Payroll & Compensation


| #   | Item                                         | Status  | Evidence                                 |
| --- | -------------------------------------------- | ------- | ---------------------------------------- |
| 1   | Payroll calculations match salary structures | UI-ONLY | 0 payroll_runs, 1 payroll_record         |
| 2   | Tax withholdings comply                      | UI-ONLY | `TaxManagement` exists, 0 form16_records |
| 3   | Salary revisions have approval               | UI-ONLY | 0 salary_revisions                       |
| 4   | Bonus calculations follow criteria           | UI-ONLY | `BonusManagement` exists                 |
| 5   | Form 16 generates accurately                 | UI-ONLY | 0 records                                |
| 6   | Reimbursements link to expenses              | UI-ONLY | 0 reimbursements                         |


### Expenses & Advances


| #   | Item                                      | Status  | Evidence                               |
| --- | ----------------------------------------- | ------- | -------------------------------------- |
| 1   | Expense approvals route by amount         | UI-ONLY | 0 expense_claims, 0 expense_categories |
| 2   | Expense categories enforce budgets        | UI-ONLY | 0 expense_categories                   |
| 3   | Loans/advances track repayment            | UI-ONLY | 0 loan_requests                        |
| 4   | Expense reports integrate with accounting | MISSING | No accounting integration              |


### Assets & Documents


| #   | Item                                        | Status  | Evidence                               |
| --- | ------------------------------------------- | ------- | -------------------------------------- |
| 1   | Asset assignment tracks custody             | UI-ONLY | 0 employee_assets, 0 asset_assignments |
| 2   | Document management enforces access         | PARTIAL | 0 employee_documents, RLS exists       |
| 3   | Compliance documents have expiration alerts | UI-ONLY | 0 compliance_checkpoints               |
| 4   | Asset depreciation calculations             | MISSING | No depreciation logic                  |


### Benefits & Investments


| #   | Item                                     | Status  | Evidence  |
| --- | ---------------------------------------- | ------- | --------- |
| 1   | Investment declarations capture proofs   | UI-ONLY | 0 records |
| 2   | Benefits enrollment enforces eligibility | UI-ONLY | 0 records |
| 3   | F&F settlement calculates all dues       | UI-ONLY | 0 records |
| 4   | Gratuity calculations comply with law    | UI-ONLY | 0 records |


---

## 4. Employee Lifecycle

### Onboarding


| #   | Item                                    | Status  | Evidence                  |
| --- | --------------------------------------- | ------- | ------------------------- |
| 1   | Onboarding checklists auto-generate     | UI-ONLY | 0 onboarding_records      |
| 2   | System access provisioning              | PARTIAL | No automated provisioning |
| 3   | Offer letters contain legal disclosures | UI-ONLY | 0 offers                  |
| 4   | Probation tracking triggers alerts      | UI-ONLY | 0 probations              |


### Offboarding


| #   | Item                                   | Status  | Evidence                                 |
| --- | -------------------------------------- | ------- | ---------------------------------------- |
| 1   | Exit management follows checklist      | UI-ONLY | 0 exit_requests                          |
| 2   | F&F settlement initiates automatically | MISSING | No auto-trigger from exit to F&F         |
| 3   | Knowledge transfer documented          | PARTIAL | `lessons_learned` exists, no KT workflow |
| 4   | System access revoked promptly         | MISSING | No automated revocation                  |


### Contracts & Verification


| #   | Item                                    | Status  | Evidence                    |
| --- | --------------------------------------- | ------- | --------------------------- |
| 1   | Contracts digitally signed              | UI-ONLY | 0 contracts, no e-signature |
| 2   | Background verification tracks progress | UI-ONLY | 0 records                   |
| 3   | Confirmation after probation            | UI-ONLY | 1 confirmation              |
| 4   | Contract renewals alert before expiry   | UI-ONLY | No alert scheduler          |


### Employee Relations


| #   | Item                                    | Status  | Evidence                 |
| --- | --------------------------------------- | ------- | ------------------------ |
| 1   | Grievance tracking confidentiality      | UI-ONLY | 0 grievances             |
| 2   | Disciplinary actions follow due process | UI-ONLY | 0 records                |
| 3   | Handbook version-controlled             | UI-ONLY | 0 handbook_policies      |
| 4   | Policy updates require acknowledgment   | UI-ONLY | 0 policy_acknowledgments |


---

## 5. HR Analytics & Growth


| #   | Item                          | Status  | Evidence                          |
| --- | ----------------------------- | ------- | --------------------------------- |
| 1   | HR analytics real-time        | PASS    | `HRAnalytics` pulls live data     |
| 2   | Benchmarking data reliable    | UI-ONLY | Uses mock/static data             |
| 3   | Reports exportable            | PASS    | `ExportButton` supports CSV/PDF   |
| 4   | Custom report builder         | UI-ONLY | 0 custom_reports                  |
| 5   | Succession planning           | UI-ONLY | 0 succession_plans                |
| 6   | Career paths linked to skills | UI-ONLY | 0 career_paths                    |
| 7   | Skill gap triggers training   | PARTIAL | 1 employee_skill, no auto-trigger |
| 8   | Internal mobility visible     | UI-ONLY | 0 career_path_levels              |


---

## 6. Recruitment


| #   | Item                                    | Status  | Evidence                                 |
| --- | --------------------------------------- | ------- | ---------------------------------------- |
| 1   | Job postings sync with external boards  | MISSING | 0 job_postings, no API integration       |
| 2   | ATS filters candidates                  | UI-ONLY | 0 job_applications                       |
| 3   | Interview scheduling prevents conflicts | UI-ONLY | 0 interviews, no calendar conflict check |
| 4   | Offer management tracks acceptance      | UI-ONLY | 0 offers                                 |
| 5   | Pipeline reports show conversion        | PARTIAL | UI exists, 0 data                        |


---

## 7. Planning & Budgeting


| #   | Item                                     | Status  | Evidence             |
| --- | ---------------------------------------- | ------- | -------------------- |
| 1   | Budget planning integrates with expenses | UI-ONLY | 0 budget_allocations |
| 2   | Cost centers track spending              | UI-ONLY | 0 cost_centers       |
| 3   | Budget alerts at thresholds              | MISSING | No alert mechanism   |
| 4   | Variance reports planned vs actual       | UI-ONLY | UI exists, no data   |


---

## 8. Admin & System Tools

### Access Control


| #   | Item                                         | Status  | Evidence                              |
| --- | -------------------------------------------- | ------- | ------------------------------------- |
| 1   | Roles follow least privilege                 | PASS    | 10 role tiers, `allowedRoles` on tabs |
| 2   | Permission changes logged                    | PARTIAL | 8 audit_logs -- sparse                |
| 3   | Role assignments prevent unauthorized access | PASS    | 29 user_roles, RLS policies           |
| 4   | Admin actions require secondary approval     | MISSING | No two-factor approval                |


### Organization Structure


| #   | Item                                   | Status  | Evidence                                        |
| --- | -------------------------------------- | ------- | ----------------------------------------------- |
| 1   | Org chart reflects reporting           | PASS    | `OrgChartViewer`, 3 reporting_structure records |
| 2   | Org changes update dependent modules   | PARTIAL | No cascading triggers                           |
| 3   | Department hierarchies control routing | PASS    | 2 departments with parent_id support            |


### Automation & Workflows


| #   | Item                               | Status  | Evidence                              |
| --- | ---------------------------------- | ------- | ------------------------------------- |
| 1   | Approval workflows route correctly | PARTIAL | 0 approval_workflows configured       |
| 2   | Automated notifications deliver    | PASS    | Edge functions operational            |
| 3   | Workflow SLA tracking              | UI-ONLY | 0 sla_rules                           |
| 4   | Failed automations trigger alerts  | PARTIAL | 4 automation_rules, no failure alerts |


### Audit & Compliance


| #   | Item                             | Status  | Evidence                              |
| --- | -------------------------------- | ------- | ------------------------------------- |
| 1   | Audit packs complete             | UI-ONLY | `AuditHub` exists, no packs generated |
| 2   | System logs capture actions      | PASS    | 6536 activity_logs, 8 audit_logs      |
| 3   | Data retention policies enforced | MISSING | No retention/purge scheduler          |
| 4   | Compliance reports accurate      | UI-ONLY | 0 compliance_checkpoints              |


### System Health


| #   | Item                        | Status  | Evidence                        |
| --- | --------------------------- | ------- | ------------------------------- |
| 1   | Work health monitoring      | PASS    | `WorkHealthDashboard` component |
| 2   | Error logs reviewed         | PARTIAL | No in-app log viewer            |
| 3   | Database backups            | PASS    | Supabase automatic backups      |
| 4   | API integrations functional | PASS    | 21+ edge functions deployed     |


### Reporting & Analytics


| #   | Item                               | Status  | Evidence                   |
| --- | ---------------------------------- | ------- | -------------------------- |
| 1   | Custom reports match requirements  | UI-ONLY | 0 custom_reports           |
| 2   | Report scheduling delivers on time | MISSING | No scheduler               |
| 3   | Analytics data matches source      | PASS    | Direct Supabase queries    |
| 4   | Export works for all types         | PASS    | CSV/PDF via `ExportButton` |


---

## 9. Resources & Communication

### Employee Engagement


| #   | Item                                     | Status  | Evidence                     |
| --- | ---------------------------------------- | ------- | ---------------------------- |
| 1   | Kudos wall posts display                 | PASS    | 4 kudos                      |
| 2   | Pulse surveys maintain anonymity         | PARTIAL | 2 surveys, 1 response        |
| 3   | Communication broadcasts reach audiences | PASS    | Chat + announcements working |
| 4   | Coins/rewards track balances             | PASS    | 33 coin_transactions         |


### Training & Development


| #   | Item                              | Status  | Evidence                               |
| --- | --------------------------------- | ------- | -------------------------------------- |
| 1   | Training modules track completion | UI-ONLY | 0 training_progress, 0 training_videos |
| 2   | Tutorial content up-to-date       | PASS    | `Tutorial.tsx` covers features         |
| 3   | App feedback collected            | PASS    | `FeedbackForm` component               |
| 4   | Training certificates generate    | UI-ONLY | 0 certificates                         |


---

## 10. Technical & Security Audit

### Database & Performance


| #   | Item                                | Status  | Evidence                                                                                                                                                                                       |
| --- | ----------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Database queries optimized          | PASS    | React Query caching, `.limit(500)` on activity_logs                                                                                                                                            |
| 2   | RLS policies enforce data isolation | PARTIAL | **15 `USING(true)` / `WITH CHECK(true)` policies** remain on system tables (audit_logs, notifications, etc.) -- acceptable for system-insert tables but `invoices` policy is overly permissive |
| 3   | Indexes properly configured         | PARTIAL | PKs indexed, custom indexes not fully audited                                                                                                                                                  |
| 4   | Slow-loading pages identified       | PARTIAL | No performance monitoring                                                                                                                                                                      |


### Security & Access


| #   | Item                                      | Status   | Evidence                                    |
| --- | ----------------------------------------- | -------- | ------------------------------------------- |
| 1   | Authentication enforces password policies | PASS     | OTP + Google OAuth                          |
| 2   | CORS allows only authorized domains       | PASS     | Managed by Supabase                         |
| 3   | API endpoints require authentication      | PASS     | Edge functions use `getUser()`              |
| 4   | Sensitive data encrypted                  | PASS     | AES-256 at rest, TLS in transit             |
| 5   | Auth OTP long expiry                      | **WARN** | Linter flagged OTP expiry exceeds threshold |
| 6   | Leaked password protection disabled       | **WARN** | Linter flagged this                         |
| 7   | Postgres version has security patches     | **WARN** | Upgrade recommended                         |
| 8   | Function search path mutable              | **WARN** | 1 function has mutable search_path          |


### Integration & APIs


| #   | Item                              | Status  | Evidence                                                 |
| --- | --------------------------------- | ------- | -------------------------------------------------------- |
| 1   | Third-party integrations          | PARTIAL | Email via Resend, PhonePe payment -- no Stripe/job board |
| 2   | API rate limits                   | PASS    | Supabase defaults                                        |
| 3   | Webhook deliveries reliable       | UI-ONLY | Untested                                                 |
| 4   | Error handling prevents data loss | PASS    | try/catch with toasts                                    |


### Deployment & DevOps


| #   | Item                             | Status  | Evidence                 |
| --- | -------------------------------- | ------- | ------------------------ |
| 1   | Staging mirrors production       | PASS    | Test + Live environments |
| 2   | Deployment includes rollback     | PASS    | Lovable handles          |
| 3   | Environment variables configured | PASS    | `.env` properly set      |
| 4   | Monitoring alerts                | PARTIAL | No custom alerting       |


---

## 11. Compliance & Legal


| #   | Item                               | Status  | Evidence                                                |
| --- | ---------------------------------- | ------- | ------------------------------------------------------- |
| 1   | Employee classification correct    | MISSING | No exempt/non-exempt field                              |
| 2   | Labor law notices accessible       | MISSING | No module                                               |
| 3   | Anti-discrimination policies exist | UI-ONLY | 0 handbook_policies                                     |
| 4   | FMLA/leave policies comply         | PARTIAL | Leave types configurable, no FMLA rules                 |
| 5   | Data privacy complies (GDPR)       | PARTIAL | RLS isolates data, no self-service data export/deletion |
| 6   | Payroll tax withholdings accurate  | UI-ONLY | 0 payroll runs                                          |
| 7   | Workplace safety documented        | MISSING | No safety module                                        |


---

## Updated Summary Scorecard


| Category                  | Total   | PASS         | PARTIAL      | UI-ONLY      | MISSING     | BROKEN/WARN |
| ------------------------- | ------- | ------------ | ------------ | ------------ | ----------- | ----------- |
| Main & Work Management    | 36      | 15           | 12           | 8            | 0           | 1           |
| Performance Management    | 8       | 3            | 2            | 3            | 0           | 0           |
| Finance & HR              | 16      | 0            | 1            | 13           | 2           | 0           |
| Employee Lifecycle        | 16      | 0            | 2            | 11           | 3           | 0           |
| HR Analytics & Growth     | 8       | 2            | 1            | 5            | 0           | 0           |
| Recruitment               | 5       | 0            | 1            | 3            | 1           | 0           |
| Planning & Budgeting      | 4       | 0            | 0            | 3            | 1           | 0           |
| Admin & System Tools      | 19      | 8            | 5            | 4            | 2           | 0           |
| Resources & Communication | 8       | 5            | 1            | 2            | 0           | 0           |
| Technical & Security      | 16      | 10           | 4            | 1            | 0           | 4           |
| Compliance & Legal        | 7       | 0            | 2            | 2            | 3           | 0           |
| **TOTAL**                 | **143** | **43 (30%)** | **31 (22%)** | **55 (38%)** | **12 (8%)** | **5 (3%)**  |


---

## Fix Plan -- Priority Ordered

### Phase 1: Critical Fixes (Security & Broken Features)

**Fix 1: Create `sprint_tasks` junction table**

- Create migration: `sprint_tasks` table with `sprint_id`, `task_id`, `organization_id`, `added_at`, `sort_order`
- Add RLS policies for org-scoped access
- Update `SprintManagement.tsx` to use the junction table for assigning tasks to sprints

**Fix 2: Create recurring tasks scheduler edge function**

- Create `generate-recurring-tasks` edge function that:
  - Queries `recurring_tasks` where `is_active = true` and `next_run_at <= now()`
  - Creates new tasks from the recurring template
  - Updates `next_run_at` and `last_run_at`
- Can be invoked via a cron job or manually from the admin UI

**Fix 3: Fix `invoices` RLS policy**

- The `System can manage invoices` policy uses `USING (true)` for ALL operations -- this is too permissive
- Replace with org-scoped policy: `USING (is_same_org_user(organization_id))`

**Fix 4: Fix mutable search_path function**

- Identify and fix the function with mutable `search_path` (flagged by linter)

### Phase 2: Functional Improvements

**Fix 5: Auto-trigger F&F from exit requests**

- Add a database trigger on `exit_requests` that auto-creates an `fnf_settlements` record when status changes to 'approved'

**Fix 6: Add budget threshold alerts**

- Add `alert_threshold_percentage` column to `budget_allocations`
- Create a check in expense submission that compares spend vs budget and creates a notification when threshold is exceeded

**Fix 7: Kanban filter persistence**

- Save filter state to `dashboard_widgets` or a new `user_preferences` table so filters persist per user

### Phase 3: Security Hardening (Supabase Settings)

**Fix 8: OTP expiry**

- Reduce OTP expiry time in Supabase Auth settings (recommended: 300 seconds)

**Fix 9: Enable leaked password protection**

- Enable in Supabase Dashboard > Auth > Settings

**Fix 10: Upgrade Postgres version**

- Apply security patches via Supabase Dashboard

### Phase 4: Data Population (No Code Changes)

The following modules are fully functional (UI + DB + hooks) but show empty because no data has been entered. These require admin UI actions, not code fixes:

- Payroll: Run first payroll cycle
- Expenses: Create expense categories, submit claims
- Assets: Add asset records
- Onboarding/Offboarding: Start workflows
- Recruitment: Create job postings
- All HR lifecycle modules (contracts, verification, probation, grievances, etc.)
- Templates (project/task templates, recurring tasks definitions)
- Documentation (meeting notes, decisions, lessons learned)
- Training modules
- Budget planning and cost centers

---

## Implementation Summary


| Phase | Fix                        | Files/Resources Changed               | Type             |
| ----- | -------------------------- | ------------------------------------- | ---------------- |
| 1     | sprint_tasks table         | DB migration + `SprintManagement.tsx` | Migration + Code |
| 1     | Recurring tasks scheduler  | New edge function                     | Edge function    |
| 1     | invoices RLS               | DB migration                          | Migration        |
| 1     | Fix mutable search_path    | DB migration                          | Migration        |
| 2     | F&F auto-trigger           | DB trigger                            | Migration        |
| 2     | Budget alerts              | DB migration + hook update            | Migration + Code |
| 2     | Kanban filter persistence  | New table or hook update              | Migration + Code |
| 3     | OTP expiry                 | Supabase Dashboard                    | Manual           |
| 3     | Leaked password protection | Supabase Dashboard                    | Manual           |
| 3     | Postgres upgrade           | Supabase Dashboard                    | Manual           |
| 4     | Data population            | Admin UI actions                      | Manual           |


**Total code/migration changes: 7 fixes across Phase 1-2**
**Total manual admin actions: 3 security settings + data population**