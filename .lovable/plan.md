

# TeneXA Platform — Complete E2E Audit Report (March 14, 2026)

---

## 1. USER ACCOUNTS STATUS

### Employee: gopikomirisetti999@gmail.com
| Field | Value | Status |
|-------|-------|--------|
| Profile ID | 2ebb7605... | OK |
| Role (profiles) | employee | OK |
| Role (user_roles) | employee | SYNCED |
| Department | Finance | OK (fixed) |
| Employee ID | SLT-EMP-001 | OK (fixed) |
| Reporting Manager | Admin (6fb191ba...) | OK (fixed) |
| Total Coins | 35 | OK |

### Admin: gopi_komirisetti@sltfinanceindia.com
| Field | Value | Status |
|-------|-------|--------|
| Profile ID | 6fb191ba... | OK |
| Role (profiles) | super_admin | SYNCED (fixed) |
| Role (user_roles) | super_admin | OK |
| Department | NULL | **MISSING** |
| Employee ID | NULL | **MISSING** |
| Total Coins | 0 | OK |

### Organization: SLT Finance India
| Field | Value | Status |
|-------|-------|--------|
| Subscription Status | active | OK (fixed) |
| Trial Ends | 2026-06-12 | OK (extended) |
| Max Users | -1 (unlimited) | OK |
| Total Profiles | 29 | OK |

---

## 2. PROFILE COMPLETENESS — CRITICAL ISSUE

**12 of 14 org profiles have NULL department, employee_id, and reporting_manager_id.** Only `gopikomirisetti999@gmail.com` was fixed. This breaks:
- Org Chart (only shows employees with departments)
- Team hierarchy / data visibility scoping
- HR Analytics department breakdowns
- Manager-based task filtering

**Affected users:** Admin, all interns, all test accounts.

---

## 3. PAGE-BY-PAGE E2E AUDIT

### WORKING PAGES (Data Connected, DB Queries Functional)

| Page | Route | DB Table | Records | Employee View | Admin View | Issues |
|------|-------|----------|---------|---------------|------------|--------|
| Dashboard | /dashboard | tasks, attendance, profiles | 45/13/14 | 4 tasks, 2 attendance | All data | OK |
| Tasks/Kanban | /tasks | tasks | 45 | 4 assigned | 45 total (43 created) | OK |
| Attendance | /attendance | attendance_records | 13 | 2 records | 13 records | OK |
| Leave | /leaves | leave_balances, leave_requests | 24/0 | 8 balances, 0 requests | 24 balances | **0 leave_requests** |
| WFH | via dashboard | wfh_requests | 2 | 1 request | 2 requests | OK |
| Profile | /profile | profiles | 1 per user | Works | Works | Admin dept=NULL |
| Employees | /employees | profiles | 14 | N/A | 14 profiles | OK |
| Org Chart | /org-chart | departments, profiles | 5/14 | Works | Works | 12 profiles missing dept |
| Projects | /projects | projects | 3 | Visible | Visible | OK |
| Kudos Wall | /kudos-wall | kudos | 5 | Visible | Visible | OK |
| Coins | via dashboard | coin_transactions | 33 | 1 transaction | All | OK |
| Timesheets | via dashboard | timesheets | 3 | Visible | Visible | OK |
| 1:1 Meetings | via performance | one_on_one_meetings | 1 | Visible | Visible | Low data |
| Pulse Surveys | /pulse-surveys | pulse_surveys | 1 | Visible | Visible | Low data |
| PIPs | via performance | performance_improvement_plans | 2 | Visible | Visible | OK |
| Assessments | /assessment | assessments | 6 | Visible | Visible | OK |
| Automation Rules | via settings | automation_rules | 3 | N/A | 3 rules | OK |
| HR Analytics | via dashboard | profiles, departments, exit_requests | 14/5/0 | N/A | Works | 0 exit data |

### PAGES WITH ZERO DATA — Functional UI, Empty Tables

| Page | Route | DB Table | Records | Root Cause | Fix Needed |
|------|-------|----------|---------|------------|------------|
| **Leave Requests** | /leaves | leave_requests | 0 | No requests created | DATA: Needs seed or user action |
| **Time Logs** | /time-logs | time_logs | 146 (org) but 0 for both users | time_logs.user_id doesn't match either profile ID | **INVESTIGATE** |
| **Payroll** | /payroll | payroll_runs | 0 | No payroll runs created | DATA: Seed needed |
| **Salary Structures** | via payroll | salary_structures | 0 | No structures defined | DATA: Seed needed |
| **Expense Claims** | via finance | expense_claims | 0 | No claims filed | DATA: Seed needed |
| **Loan Requests** | via finance | loan_requests | 0 | No loans | DATA: Seed needed |
| **Reimbursements** | via finance | reimbursements | 0 | No claims | DATA: Seed needed |
| **Job Postings** | via recruitment | job_postings | 0 | No postings created | DATA: Seed needed |
| **Training Programs** | /training | training_programs | 0 | **NO FRONTEND HOOK** for `training_programs` | **CODE: Missing DB query** |
| **Calendar Events** | /calendar | calendar_events | 0 | No events created | DATA: Seed needed |
| **Announcements** | via comms | announcements | 0 | No announcements | DATA: Seed needed |
| **Holidays** | via attendance | holidays | 0 (org) | No holidays defined | DATA: Seed needed |
| **Exit Requests** | via HR | exit_requests | 0 | No exits | DATA: Seed needed |
| **Grievances** | via HR | grievances | 0 | No grievances filed | DATA: Seed needed |
| **Onboarding** | via HR | onboarding_records | 0 (org) | No onboarding | DATA: Seed needed |
| **Employee Contracts** | via HR | employee_contracts | 0 | No contracts | DATA: Seed needed |
| **Employee Benefits** | via HR | employee_benefits | 0 (org) | No benefits | DATA: Seed needed |
| **Issues** | via work mgmt | issues | 0 | No issues created | DATA: Seed needed |
| **Objectives/OKRs** | /my-goals | objectives | 0 (org) | No OKRs | DATA: Seed needed |
| **Sprints** | via projects | sprints | 0 (org) | No sprints | DATA: Seed needed |
| **Budget Allocations** | via finance | budget_allocations | 0 (org) | No budgets | DATA: Seed needed |
| **Shifts** | via attendance | shifts | 0 | **NO FRONTEND HOOK** — no code queries `shifts` table | **CODE: Missing** |
| **Tax Declarations** | via finance | tax_declarations | 0 | Hook exists (TaxManagement.tsx) | DATA: Seed needed |
| **Employee Documents** | via HR | employee_documents | 0 | No documents | DATA: Seed needed |
| **Security Alerts** | via admin | security_alerts | 0 | No alerts | DATA: Seed needed |
| **Notifications** | header bell | notifications | 0 | No notifications sent | DATA: Seed needed |

---

## 4. CRITICAL CODE ISSUES FOUND

### Issue 1: `training_programs` — No Frontend Query
The Training page (`src/pages/Training.tsx`) uses `useTrainingSections` which queries `training_sections` (1 record) but there is **no hook or query for `training_programs`** (0 records). The training module cannot display programs.

### Issue 2: `shifts` — No Frontend Query  
No file in `src/` queries the `shifts` table. The shifts module exists in the database schema but has no frontend implementation to display or manage shifts.

### Issue 3: `work_calendars` — No Frontend Query
No file queries `work_calendars`. The table exists but is not connected to any UI.

### Issue 4: `get_current_user_role()` DB Function — Reads Wrong Source
This function still reads from `profiles.role` instead of `user_roles`. Any RLS policy or feature using this function will get the legacy role value.

### Issue 5: `can_update_profile()` DB Function — Reads Wrong Source
Same issue — checks `profiles.role` for admin verification instead of `user_roles`.

### Issue 6: `custom_roles` and `role_permissions` Tables — EMPTY
The `useRolePermissions` hook queries `custom_roles` and `role_permissions` tables, but both have **0 records**. This means:
- `hasPermission()` always returns `false` for non-admins
- `canAccessModule()` always returns `false` for non-admins
- Module-level permission enforcement is **non-functional**

### Issue 7: Time Logs — 146 Records But 0 for Both Accounts
The `time_logs` table has 146 records in the org, but neither the admin nor employee profile ID matches any `user_id`. These records may be from other users or auto-generated with different IDs.

---

## 5. RLS / SECURITY STATUS

| Issue | Status |
|-------|--------|
| Tables with RLS enabled | All 180+ tables — OK |
| Tables with no policies | 0 (was `login_attempts`, now fixed) |
| Permissive INSERT policies | Only `contact_submissions` and `trial_signups` (intentional public) |
| `login_attempts` service_role ALL policy | Permissive but expected (service role) |
| OTP expiry too long | **MANUAL FIX NEEDED** (Supabase Dashboard) |
| Leaked password protection | **MANUAL FIX NEEDED** (Supabase Dashboard) |
| Postgres security patches | **MANUAL FIX NEEDED** (Supabase Dashboard) |

---

## 6. DATABASE FUNCTION BUGS

| Function | Issue | Impact |
|----------|-------|--------|
| `get_current_user_role()` | Reads `profiles.role` not `user_roles` | Any RLS using this gets wrong role |
| `can_update_profile()` | Reads `profiles.role` for admin check | Only `admin` (not super_admin/org_admin) can update |
| `get_user_highest_role()` | Uses hardcoded priority list missing hr_admin, project_manager, finance_manager, manager, team_lead | Returns wrong role for 5 of 10 role types |

---

## 7. SUMMARY OF ALL ISSUES BY SEVERITY

### CRITICAL (Blocks core functionality)
1. **12 profiles missing department/employee_id/reporting_manager** — Breaks org chart, team hierarchy, data visibility
2. **`custom_roles` + `role_permissions` = 0 records** — Module-level permissions non-functional for non-admins
3. **`get_current_user_role()` reads profiles.role** — Any RLS policy using this function returns stale data
4. **`get_user_highest_role()` missing 5 role types** — Returns wrong priority for hr_admin, project_manager, finance_manager, manager, team_lead

### HIGH (Feature gaps)
5. **`shifts` table has no frontend code** — Shift management module non-functional
6. **`training_programs` has no frontend query** — Training programs cannot be displayed
7. **`work_calendars` has no frontend code** — Work calendar module non-functional
8. **`can_update_profile()` only checks for 'admin' role** — super_admin and org_admin cannot update profiles via this function

### MEDIUM (Empty data, UI works but shows nothing)
9. **27 tables with 0 records** in org — Finance, Recruitment, Lifecycle modules all empty
10. **0 notifications** — Notification system not generating alerts
11. **0 leave_requests** — Leave workflow untested

---

## 8. IMPLEMENTATION PLAN

### Step 1: Fix Database Functions (Migration)
- Update `get_current_user_role()` to read from `user_roles` table
- Update `can_update_profile()` to check `user_roles` for admin/super_admin/org_admin
- Update `get_user_highest_role()` to include all 10 role types with correct priority

### Step 2: Complete All Profile Metadata (Data Insert)
- Assign departments, employee_ids, and reporting_manager_ids to all 12 incomplete profiles
- Distribute across 5 existing departments (Engineering, HR, Finance, Operations, Marketing)

### Step 3: Initialize Role Permissions (Data Insert)
- Create `custom_roles` entries for all 10 role types for the org
- Create `role_permissions` entries for each role mapping module access

### Step 4: Seed Critical Empty Tables (Data Insert)
Priority order for functional testing:
- `leave_requests` (2-3 records)
- `calendar_events` (5 records)
- `holidays` (10+ Indian holidays)
- `notifications` (5 records)
- `announcements` (2 records)
- `job_postings` (3 records)
- `training_programs` (2 records)
- `shifts` (3 records — Morning/Evening/Night)
- `payroll_runs` (1 record)
- `expense_claims` (2 records)

### Step 5: Add Missing Frontend Hooks
- Create `useShifts` hook querying `shifts` table
- Create `useTrainingPrograms` hook querying `training_programs` table  
- Create `useWorkCalendars` hook querying `work_calendars` table
- Wire these hooks into their respective UI components

**Estimated scope: 1 SQL migration + 3 data operations + 3 new frontend hooks**

