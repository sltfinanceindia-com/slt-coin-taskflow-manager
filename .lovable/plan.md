

# TeneXA Platform -- Full Audit Report (March 13, 2026)

## 1. USER ACCOUNTS AUDIT

### Employee Account: gopikomirisetti999@gmail.com
| Field | Value |
|-------|-------|
| Profile ID | 2ebb7605-9210-42e6-bddb-7a896563fcef |
| Full Name | Gopi Komirisetti |
| Profile Role | employee |
| user_roles Role | employee |
| Organization | SLT Finance India |
| Is Active | true |
| Department | NULL (not assigned) |
| Employee ID | NULL (not assigned) |
| Reporting Manager | NULL (not assigned) |
| Total Coins | NULL |
| Role Sync | CONSISTENT -- profile.role matches user_roles |

**Employee Data Summary:**
| Data | Records |
|------|---------|
| Tasks Assigned | 4 |
| Leave Balances | 8 |
| Attendance Records | 2 |
| WFH Requests | 1 |
| Time Logs | 0 |
| Leave Requests | 0 |
| Tasks Created | 0 |
| Kudos Received | 0 |

**Employee Issues Found:**
- Department is NULL -- employee won't appear in org chart or department filters
- Employee ID is NULL -- no employee identifier
- Reporting Manager is NULL -- breaks team hierarchy and data visibility
- Total Coins is NULL -- should be 0 by default
- 0 time logs despite having tasks -- time tracking not being used
- 0 leave requests despite 8 leave balances -- leave module untested for this user

---

### Admin Account: gopi_komirisetti@sltfinanceindia.com
| Field | Value |
|-------|-------|
| Profile ID | 6fb191ba-81d6-4302-8fc9-e76e2dfcbe87 |
| Full Name | Gopi Komirisetti |
| Profile Role | admin |
| user_roles Role | super_admin |
| Organization | SLT Finance India |
| Is Active | true |
| Role Sync | **MISMATCH** -- profile says "admin", user_roles says "super_admin" |

**Admin Data Summary:**
| Data | Records |
|------|---------|
| Tasks Created | 43 |
| Attendance Records | 11 |
| Kudos Given | 1 |
| Tasks Assigned | 0 |
| Time Logs | 0 |

**Admin Issues Found:**
- **CRITICAL: Role mismatch** -- `profiles.role = 'admin'` but `user_roles.role = 'super_admin'`. The `useUserRole` hook reads from `user_roles` (correct), but `authenticateRequest` in edge functions reads from `profiles.role`. This means edge functions see "admin" while the frontend sees "super_admin" -- inconsistent access control.
- Department is NULL
- Employee ID is NULL

---

## 2. ORGANIZATION STATUS

| Field | Value | Issue |
|-------|-------|-------|
| Name | SLT Finance India | OK |
| Subdomain | slt-finance | OK |
| Subscription | trialing | OK |
| Trial Ends | 2025-12-27 | **EXPIRED** (trial ended ~3 months ago) |
| Max Users | -1 (unlimited) | OK |
| Total Users | 14 profiles | OK |
| Total Roles | 16 user_roles entries | OK |

**Organization Issues:**
- **CRITICAL: Trial expired** on 2025-12-27. The organization is still set to "trialing" status but the trial_ends_at date has passed. If there's any trial enforcement logic, users may be blocked.

---

## 3. ROLE MISMATCHES ACROSS ORGANIZATION

3 users have mismatched roles between `profiles.role` and `user_roles`:

| Email | profiles.role | user_roles |
|-------|--------------|------------|
| gopi_komirisetti@sltfinanceindia.com | admin | super_admin |
| admin@sltfinanceindia.com | admin | super_admin, org_admin |
| test@gmail.com | intern | admin, intern |

These mismatches cause inconsistent behavior between frontend (uses `user_roles`) and edge functions (uses `profiles.role`).

---

## 4. DATABASE DATA AUDIT (Organization: SLT Finance India)

### Tables WITH Data
| Table | Records | Status |
|-------|---------|--------|
| session_logs | 2,587 | Healthy |
| time_logs | 146 | Healthy |
| tasks | 45 | Healthy |
| coin_transactions | 33 | Healthy |
| communication_channels | 31 | Healthy |
| leave_balances | 24 | Healthy |
| user_roles | 16 | OK |
| profiles | 14 | OK |
| chat_users | 14 | OK |
| attendance_records | 13 | OK |
| feedback_responses | 6 | OK |
| messages | 6 | Low |
| departments | 5 | OK |
| automation_rules | 3 | Low |
| timesheets | 3 | Low |
| wfh_requests | 2 | Low |
| kudos | 1 | Low |
| projects | 1 | Low |
| one_on_one_meetings | 1 | Low |
| pulse_surveys | 1 | Low |

### Tables with 0 Records (Empty)
| Category | Tables |
|----------|--------|
| **Work Management** | objectives, sprints, budget_allocations, issues, holidays |
| **Finance** | expense_claims, loan_requests, payroll_runs, salary_structures, reimbursements, employee_benefits, investment_declarations |
| **Employee Lifecycle** | onboarding_records, exit_requests, grievances, employee_contracts |
| **Recruitment** | job_postings |
| **Specialized** | shifts, training_programs, security_alerts, announcements, audit_logs, calendar_events, employee_documents |
| **Security** | login_attempts (0 -- newly created) |

---

## 5. RLS / SECURITY AUDIT

### Linter Results: 6 Issues
| # | Level | Issue | Status |
|---|-------|-------|--------|
| 1 | INFO | RLS enabled but no policies | `login_attempts` -- needs policies |
| 2 | WARN | Permissive RLS (INSERT true) | `contact_submissions` -- intentional (public form) |
| 3 | WARN | Permissive RLS (INSERT true) | `trial_signups` -- intentional (public form) |
| 4 | WARN | OTP expiry too long | Manual fix in Supabase Dashboard |
| 5 | WARN | Leaked password protection disabled | Manual fix in Supabase Dashboard |
| 6 | WARN | Postgres security patches available | Manual fix in Supabase Dashboard |

**RLS Hardening Status:**
- Previous 10 permissive policies on system tables have been hardened (auth.uid() IS NOT NULL)
- Only 2 intentionally public tables remain (`contact_submissions`, `trial_signups`)
- `login_attempts` has RLS enabled but NO policies -- the `is_account_locked` function uses SECURITY DEFINER so it works, but direct table access is blocked for everyone

### Edge Function Auth Issue
The shared `authenticateRequest()` in `supabase/functions/_shared/auth.ts` reads role from `profiles.role` instead of `user_roles`. This means edge functions use the wrong role for users with mismatches.

---

## 6. ISSUES FOUND -- PRIORITIZED

### CRITICAL
1. **Trial expired** -- Organization trial ended 2025-12-27, still shows "trialing"
2. **Role mismatch** -- 3 users have `profiles.role` != `user_roles.role`, causing inconsistent access between frontend and edge functions
3. **Edge function auth reads wrong role source** -- `_shared/auth.ts` reads from `profiles.role` instead of `user_roles`

### HIGH
4. **Employee profile incomplete** -- gopikomirisetti999@gmail.com has NULL department, employee_id, reporting_manager
5. **`login_attempts` table has no RLS policies** -- while SECURITY DEFINER functions bypass this, it should still have policies for defense in depth

### MEDIUM
6. **22+ empty tables** -- Major feature areas (Finance, Recruitment, Lifecycle) have no data
7. **Dashboard auth settings** -- OTP expiry, leaked password protection, Postgres patches need manual updates

### LOW
8. **`total_coins` defaults** -- Some profiles have NULL instead of 0 for total_coins

---

## 7. RECOMMENDED FIXES

### Fix 1: Sync profiles.role with user_roles (Critical)
Update `profiles.role` to match the highest role in `user_roles` for all mismatched users. Also update `_shared/auth.ts` to read from `user_roles` instead of `profiles`.

### Fix 2: Update organization trial status (Critical)
Set the organization's `subscription_status` to either 'active' or extend the trial_ends_at date.

### Fix 3: Complete employee profile (High)
Assign department, employee_id, and reporting_manager for gopikomirisetti999@gmail.com.

### Fix 4: Add login_attempts RLS policies (High)
Add basic policies: service role can INSERT/SELECT, authenticated users can read their own attempts.

### Fix 5: Fix edge function auth to use user_roles (Critical)
Update `supabase/functions/_shared/auth.ts` to query `user_roles` table instead of `profiles.role`.

### Fix 6: Dashboard manual settings (Medium)
- Reduce OTP expiry to 5 minutes
- Enable leaked password protection
- Apply Postgres security patches

---

## 8. PAGE-BY-PAGE STATUS

### Pages accessible to Employee (gopikomirisetti999@gmail.com)
| Page | Expected Data | Actual Data | Status |
|------|--------------|-------------|--------|
| Dashboard | Tasks, stats | 4 tasks, 2 attendance | Works but sparse |
| Kanban | Assigned tasks | 4 tasks | Works |
| Profile | User info | Missing dept, employee_id | Incomplete |
| Attendance | Records | 2 records | Works |
| Leave | Balances/Requests | 8 balances, 0 requests | Partial |
| WFH | Requests | 1 request | Works |
| Time Logs | Entries | 0 entries | Empty |
| Calendar | Events | 0 events | Empty |
| Training | Programs | 0 programs | Empty |
| Kudos Wall | Kudos | 0 received | Empty |

### Pages accessible to Admin (gopi_komirisetti@sltfinanceindia.com)
| Page | Expected Data | Actual Data | Status |
|------|--------------|-------------|--------|
| Dashboard | Org stats | 14 profiles, 45 tasks | Works |
| Super Admin Dashboard | Platform stats | Accessible (super_admin role) | Works |
| Employees | All profiles | 14 profiles | Works |
| Org Chart | Departments | 5 departments | Works |
| Tasks/Kanban | All tasks | 45 tasks (43 created by admin) | Works |
| Attendance | All records | 13 records | Works |
| Projects | All projects | 1 project | Works |
| HR Analytics | Metrics | 14 profiles, 5 depts | Works |
| Payroll | Runs | 0 records | Empty |
| Recruitment | Postings | 0 records | Empty |
| Finance modules | Data | All 0 | Empty |
| Lifecycle modules | Data | All 0 | Empty |

---

## IMPLEMENTATION PLAN

### Step 1: Fix role mismatches (SQL migration)
Update `profiles.role` for the 3 mismatched users to match their highest `user_roles` role.

### Step 2: Fix edge function auth
Update `_shared/auth.ts` to read role from `user_roles` table instead of `profiles.role`.

### Step 3: Update organization trial
Either extend trial or set subscription_status to 'active'.

### Step 4: Complete employee profile
Set department, employee_id, reporting_manager for the employee account.

### Step 5: Add login_attempts RLS policies
Basic policies for the newly created table.

**Total: 2 SQL migrations + 1 edge function update**

