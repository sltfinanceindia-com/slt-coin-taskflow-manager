

# TeneXA Platform — E2E Audit Report (March 18, 2026)

---

## 1. USER ACCOUNTS STATUS

### Employee: gopikomirisetti999@gmail.com
| Field | Value | Status |
|-------|-------|--------|
| Profile Role | employee | OK |
| user_roles | employee | SYNCED |
| Department | Finance | OK |
| Employee ID | SLT-EMP-001 | OK |
| Reporting Manager | Admin (6fb191ba) | OK |
| Total Coins | 35 | OK |
| Is Active | true | OK |

### Admin: gopi_komirisetti@sltfinanceindia.com
| Field | Value | Status |
|-------|-------|--------|
| Profile Role | super_admin | OK |
| user_roles | super_admin | SYNCED |
| Department | Operations | OK |
| Employee ID | SLT-ADM-001 | OK |
| Reporting Manager | NULL | OK (top of hierarchy) |
| Total Coins | 0 | OK |
| Is Active | true | OK |

**Both accounts: Role sync FIXED. Profile metadata COMPLETE.**

---

## 2. ORGANIZATION STATUS

| Field | Value | Status |
|-------|-------|--------|
| Name | SLT Finance India | OK |
| Subscription | active | OK (fixed) |
| Trial Ends | 2026-06-12 | OK |
| Max Users | -1 (unlimited) | OK |
| Active Profiles | 3 | LOW |
| Inactive Profiles | 11 | 11 deactivated users |
| Total user_roles | 16 | OK |
| Departments | 5 | OK |

**No org-level issues.**

---

## 3. RLS / SECURITY

### Supabase Linter: 5 Warnings
| # | Issue | Status |
|---|-------|--------|
| 1 | Permissive INSERT on `contact_submissions` | Intentional (public form) |
| 2 | Permissive INSERT on `trial_signups` | Intentional (public form) |
| 3 | OTP expiry too long | **MANUAL FIX** (Supabase Dashboard) |
| 4 | Leaked password protection disabled | **MANUAL FIX** (Supabase Dashboard) |
| 5 | Postgres security patches available | **MANUAL FIX** (Supabase Dashboard) |

**All previous RLS hardening confirmed. No new policy issues. `login_attempts` has RLS enabled with policies.**

---

## 4. RBAC & PERMISSIONS STATUS

| Item | Count | Status |
|------|-------|--------|
| custom_roles | 10 | OK |
| role_permissions | 64 | OK |

**Issue Found:** `org_admin`, `super_admin`, and `admin` roles have **0 role_permissions** entries. While these roles bypass permission checks via `isSuperAdmin || isAdmin` in `useRolePermissions`, this is technically correct but means `getAccessibleModules()` returns empty for admins.

---

## 5. DATABASE TABLE DATA AUDIT

### Tables WITH Data (Healthy)
| Table | Records | Change Since Last Audit |
|-------|---------|------------------------|
| session_logs | 2,254 | -333 (cleanup expected) |
| time_logs | 146 | Same |
| tasks | 45 | Same |
| coin_transactions | 33 | Same |
| communication_channels | 31 | Same |
| leave_balances | 24 | Same |
| user_roles | 16 | Same |
| custom_roles | 10 | NEW (was 0) |
| attendance_records | 13 | Same |
| audit_logs | 13 | NEW (was 0) |
| holidays | 10 | NEW (was 0) |
| assessments | 6 | Same |
| feedback_responses | 6 | Same |
| departments | 5 | Same |
| notifications | 5 | NEW (was 0) |
| calendar_events | 5 | NEW (was 0) |
| automation_rules | 3 | Same |
| timesheets | 3 | Same |
| shifts | 3 | NEW (was 0) |
| job_postings | 3 | NEW (was 0) |
| announcements | 2 | NEW (was 0) |
| wfh_requests | 2 | Same |
| training_programs | 2 | NEW (was 0) |
| performance_improvement_plans | 2 | Same |
| pulse_surveys | 1 | Same |
| one_on_one_meetings | 1 | Same |
| projects | 1 | Same |
| kudos | 1 | Same |
| messages | 1 | Same |
| training_sections | 1 | Same |

### Tables STILL at 0 Records
| Table | Root Cause | Fix Type |
|-------|-----------|----------|
| leave_requests | No user-created requests | DATA SEED |
| salary_structures | No structures defined | DATA SEED |
| expense_claims | No claims filed | DATA SEED |
| loan_requests | No loans | DATA SEED |
| reimbursements | No claims | DATA SEED |
| exit_requests | No exits | DATA SEED |
| grievances | No grievances filed | DATA SEED |
| employee_contracts | No contracts | DATA SEED |
| employee_benefits | No benefits | DATA SEED |
| objectives | No OKRs created | DATA SEED |
| issues | No issues created | DATA SEED |
| sprints | No sprints | DATA SEED |
| budget_allocations | No budgets | DATA SEED |
| employee_documents | No documents | DATA SEED |
| security_alerts | No alerts triggered | DATA SEED |
| login_attempts | No failed logins yet | OK (expected) |
| payroll_runs | No payroll executed | DATA SEED |
| onboarding_records | No onboarding | DATA SEED |
| work_calendars | No calendars | DATA SEED |
| tax_declarations | No declarations | DATA SEED |

---

## 6. PAGE-BY-PAGE E2E STATUS

### WORKING PAGES — Connected & Data Flowing

| Page | Route | Records | Employee | Admin | Status |
|------|-------|---------|----------|-------|--------|
| Dashboard | /dashboard | tasks:45, attendance:13 | 4 tasks | All | OK |
| Tasks/Kanban | /tasks | 45 | 4 assigned | 45 total | OK |
| Attendance | /attendance | 13 | 2 records | 13 records | OK |
| Leave Balances | /leaves | 24 balances | 8 balances | All | OK |
| WFH | via dashboard | 2 | 1 request | 2 requests | OK |
| Profile | /profile | per-user | Complete | Complete | OK |
| Employees | /employees | 14 profiles | N/A | All visible | OK |
| Org Chart | /org-chart | 5 depts | Works | Works | OK |
| Projects | /projects | 1 | Visible | Visible | OK |
| Kudos Wall | /kudos-wall | 1 | Visible | Visible | OK |
| Coins | via dashboard | 33 | 1 txn | All | OK |
| Timesheets | via dashboard | 3 | Visible | Visible | OK |
| 1:1 Meetings | via performance | 1 | Visible | Visible | OK |
| Pulse Surveys | /pulse-surveys | 1 | Visible | Visible | OK |
| PIPs | via performance | 2 | Visible | Visible | OK |
| Assessments | /assessment | 6 | Visible | Visible | OK |
| Holidays | via attendance | 10 | Visible | Visible | OK |
| Notifications | header bell | 2 (employee) | Works | Works | OK |
| Calendar Events | /calendar | 5 | Visible | Visible | OK |
| Announcements | via comms | 2 | Visible | Visible | OK |
| Job Postings | via recruitment | 3 | Visible | Visible | OK |
| Training Programs | /training | 2 programs, 1 section | Visible | Visible | **PARTIAL** |
| Shifts | via attendance | 3 types | Visible | Visible | OK |
| Automation Rules | via settings | 3 | N/A | 3 rules | OK |
| HR Analytics | via dashboard | 14 profiles, 5 depts | N/A | Works | OK |
| Super Admin | /super-admin/* | All org data | N/A | Works | OK |

### PAGES WITH ZERO DATA — Functional UI, Empty Tables

| Page | DB Table | Records | Issue Category |
|------|----------|---------|----------------|
| Leave Requests | leave_requests | 0 | DATA: No requests created by users |
| Time Logs (both users) | time_logs | 0 for both | DATA: 146 logs belong to other (inactive) users |
| Payroll | payroll_runs | 0 | DATA: No payroll executed |
| Salary Structures | salary_structures | 0 | DATA: No structures |
| Expense Claims | expense_claims | 0 | DATA: No claims |
| Loan Requests | loan_requests | 0 | DATA: No loans |
| Reimbursements | reimbursements | 0 | DATA: No claims |
| Exit Requests | exit_requests | 0 | DATA: No exits |
| Grievances | grievances | 0 | DATA: No grievances |
| Employee Contracts | employee_contracts | 0 | DATA: No contracts |
| Employee Benefits | employee_benefits | 0 | DATA: No benefits |
| Objectives/OKRs | objectives | 0 | DATA: No OKRs |
| Issues | issues | 0 | DATA: No issues |
| Sprints | sprints | 0 | DATA: No sprints |
| Budget Allocations | budget_allocations | 0 | DATA: No budgets |
| Employee Documents | employee_documents | 0 | DATA: No docs |
| Onboarding | onboarding_records | 0 | DATA: No onboarding |
| Work Calendars | work_calendars | 0 | DATA: No calendars |
| Tax Declarations | tax_declarations | 0 | DATA: No declarations |
| Security Alerts | security_alerts | 0 | OK: No alerts expected |
| Login Attempts | login_attempts | 0 | OK: No failed logins |

---

## 7. REMAINING CODE ISSUES

### Issue 1: `useTrainingPrograms` hook exists but NOT wired to any page/component
The hook was created at `src/hooks/useTrainingPrograms.tsx` but no page or component imports it. The Training page still only uses `useTrainingSections`. Training programs data (2 records) is invisible to users.

**Fix:** Wire `useTrainingPrograms` into Training page components.

### Issue 2: `useWorkCalendars` hook exists but NOT wired to any component
Same as above -- hook created but unused. Work calendars table is also empty (0 records).

**Fix:** Wire into a Work Calendar management component + seed data.

### Issue 3: Time Logs -- 146 records, 0 for both test users
All 146 time_logs belong to 6 inactive intern accounts. Neither the employee nor admin has any time logs, so the Time Logs page appears empty for both.

**Fix:** Seed time_logs for the 2 active accounts, or ensure attendance clock-out triggers create entries.

### Issue 4: Leave Requests still 0
Despite 24 leave balances, no leave requests have been created. The leave workflow remains untested end-to-end.

**Fix:** Seed 2-3 leave_requests for the employee account.

---

## 8. IMPROVEMENTS SINCE LAST AUDIT

| Item | Before | Now | Status |
|------|--------|-----|--------|
| Profile role sync | 3 mismatches | 0 mismatches | FIXED |
| Admin department | NULL | Operations | FIXED |
| Admin employee_id | NULL | SLT-ADM-001 | FIXED |
| All profile metadata | 12 incomplete | All complete | FIXED |
| Organization trial | Expired | Active until 2026-06-12 | FIXED |
| DB functions (3) | Read profiles.role | Read user_roles | FIXED |
| custom_roles | 0 | 10 | FIXED |
| role_permissions | 0 | 64 | FIXED |
| holidays | 0 | 10 | FIXED |
| notifications | 0 | 5 | FIXED |
| calendar_events | 0 | 5 | FIXED |
| shifts | 0 | 3 | FIXED |
| job_postings | 0 | 3 | FIXED |
| announcements | 0 | 2 | FIXED |
| training_programs | 0 | 2 | FIXED |
| audit_logs | 0 | 13 | FIXED |
| Permissive RLS policies | 12 | 2 (intentional) | FIXED |

---

## 9. SUMMARY BY SEVERITY

### HIGH
1. **`useTrainingPrograms` not wired** -- 2 training programs exist in DB but invisible to users
2. **20 tables still at 0 records** -- Finance, HR Lifecycle, Work Management modules are empty

### MEDIUM
3. **Time Logs empty for both test users** -- 146 logs exist but for inactive accounts only
4. **`useWorkCalendars` not wired + 0 data** -- Hook exists but unused
5. **Leave Requests at 0** -- Leave workflow untested
6. **3 Supabase Dashboard settings** still need manual configuration (OTP, leaked passwords, patches)

### LOW
7. **Admin roles (super_admin/org_admin/admin) have 0 role_permissions entries** -- Works due to bypass logic, but `getAccessibleModules()` returns empty for them

---

## 10. IMPLEMENTATION PLAN

### Step 1: Wire useTrainingPrograms into Training page
Import and use the hook in the Training page to display the 2 existing training programs from the database.

### Step 2: Wire useWorkCalendars into a UI component
Create or update a Work Calendar section in the attendance/settings area and seed 1 work calendar record.

### Step 3: Seed data for empty critical tables
Priority order:
- `leave_requests` (3 records for employee)
- `time_logs` (5 records for employee + 5 for admin)
- `salary_structures` (2 records)
- `payroll_runs` (1 record)
- `expense_claims` (2 records)
- `objectives` (3 records)
- `employee_contracts` (2 records)
- `work_calendars` (1 record)

### Step 4: Manual Supabase Dashboard fixes
- Reduce OTP expiry to 5 minutes
- Enable leaked password protection
- Apply Postgres security patches

**Estimated scope: 2 frontend file changes + 1 data seeding operation**

