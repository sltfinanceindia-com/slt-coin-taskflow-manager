

# TeneXA Complete Application Audit -- March 2, 2026

## User Profiles Under Audit

| User | Email | Profile Role | Actual Role (user_roles) | Department | Status |
|------|-------|-------------|-------------------------|------------|--------|
| Employee | gopikomirisetti999@gmail.com | intern | **employee** | NONE | Active |
| Admin | gopi_komirisetti@sltfinanceindia.com | admin | **super_admin** | NONE | Active |

**Issue Found:** Employee user has a role mismatch -- `profiles.role = 'intern'` but `user_roles.role = 'employee'`. This causes inconsistent behavior in components that read `profile.role` directly instead of using the `useUserRole` hook.

**Issue Found:** 0 out of 14 users have a department assigned. 0 departments exist in the organization. This breaks HR Analytics, Org Chart, reporting structure, and any department-filtered views.

---

## Organization Data Summary (org: 81ce98aa)

| Table | Records | Status |
|-------|---------|--------|
| profiles | 14 | HAS DATA |
| tasks | 45 | HAS DATA |
| time_logs | 146 | HAS DATA |
| attendance_records | 13 | HAS DATA |
| leave_balances | 24 | HAS DATA |
| leave_types | 2 | HAS DATA |
| timesheets | 3 | HAS DATA |
| projects | 1 | HAS DATA |
| wfh_requests | 2 | HAS DATA |
| task_dependencies | 1 | HAS DATA |
| automation_rules | 3 | HAS DATA |
| kudos | 1 | HAS DATA |
| one_on_one_meetings | 1 | HAS DATA |
| performance_improvement_plans | 2 | HAS DATA |
| pulse_surveys | 1 | HAS DATA |
| sprint_tasks | 1 | HAS DATA |
| **departments** | **0** | **CRITICAL - EMPTY** |
| expense_claims | 0 | EMPTY (1 exists but belongs to different org) |
| objectives (OKRs) | 0 | EMPTY |
| holidays | 0 | EMPTY |
| payroll_runs | 0 | EMPTY |
| job_postings | 0 | EMPTY |
| work_requests | 0 | EMPTY |
| notifications | 0 | EMPTY |
| employee_bonuses | 0 | EMPTY |
| sprints | 0 | EMPTY |
| All lifecycle tables | 0 | EMPTY (contracts, onboarding, exit, grievances, etc.) |
| All finance tables | 0 | EMPTY (salary, loans, investments, benefits, etc.) |
| All recruitment tables | 0 | EMPTY (job_postings, interviews, offers) |

---

## CRITICAL ISSUES

### Issue 1: No Departments Created (BLOCKS MULTIPLE MODULES)
**Impact:** HR Analytics, Org Chart, payroll grouping, department-based reporting, capacity planning all show empty/broken views. All 14 profiles have `department_id = NULL`.
**Fix:** Create default departments for the organization via SQL INSERT, then assign users to departments.

### Issue 2: Employee Role Mismatch
**Impact:** `gopikomirisetti999@gmail.com` has `profiles.role = 'intern'` but `user_roles.role = 'employee'`. Some older components read `profile.role` directly (e.g., Index.tsx checks `profile.role === 'admin'`), causing inconsistent access.
**Fix:** Update `profiles.role` to match `user_roles.role` = 'employee', OR ensure all components use `useUserRole()` hook exclusively.

### Issue 3: 8 Missing Database Tables Referenced by UI
The following tables do NOT exist but are referenced in the UI code:

| Missing Table | Referenced By | Impact |
|--------------|--------------|--------|
| `shifts` | Shifts tab | Tab shows empty/errors |
| `shift_assignments` | Shifts tab | Cannot assign shifts |
| `risk_register` | Risk Register tab | Tab non-functional |
| `tax_declarations` | Tax Management tab | Queries fail silently (uses `supabase as any`) |
| `training_programs` | Training tab | Tab non-functional |
| `work_calendars` | Work Calendars tab | Tab non-functional |
| `benchmarking_data` | Benchmarking tab | Tab non-functional |
| `audit_packs` | Audit Packs tab | Tab non-functional |

**Fix:** Create these 8 tables with proper schema, RLS policies, and organization_id columns.

### Issue 4: `supabase as any` Type Bypasses (13 files, 255 occurrences)
Multiple components cast `supabase as any` to bypass TypeScript type checking. This means:
- No compile-time validation of table names or column names
- Silent runtime failures when querying non-existent tables
- Errors are swallowed, showing empty states instead of error messages

**Files affected:** BonusManagement.tsx, IssueTracker.tsx, DependencyManagement.tsx, ExitManagement.tsx, useProjectRisks.tsx, TaxManagement.tsx, and 7 others.

### Issue 5: 13 Overly Permissive RLS Policies
The database linter found 13 `USING(true)` or `WITH CHECK(true)` policies on non-SELECT operations. Affected tables:
- audit_logs, automation_logs, contact_submissions, daily_email_log, email_notifications, feedback_responses, notifications, payments, referral_tracking, scratch_cards, subscription_history, trial_signups

Most are system/background tables where this is intentional, but `feedback_responses` allowing anyone to INSERT is a potential abuse vector.

### Issue 6: Auth Security Warnings
- OTP expiry exceeds recommended threshold
- Leaked password protection is disabled
- Postgres version has security patches available

---

## PAGE-BY-PAGE AUDIT

### Main Section
| Page | DB Connected | Has Data | Issues |
|------|-------------|----------|--------|
| Overview | Yes | Yes | Works correctly |
| Kanban Board | Yes | Yes (45 tasks) | Works correctly |
| Projects | Yes | Yes (1 project) | Works correctly |
| Updates | Yes | Empty | Functional, needs data |

### Work Management
| Page | DB Connected | Has Data | Issues |
|------|-------------|----------|--------|
| Requests | Yes | Empty | Functional, needs data |
| Time Logs | Yes | Yes (146) | Works correctly |
| Capacity | Yes | Empty | Functional, needs data |
| **Shifts** | **NO - TABLE MISSING** | N/A | **shifts table does not exist** |
| Attendance | Yes | Yes (13) | Works correctly |
| Leave | Yes | Yes (24 balances) | Works correctly |
| WFH | Yes | Yes (2) | Works correctly |
| Sprint Planning | Yes | Empty sprints | sprint_tasks=1 but sprints=0 |
| Backlog | Yes | Empty | Functional, needs data |
| Milestones | Yes | Empty | Functional, needs data |
| Dependencies | Yes | Yes (1) | Works correctly |
| **Risk Register** | **NO - TABLE MISSING** | N/A | **risk_register table missing** (uses project_risks which exists) |
| Issue Tracker | Yes (project_issues) | Empty | Functional, needs data |
| Resource Allocation | Yes | Empty | Functional, needs data |
| Workload | Yes | Empty | Functional, needs data |
| Overtime | Yes | Empty | Functional, needs data |
| Comp-Off | Yes | Empty | Functional, needs data |
| On-Call | Yes | Empty | Functional, needs data |
| Shift Swap | Yes | Empty | Functional, needs data |
| Remote Policies | Yes | Empty | Functional, needs data |
| Project Templates | Yes | Empty | Functional, needs data |
| Task Templates | Yes | Empty | Functional, needs data |
| Recurring Tasks | Yes | Empty | Functional, needs data |
| Meeting Notes | Yes | Empty | Functional, needs data |
| Decision Log | Yes | Empty | Functional, needs data |
| Lessons Learned | Yes | Empty | Functional, needs data |
| **Work Calendars** | **NO - TABLE MISSING** | N/A | **work_calendars table missing** |

### Performance
| Page | DB Connected | Has Data | Issues |
|------|-------------|----------|--------|
| OKRs | Yes | Empty | Functional, needs data |
| 360 Feedback | Yes | Empty | Functional, needs data |
| 1:1 Meetings | Yes | Yes (1) | Works correctly |
| PIPs | Yes | Yes (2) | Works correctly |

### Project Controls
| Page | DB Connected | Has Data | Issues |
|------|-------------|----------|--------|
| Baselines | Yes | Empty | Functional, needs data |
| Changes | Yes | Empty | Functional, needs data |
| **Scoring** | **NO - TABLE MISSING** | N/A | **project_scoring table missing** |
| Gantt Chart | Yes | Derived from tasks | Works if tasks have dates |

### Finance & HR
| Page | DB Connected | Has Data | Issues |
|------|-------------|----------|--------|
| Payroll | Yes | Empty | Functional, needs salary structures first |
| Timesheets | Yes | Yes (3) | Works correctly |
| Expenses | Yes | Empty (wrong org) | Data exists but in different org |
| Expense Categories | Yes | Empty | Functional, needs data |
| Loans & Advances | Yes | Empty | Functional, needs data |
| Documents | Yes | Empty | Functional, needs data |
| Assets | Yes | Empty | Functional, needs data |
| Holidays | Yes | Empty | Functional, needs data |
| **Tax Management** | **NO - TABLE MISSING** | N/A | **tax_declarations table missing** |
| Salary Structure | Yes | Empty | Functional, needs data |
| Salary Revisions | Yes | Empty | Functional, needs data |
| Bonus Management | Yes | Empty | Functional, needs data |
| Reimbursements | Yes | Empty | Functional, needs data |
| Compliance | Yes | Empty | Functional, needs data |
| Form 16 | Yes | Empty | Functional, needs data |

### Investments & Benefits
| Page | DB Connected | Has Data | Issues |
|------|-------------|----------|--------|
| Investments | Yes | Empty | Functional, needs data |
| Benefits | Yes | Empty | Functional, needs data |
| F&F Settlement | Yes | Empty | Functional, needs data |
| Gratuity | Yes | Empty | Functional, needs data |

### Employee Lifecycle
| Page | DB Connected | Has Data | Issues |
|------|-------------|----------|--------|
| Onboarding | Yes | Empty | Functional, needs data |
| Exit Management | Yes | Empty | Functional, needs data |
| Contracts | Yes | Empty | Functional, needs data |
| Verification | Yes | Empty | Functional, needs data |
| Probation | Yes | Empty | Functional, needs data |
| Confirmations | Yes | Empty | Functional, needs data |
| Handbook | Yes | Empty | Functional, needs data |
| Grievances | Yes | Empty | Functional, needs data |
| Disciplinary | Yes | Empty | Functional, needs data |

### HR Analytics & Growth
| Page | DB Connected | Has Data | Issues |
|------|-------------|----------|--------|
| HR Analytics | Yes | Yes (14 profiles) | Fixed in previous audit |
| **Benchmarking** | **NO - TABLE MISSING** | N/A | **benchmarking_data table missing** |
| Succession | Yes | Empty | Functional, needs data |
| Career Paths | Yes | Empty | Functional, needs data |

### Recruitment
| Page | DB Connected | Has Data | Issues |
|------|-------------|----------|--------|
| Job Postings | Yes | Empty | Functional, needs data |
| Recruitment | Yes | Empty | Functional, needs data |
| Interviews | Yes | Empty | Functional, needs data |
| Offers | Yes | Empty | Functional, needs data |

### Planning & Costing
| Page | DB Connected | Has Data | Issues |
|------|-------------|----------|--------|
| Budget Planning | Yes | Empty | Functional, needs data |
| Cost Centers | Yes | Empty | Functional, needs data |

### Admin Tools
| Page | DB Connected | Has Data | Issues |
|------|-------------|----------|--------|
| Roles & Permissions | Yes | Yes | Works correctly |
| Org Chart | Yes | Empty | **Broken due to 0 departments** |
| Templates | Yes | Empty | Functional, needs data |
| Approvals | Yes | Empty | Functional, needs data |
| Work Health | Yes | Yes | Works correctly |
| Automation | Yes | Yes (3 rules) | Works correctly |
| **Audit Packs** | **NO - TABLE MISSING** | N/A | **audit_packs table missing** |
| Lifecycle | Yes | Empty | Functional, needs data |
| Reports | Yes | Empty | Functional, needs data |
| Coins | Yes | Yes (1 kudos) | Works correctly |
| Employees | Yes | Yes (14) | Works correctly |
| Analytics | Yes | Yes | Works correctly |

### Resources
| Page | DB Connected | Has Data | Issues |
|------|-------------|----------|--------|
| Tutorial | Yes | Empty | Functional, needs data |
| **Training** | **NO - TABLE MISSING** | N/A | **training_programs table missing** |
| Communication | Yes | Empty | Functional, needs data |
| Kudos Wall | Yes | Yes (1) | Works correctly |
| Pulse Surveys | Yes | Yes (1) | Works correctly |
| App Feedback | Yes | Empty | Functional, needs data |

---

## FIX PLAN (Priority Order)

### Fix 1: Create 8 Missing Database Tables
Create: `shifts`, `shift_assignments`, `tax_declarations`, `training_programs`, `work_calendars`, `benchmarking_data`, `audit_packs`, `project_scoring`
Each needs: proper columns, RLS policies with org isolation, indexes.

### Fix 2: Create Default Departments
INSERT departments (e.g., Engineering, HR, Finance, Operations, Marketing) for the organization, then update profile department assignments.

### Fix 3: Sync Employee Role
UPDATE `profiles` SET `role = 'employee'` WHERE `email = 'gopikomirisetti999@gmail.com'` to match the `user_roles` table.

### Fix 4: Fix `supabase as any` Type Casts
After creating the missing tables, regenerate Supabase types so the 13 files with 255 `as any` casts can use proper typing.

### Fix 5: Security Hardening
- Enable leaked password protection in Supabase Auth settings
- Reduce OTP expiry to recommended threshold
- Review the `feedback_responses` INSERT policy

---

## Employee-Specific Data (gopikomirisetti999@gmail.com)

| Data | Count | Notes |
|------|-------|-------|
| Tasks assigned | 4 | Visible on Kanban |
| Attendance records | 2 | Visible on Attendance tab |
| Leave balances | 8 | Visible on Leave tab |
| Timesheets | 2 | Visible on Timesheets tab |
| Time logs | 0 | No time entries |
| Department | NONE | Not assigned to any department |

The employee can access their assigned data. Main limitation is the lack of department assignment which affects filtering and reporting.

