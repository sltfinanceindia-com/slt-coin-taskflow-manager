

# TeneXA Platform — Comprehensive Application Report (April 1, 2026)

---

## 1. PLATFORM OVERVIEW

TeneXA is an enterprise HR and Project Management SaaS platform built with **React 18, Vite 5, TypeScript 5, Tailwind CSS v3**, and **Supabase** (Postgres + RLS + Edge Functions). Published at **sltwork.lovable.app**.

- **10-tier RBAC**: super_admin, org_admin, admin, hr_admin, project_manager, finance_manager, manager, team_lead, employee, intern
- **180+ database tables** in public schema
- **73 routes** defined in App.tsx
- **80+ component modules** across 70+ component directories
- **10 organizations** registered on the platform
- **29 total user profiles** (18 active)

---

## 2. BUILD STATUS — 2 ERRORS (BLOCKING)

| # | File | Error | Fix |
|---|------|-------|-----|
| 1 | `src/components/sprints/SprintManagement.tsx:182` | `AlertTriangle` is used but never imported from lucide-react | Add `AlertTriangle` to the lucide-react import |
| 2 | `src/hooks/useAuth.tsx:88` | Profile `role` type is limited to 5 values (`admin|employee|intern|org_admin|super_admin`) but `user_roles` query returns all 10 role types | The `Profile.role` type on line 11 already has all 10 roles, but the `signUp` function parameter on line 29 restricts to `'admin' | 'intern'`. The actual type error is that the DB query returns `app_role` which includes all 10 types, being assigned to a narrower type somewhere in the chain. Fix: ensure the cast on line 94 uses the full `Profile['role']` type |

**These must be fixed before the app can build.**

---

## 3. ORGANIZATION & USER STATUS

### Organizations (10 total)

| Organization | Status | Trial Ends | Active Users | Issue |
|-------------|--------|-----------|-------------|-------|
| **SLT Finance India** | active | 2026-06-12 | 3 | OK (primary org) |
| Johnny | trialing | 2026-01-02 | 2 | **EXPIRED** |
| GAG Tech | trialing | 2026-01-06 | 3 | **EXPIRED** |
| Payara Labs | trialing | 2026-03-13 | 1 | **EXPIRED** |
| PAYARA LABAS | trialing | 2026-03-13 | 1 | **EXPIRED** |
| Test | trialing | 2025-12-27 | 2 | **EXPIRED** |
| MilaaN | trialing | 2026-01-03 | 2 | **EXPIRED** |
| Johndeere | trialing | 2026-01-02 | 1 | **EXPIRED** |
| Emug | trialing | 2026-01-02 | 1 | **EXPIRED** |
| BN SMART BEES | trialing | 2026-01-02 | 2 | **EXPIRED** |

**9 of 10 organizations have expired trials.** Only SLT Finance India is active.

### Active Users with Role Mismatches (6 of 18)

| Email | profiles.role | user_roles | Status |
|-------|--------------|------------|--------|
| komirisetti966@gmail.com | intern | admin | MISMATCH |
| gopi@123gmail.com | intern | employee | MISMATCH |
| komirisettivenkateswaramma@gmail.com | intern | manager | MISMATCH |
| mayur123@gmail.com | intern | manager | MISMATCH |
| slthostels@gmail.com | intern | employee | MISMATCH |
| sprayer@gmail.com | intern | employee | MISMATCH |

**6 users still have role mismatches** between `profiles.role` and `user_roles`. Previous fix only corrected SLT Finance India org users.

---

## 4. DATABASE DATA AUDIT

### Tables WITH Data (30 tables)

| Table | Records | Health |
|-------|---------|--------|
| session_logs | 2,591 | Healthy |
| time_logs | 151 | Healthy |
| leave_balances | 78 | Healthy |
| tasks | 55 | Healthy |
| communication_channels | 34 | Healthy |
| coin_transactions | 33 | OK |
| user_roles | 31 | OK |
| profiles | 29 | OK |
| attendance_records | 20 | OK |
| chat_users | ~29 | OK |
| audit_logs | 13 | OK |
| holidays | 11 | OK |
| timesheets | 10 | OK |
| custom_roles | 10 | OK |
| departments | 7 | OK |
| assessments | 6 | OK |
| feedback_responses | 6 | OK |
| messages | 6 | OK |
| notifications | 5 | OK |
| calendar_events | 5 | OK |
| kudos | 5 | OK |
| automation_rules | 5 | OK |
| wfh_requests | 4 | OK |
| one_on_one_meetings | 4 | OK |
| performance_improvement_plans | 4 | OK |
| projects | 3 | OK |
| shifts | 3 | OK |
| job_postings | 3 | OK |
| training_programs | 2 | OK |
| announcements | 2 | OK |

### Tables with Data (Low, 1-2 records)

| Table | Records |
|-------|---------|
| budget_allocations | 2 |
| objectives | 2 |
| pulse_surveys | 2 |
| leave_requests | 1 |
| payroll_runs | 1 |
| expense_claims | 1 |
| loan_requests | 1 |
| reimbursements | 1 |
| onboarding_records | 1 |
| employee_benefits | 1 |
| investment_declarations | 1 |
| sprints | 1 |
| training_sections | 1 |

### Tables STILL at 0 Records (5 critical)

| Table | Impact |
|-------|--------|
| salary_structures | Payroll module incomplete |
| employee_contracts | HR Lifecycle gaps |
| employee_documents | Document management empty |
| exit_requests | Offboarding untestable |
| grievances | HR workflow untestable |
| tax_declarations | Finance module empty |
| work_calendars | Work calendar feature empty |
| security_alerts | Security monitoring empty |
| issues | Issue tracker empty |
| login_attempts | OK (expected) |

---

## 5. SECURITY AUDIT

### Supabase Linter: 5 Warnings

| # | Issue | Status |
|---|-------|--------|
| 1-2 | Permissive RLS (INSERT true) | `contact_submissions` + `trial_signups` — **Intentional** (public forms) |
| 3 | OTP expiry too long | **MANUAL FIX needed** in Supabase Dashboard |
| 4 | Leaked password protection disabled | **MANUAL FIX needed** in Supabase Dashboard |
| 5 | Postgres security patches available | **MANUAL FIX needed** in Supabase Dashboard |

### Security Features Implemented
- RLS enabled on all 180+ tables
- Account lockout (5 failed attempts / 15 min window)
- Content protection for non-admins
- Session tracking with device/location
- Organization-level data isolation
- SECURITY DEFINER functions for role checks

### Security Gaps
- 3 manual Supabase Dashboard fixes still pending
- 6 cross-org role mismatches could cause access issues

---

## 6. ROUTES & PAGES (73 total)

### Public Pages (11)
Landing, Auth, Signup, Pricing, Features, Terms, Privacy, Contact, About, Resources, Start Trial

### Super Admin Pages (13)
Dashboard, Organizations (list/create/detail), Users, Billing, Analytics, Plans, Settings, Feedback Rewards, System Health, Audit Trail, Announcements

### Admin Pages (3)
Organization Settings, Roles & Permissions, Org Chart

### Protected Module Pages (12)
Dashboard, Profile, Training, Assessment, Kudos, Pulse Surveys, My Goals, Tutorial, Calendar, Help, Employees, Projects, Tasks, Attendance, Leaves, Payroll, Performance, Approvals, Reports

### Detail Pages (5)
Task Detail, Portfolio Detail, Program Detail, Employee Detail, Project Detail

---

## 7. COMPONENT MODULES (70+ directories)

| Category | Modules |
|----------|---------|
| **Work Management** | tasks, kanban, sprints, backlog, projects, baselines, capacity, workload, scoring |
| **HR & People** | employee, hr, lifecycle, onboarding, workforce, recognition, kudos, pulse |
| **Finance** | payroll, expenses, finance, loans |
| **Performance** | performance, goals, assessment, training |
| **Communication** | communication, collaboration, updates |
| **Admin** | admin, super-admin, rbac, settings, automation |
| **Analytics** | charts, reports, health |
| **Other** | calendar, documents, files, servicedesk, requests, changes, search, tour |

---

## 8. FRONTEND ISSUES

| # | Issue | Severity |
|---|-------|----------|
| 1 | **Build error**: `AlertTriangle` not imported in SprintManagement.tsx | CRITICAL |
| 2 | **Build error**: Type mismatch in useAuth.tsx role assignment | CRITICAL |
| 3 | `useTrainingPrograms` hook not wired to Training page | HIGH |
| 4 | `useWorkCalendars` hook not wired to any component | HIGH |
| 5 | No `React.lazy` code splitting (was reportedly added but not found) | MEDIUM |
| 6 | Time logs show 0 for both test users (151 logs belong to inactive accounts) | MEDIUM |

---

## 9. DATABASE FUNCTION STATUS

| Function | Status | Notes |
|----------|--------|-------|
| `get_current_user_role()` | FIXED | Reads from user_roles with all 10 role priorities |
| `can_update_profile()` | FIXED | Checks user_roles for admin/super_admin/org_admin |
| `get_user_highest_role()` | FIXED | Includes all 10 role types |
| `is_super_admin()` | OK | Checks user_roles |
| `is_org_admin()` | OK | Checks user_roles |
| `is_any_admin()` | OK | Checks user_roles |
| `has_role()` | OK | Checks user_roles |
| `handle_new_user()` | OK | Creates profile + user_role + chat_user |
| `is_account_locked()` | OK | 5 attempts / 15 min lockout |

---

## 10. RBAC & PERMISSIONS

- **10 custom_roles** seeded for SLT Finance India
- **64 role_permissions** mapped across modules
- Admin roles (super_admin/org_admin/admin) bypass permission checks via code
- Non-admin roles use `hasPermission()` / `canAccessModule()` from role_permissions
- **Issue**: Admin roles have 0 role_permissions entries (works due to bypass but `getAccessibleModules()` returns empty for them)

---

## 11. EDGE FUNCTIONS

Functions deployed in `supabase/functions/`:
- `check-login-status` — Account lockout verification
- `_shared/auth.ts` — Shared authentication (refactored to use user_roles)

---

## 12. MATURITY SCORECARD

| Category | Score | Notes |
|----------|-------|-------|
| Architecture | 9/10 | Clean React + Supabase + RBAC |
| Database Design | 8/10 | 180+ tables, comprehensive schema |
| Security | 6/10 | RLS + lockout done, 3 manual fixes pending |
| Data Coverage | 5/10 | 30 tables with data, 10+ still empty |
| Functionality | 5/10 | ~50% modules have live data flowing |
| Build Health | 3/10 | 2 blocking TypeScript errors |
| Scalability | 7/10 | Org isolation, unlimited users supported |

**Overall Platform Readiness: 6/10**

---

## 13. IMPLEMENTATION PLAN (Priority Order)

### Step 1: Fix Build Errors (CRITICAL — blocks everything)
- Add `AlertTriangle` import to `src/components/sprints/SprintManagement.tsx`
- Fix type mismatch in `src/hooks/useAuth.tsx` — the `signUp` role parameter type is too narrow and the profile role assignment at line 88-90 needs a proper type cast

### Step 2: Fix Cross-Org Role Mismatches
- SQL migration to sync `profiles.role` with highest `user_roles.role` for 6 mismatched users across all organizations

### Step 3: Wire Unused Hooks
- Import `useTrainingPrograms` into Training page to display programs from DB
- Wire `useWorkCalendars` into a UI component

### Step 4: Seed Remaining Empty Tables
- `salary_structures`, `employee_contracts`, `employee_documents`, `exit_requests`, `grievances`, `tax_declarations`, `work_calendars`, `issues`

### Step 5: Manual Supabase Dashboard Fixes
- Reduce OTP expiry to 5 minutes
- Enable leaked password protection
- Apply Postgres security patches

**Estimated scope: 2 file fixes + 1 SQL migration + 2 hook integrations + 1 data seed**

