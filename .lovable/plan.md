

# TeneXA Application -- Complete Summary & Status Report (March 4, 2026)

## What is TeneXA?

TeneXA is an enterprise HR and Project Management SaaS platform built with React 18, Vite, TypeScript, Tailwind CSS, and Supabase (Postgres + RLS + Edge Functions). It is published at **sltwork.lovable.app** and supports a 10-tier role-based access control (RBAC) hierarchy from Super Admin down to Intern across 80+ modules.

---

## Current Database Stats

| Table | Records | | Table | Records |
|-------|---------|---|-------|---------|
| profiles | 29 | | time_logs | 151 |
| tasks | 55 | | attendance_records | 20 |
| departments | 7 | | leave_balances | 78 |
| projects | 3 | | timesheets | 9 |
| kudos | 5 | | automation_rules | 5 |
| one_on_one_meetings | 4 | | PIPs | 4 |
| wfh_requests | 4 | | pulse_surveys | 2 |
| objectives (OKRs) | 2 | | budget_allocations | 2 |
| leave_requests | 1 | | sprint_tasks | 1 |
| sprints | 1 | | task_dependencies | 1 |
| expense_claims | 1 | | holidays | 1 |
| onboarding_records | 1 | | reimbursements | 1 |
| loan_requests | 1 | | employee_benefits | 1 |
| investment_declarations | 1 | | |  |

**Empty tables (0 records):** shifts, shift_assignments, tax_declarations, training_programs, work_calendars, benchmarking_data, audit_packs, project_scoring, issues, job_postings, payroll_runs, salary_structures, employee_contracts, exit_requests, grievances, fnf_settlements, employee_bonuses, project_risks, milestones, work_requests, notifications

---

## Working Features (Fully Functional with Data)

| Module | Status | Data |
|--------|--------|------|
| Dashboard / Overview | Working | Live stats from tasks, profiles |
| Kanban Board | Working | 55 tasks |
| Projects | Working | 3 projects |
| Time Logs | Working | 151 entries |
| Attendance | Working | 20 records |
| Leave Management | Working | 78 balances, 1 request |
| WFH Requests | Working | 4 requests |
| Timesheets | Working | 9 timesheets |
| 1:1 Meetings | Working | 4 meetings |
| PIPs | Working | 4 plans |
| Kudos / Coins | Working | 5 kudos |
| Pulse Surveys | Working | 2 surveys |
| Automation Rules | Working | 5 rules |
| HR Analytics | Working | 29 profiles, 7 departments |
| Org Chart | Working | 7 departments |
| Roles & Permissions | Working | RBAC via user_roles |
| Employees | Working | 29 profiles |
| OKRs | Working | 2 objectives |
| Sprint Planning | Working | 1 sprint, 1 task |
| Budget Planning | Working | 2 allocations |
| Work Health | Working | Active |
| Analytics | Working | Active |

---

## Functional but Empty (UI Works, Needs Data Population)

These 40+ modules have complete UI and database connectivity but contain 0 records:

**Work Management:** Requests, Capacity, Backlog, Milestones, Dependencies, Risk Register, Issue Tracker, Resource Allocation, Workload, Overtime, Comp-Off, On-Call, Shift Swap, Remote Policies, Project/Task/Recurring Templates, Meeting Notes, Decision Log, Lessons Learned

**Finance:** Payroll, Expenses, Expense Categories, Loans, Documents, Assets, Holidays, Salary Structure, Salary Revisions, Bonus Management, Reimbursements, Compliance, Form 16, Investments, Benefits, F&F Settlement, Gratuity

**Employee Lifecycle:** Onboarding, Exit Management, Contracts, Verification, Probation, Confirmations, Handbook, Grievances, Disciplinary

**Recruitment:** Job Postings, Recruitment Pipeline, Interviews, Offers

**Other:** Succession Planning, Career Paths, Cost Centers, Templates, Approvals, Reports, Tutorial, Communication, App Feedback

---

## Remaining Issues to Fix

### Issue 1: 2 Files Still Use `supabase as any` (Down from 13)
Previously 13 files had `as any` casts. Now only 2 remain:
- **`src/hooks/useIssues.tsx`** -- The `issues` table exists in both DB and generated types. The `as any` cast is unnecessary and should be removed.
- **`src/components/finance/SalaryStructureManagement.tsx`** -- Uses `supabase as any` to query `projects` table (which is typed). Also unnecessary.

**Fix:** Remove `as any` casts in both files and use the typed Supabase client directly. The `issues` table has the columns: id, organization_id, project_id, task_id, title, description, issue_type, priority, status, assignee_id, reporter_id, resolution, resolved_at. The `useIssues.tsx` hook references `issue_number` which does NOT exist in the schema -- this column needs to be added or removed from the code.

### Issue 2: `issues` Table Missing `issue_number` Column
The `useIssues.tsx` hook generates and inserts an `issue_number` field, but this column does not exist on the `issues` table. The insert will silently fail or be ignored.

**Fix:** Add `issue_number TEXT` column to the `issues` table via migration.

### Issue 3: 13 Overly Permissive RLS Policies (16 linter warnings)
The Supabase linter reports 13 RLS policies using `USING(true)` or `WITH CHECK(true)` on INSERT/UPDATE/DELETE operations. These are on system/logging tables (audit_logs, automation_logs, contact_submissions, daily_email_log, email_notifications, feedback_responses, notifications, payments, referral_tracking, scratch_cards, subscription_history, trial_signups). Most are acceptable for system tables, but `feedback_responses` INSERT policy is a potential abuse vector.

**Fix:** Tighten the `feedback_responses` INSERT policy to require `auth.uid() IS NOT NULL` at minimum.

### Issue 4: Auth Security Warnings (3 items)
- OTP expiry exceeds recommended threshold
- Leaked password protection is disabled
- Postgres version has security patches available

**Fix:** These must be addressed manually in the Supabase Dashboard under Auth Settings and Project Settings.

### Issue 5: Empty Specialized Tables
The 8 tables created in the recent migration (shifts, shift_assignments, tax_declarations, training_programs, work_calendars, benchmarking_data, audit_packs, project_scoring) all have 0 records. The UI will show empty states until data is populated.

**Fix:** No code fix needed -- these require manual data entry or seed data insertion.

---

## Implementation Plan

### Step 1: Add `issue_number` column to `issues` table
SQL migration to add the missing column.

### Step 2: Remove remaining `as any` casts
- Update `useIssues.tsx` to use typed Supabase client
- Update `SalaryStructureManagement.tsx` to use typed client

### Step 3: Harden `feedback_responses` RLS policy
Replace the permissive INSERT policy with one requiring authentication.

Total: 3 code changes + 1 migration.

