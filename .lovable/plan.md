

# TeneXA Complete Audit -- February 22, 2026

## Critical Issues Found

### Issue 1: HR Analytics Shows "Total Employees: 0" (BROKEN)
**Root Cause:** The query `profiles.select('...departments(name)')` returns HTTP **300** because PostgREST finds TWO relationships between `profiles` and `departments`:
1. `departments_head_id_fkey` (departments.head_id -> profiles.id) -- one-to-many
2. `profiles_department_id_fkey` (profiles.department_id -> departments.id) -- many-to-one

PostgREST cannot disambiguate and returns a 300 error instead of data. This causes `profilesData` to be undefined, so "Total Employees: 0".

**Fix:** Change `.select('...departments(name)')` to `.select('...departments!profiles_department_id_fkey(name)')` in `HRAnalytics.tsx` and `useReportingStructure.tsx`.

### Issue 2: HR Analytics Queries Non-Existent `exit_interviews` Table (BROKEN)
**Root Cause:** `HRAnalytics.tsx` queries `exit_interviews` table which does not exist. Returns HTTP 400. The component should use `exit_requests` table instead.

**Fix:** Change `from('exit_interviews')` to `from('exit_requests')` and adjust the select fields to match the `exit_requests` schema.

### Issue 3: Excessive `user_roles` Queries (PERFORMANCE)
**Root Cause:** Network log shows 10+ duplicate `user_roles` queries firing on every page load. Each takes 200-3000ms. This is caused by multiple hooks independently querying the same data without shared caching.

**Fix:** This is a lower priority optimization but causes slow page loads.

## Tabs Verified Working (with data)

| Tab | Status | Evidence |
|-----|--------|----------|
| Overview Dashboard | WORKS | 2 tasks, completion rate, charts |
| Kanban Board | WORKS | Assigned tab shows tasks |
| Projects | WORKS | "SLT Hostels Marketing" |
| Leave Management | WORKS | Comp-Off 12.0 days balance |
| Bonus Management | WORKS | Add Bonus form opens correctly |
| Attendance | WORKS | 6 records |
| Time Logs | WORKS | 3 entries |
| Timesheets | WORKS | 6 timesheets |
| Sprint Planning | WORKS | 1 sprint |
| Payroll | WORKS | Component loads |
| Expenses | WORKS | 1 claim |
| OKRs | WORKS | 1 objective |

## Tabs Empty But Functional (need data entry, NOT broken)

All other 50+ tabs load correctly with proper empty states. They need the admin to enter data.

## Fix Plan

### Fix 1: Disambiguate departments join (2 files)
- `src/components/hr/HRAnalytics.tsx` line 21: Change `departments(name)` to `departments!profiles_department_id_fkey(name)`
- `src/hooks/useReportingStructure.tsx` line 216: Same fix

### Fix 2: Replace exit_interviews with exit_requests (1 file)
- `src/components/hr/HRAnalytics.tsx` lines 33-36: Change `from('exit_interviews')` to `from('exit_requests')` and update the select to use exit_requests columns: `id, employee_id, reason, status, created_at`

### Technical Details

All fixes are frontend-only code changes. No database migrations needed.

| Fix | File | Type | Impact |
|-----|------|------|--------|
| 1 | HRAnalytics.tsx, useReportingStructure.tsx | Query fix | HR Analytics shows correct employee count |
| 2 | HRAnalytics.tsx | Table name fix | Attrition data loads without 400 error |

