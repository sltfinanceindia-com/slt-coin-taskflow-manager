
# TeneXA Application Issues - Comprehensive Fix Plan

## Executive Summary

After thorough analysis of the codebase, I've identified 26 issues that fall into 5 major categories:

1. **Mock Data Issues** (Issues 5-7, 12-16): Several components use hardcoded mock data instead of real Supabase queries
2. **Dashboard Data Loading** (Issues 1, 3): Components not properly fetching or displaying organization-scoped data  
3. **Navigation/Routing Issues** (Issues 8, 17-21, 22, 25): Tab navigation and sidebar state problems
4. **Action/Mutation Issues** (Issues 7, 23, 24): Buttons and forms not executing database operations
5. **Role-Based Features** (Issues 2A, 26): Missing role options and role-based dashboard content

---

## Phase 1: Mock Data Replacement (Critical Priority)

### Issue 5: Department Management - Mock Data

**File**: `src/components/admin/DepartmentManagement.tsx`

**Current Problem (Lines 54-108)**: Uses `mockDepartments` array instead of Supabase query

**Fix**:
- Replace `useState(mockDepartments)` with `useQuery` hook
- Query the `departments` table with organization filter
- Join with `profiles` for head count
- Implement real mutations for create/update/delete

```text
Changes Required:
1. Add useQuery for fetching departments from database
2. Add useMutation for create, update, delete operations
3. Remove mockDepartments array
4. Add organization_id filter to all queries
5. Calculate employee_count via join or subquery
```

---

### Issue 6: Team Management - Mock Data

**File**: `src/components/admin/TeamManagement.tsx`

**Current Problem (Lines 52-89)**: Uses `mockTeams` array

**Fix**:
- Replace with real `teams` table query
- Join with `departments` for department name
- Join with `profiles` for team lead info
- Use `team_members` junction table for member count

---

### Issue 7: Location Management - Mock Data

**File**: `src/components/admin/LocationManagement.tsx`

**Current Problem (Lines 53-93)**: Uses `mockLocations` array

**Fix**:
- Replace with real `locations` table query (if exists, or create table)
- Add organization_id filtering
- Implement real CRUD operations

---

### Issue 16: Benchmarking - Fake Graphs

**Current Problem**: Charts showing static mock data instead of aggregated real metrics

**Fix**:
- Fetch real data from `objectives` table for performance benchmarks
- Aggregate `attendance_records` for attendance metrics
- Calculate productivity from `time_logs`
- All queries must filter by `organization_id`

---

## Phase 2: Dashboard & Analytics Data Loading

### Issue 1: Dashboard - My Work Not Loading

**Files**: 
- `src/components/EnhancedDashboardWidgets.tsx`
- `src/components/dashboard/EmployeeDashboard.tsx`

**Current State**: Components already use real hooks (`useTasks`, `useTimeLogs`) but may have filter issues

**Verification Needed**:
1. Ensure tasks filter by `assigned_to = profile.id` for non-admins
2. Verify `organization_id` filtering in all queries
3. Add proper loading states when profile is undefined
4. Check that chart data aggregation uses real time_logs

---

### Issue 3: HR Analytics - Not Loading Organization Data

**File**: `src/components/hr/HRAnalytics.tsx`

**Current State**: This file ALREADY uses real Supabase queries (Lines 16-56) and calculates:
- Headcount from `profiles` table
- Attrition from `exit_interviews` table
- Open positions from `job_postings`

**Potential Issue**: Tables may not have data, or `exit_interviews` table may not exist

**Fix**:
1. Verify `exit_interviews` table exists in database
2. Verify `job_postings` table exists
3. Handle empty data gracefully (show "No data" instead of empty charts)
4. Add proper error boundaries

---

### Issue 4: Org Chart - Not Showing Employees

**File**: `src/components/rbac/OrgChartViewer.tsx`

**Current State**: Uses `useOrgChart()` hook which queries `profiles` with `reporting_manager_id`

**Root Cause**: Employees likely don't have `reporting_manager_id` populated

**Fix**:
1. Verify `reporting_manager_id` column exists in `profiles` table
2. Ensure employee profiles have manager assignments
3. Add empty state with helpful instructions for setting up hierarchy
4. The component already has good empty state handling (Lines 374-420)

---

## Phase 3: Action/Mutation Fixes

### Issue 7 (Part B): Attendance Regularization Actions

**File**: `src/components/workforce/AttendanceRegularization.tsx`

**Current State**: Component already has real mutations (Lines 91-172):
- `createMutation` for submitting requests
- `approveMutation` for approving
- `rejectMutation` for rejecting

**Potential Issue**: The `attendance_regularization_requests` table was recently created but may need verification

**Verification**:
1. Confirm table exists with correct schema
2. Verify RLS policies allow insert/update
3. Test approve/reject buttons

---

### Issue 23: Roles & Permissions - Create Role Not Working

**Files**: 
- `src/pages/settings/RolesPermissions.tsx`
- `src/hooks/useCustomRoles.tsx`
- `src/components/rbac/RoleEditor.tsx`

**Current State**: The role creation flow is implemented:
- `RoleEditor` has form and calls `onSave` with data
- `handleCreateRole` calls `createRole` mutation (Lines 139-148)
- `useCustomRoles` has `createRoleMutation` that inserts into `custom_roles` table

**Root Cause**: Either:
1. The mutation isn't being triggered properly
2. RLS policies blocking insert
3. Form validation failing silently

**Fix**:
1. Add proper error handling and toast messages to `createRoleMutation`
2. Debug the mutation flow in `RoleEditor.handleSubmit`
3. Verify `custom_roles` table RLS policies
4. Add loading state feedback

---

### Issue 24: Employee of the Month - Action Not Working

**File**: `src/components/recognition/EmployeeOfMonth.tsx`

**Current State**: Component already has:
- `submitNominationMutation` (Lines 159-195) that inserts into `kudos` table
- Proper form validation (Lines 197-218)
- Real queries for nominations and past winners

**Verification**: 
1. Test the nomination flow end-to-end
2. Verify `kudos` table has `badge_type` column
3. Check RLS policies for insert

---

## Phase 4: Navigation & Routing Fixes

### Issue 8: Attendance Reports - Tab Navigation

**Root Cause**: Tab value mismatch between sidebar navigation and tab registry

**Fix**:
1. Verify `GeoAttendance.tsx` tab values match those in navigation config
2. Ensure standalone routes are properly configured
3. Check that tab switching events are being dispatched correctly

---

### Issues 17-21: Projects/Kanban/Tasks/Gantt/Backlog Navigation

**Root Cause**: Routes not properly connecting between project list and project detail pages

**Fix**:
1. Verify `/projects/:id` route is correctly defined in `App.tsx`
2. Ensure project list cards/rows have proper `onClick` handlers navigating to detail page
3. Check that Kanban, Gantt, Backlog tabs within project detail work correctly
4. Verify query parameters persist across navigation

---

### Issue 22: Service Desk - Duplicated Tabs

**File**: `src/components/requests/RequestHub.tsx`

**Current State**: Looking at the file, tabs are properly defined without duplicates

**Verification**:
1. Check if there's a duplicate "Requests" entry in navigation config
2. Look for multiple tab definitions in tab-registry
3. Remove any duplicate entries in navigation groups

---

### Issue 25: Sidebar Resets on Tab Navigation

**File**: `src/components/AppSidebar.tsx`

**Current State**: Sidebar already has state persistence (Lines 138-150):
- Loads from localStorage on mount
- Saves to localStorage on toggle

**Potential Issue**: Route changes may cause component remount, losing state

**Fix**:
1. Ensure `AppSidebar` is in a stable layout component that doesn't remount
2. Move state initialization to useEffect to handle hydration
3. Add debouncing to localStorage saves

---

## Phase 5: Role-Based Features

### Issue 2A: Add Team Member - Only 5 Roles

**File**: `src/components/InternManagement.tsx`

**Current State**: Already fixed! Lines 343-350 now include all 8 roles:
- org_admin, hr_admin, project_manager, finance_manager
- manager, team_lead, employee, intern

**Status**: ALREADY FIXED - No action needed

---

### Issue 2B: Employee Card Not Showing Department

**File**: `src/components/InternManagement.tsx`

**Current State**: Query at Lines 84-91 doesn't join with departments table

**Fix**:
1. Update query to include department join:
```text
.select('*, departments:department_id(id, name, color)')
```
2. Update card display to show department badge
3. Add designation, location, joining date fields

---

### Issue 26: Role-Based Dashboards Not Working

**File**: `src/pages/dashboard/tabs/OverviewTab.tsx`

**Current State**: Already has role-based rendering (Lines 17-28):
- Returns `HRAdminDashboard` for HR admins
- Returns `FinanceManagerDashboard` for finance managers
- Returns `ProjectManagerDashboard` for project managers
- Returns `ManagerDashboard` for managers/team leads
- Returns `EnhancedDashboardWidgets` for admins
- Returns `EmployeeDashboard` for employees

**Potential Issue**: Role detection may not be working correctly

**Fix**:
1. Verify `useUserRole` hook correctly fetches and determines role
2. Check that `user_roles` table has correct data for users
3. Add debug logging to role detection
4. Ensure role-specific dashboard components have proper data fetching

---

## Phase 6: Additional Issues

### Issue 0: Card Alignment

**Files**: 
- `src/components/EnhancedDashboardWidgets.tsx`
- `src/components/AnalyticsPage.tsx`

**Current State**: Both files already use `h-full` on cards (verified in recent changes)

**Additional Fix**:
- Ensure parent grid uses `grid-auto-rows: 1fr` or equivalent
- Standardize CardContent padding across all cards
- Add `min-h-[200px]` to prevent collapse on empty state

---

### Issues 9-10: Timesheets & Overtime Filters

**Files**:
- `src/components/timesheets/TimesheetManagement.tsx`
- Overtime component (needs identification)

**Issue 9 Fix**:
1. Verify `WeeklyCalendarGrid` component is rendering properly
2. Check date filter logic in `filteredEntries` useMemo
3. Ensure week navigation buttons work correctly

**Issue 10 Fix**:
1. Add department filter to overtime query
2. Join with `profiles` to get `department_id`
3. Apply filter when `selectedDepartment !== 'all'`

---

### Issue 11: Payroll Dashboard - Not Fully Functional

**File**: `src/components/payroll/PayrollDashboard.tsx`

**Current State**: Has basic functionality with step indicator

**Missing Features**:
1. Automated calculation based on attendance (LOP deduction)
2. Salary slip PDF generation
3. Bank file generation

**Fix**:
1. Create edge function `calculate-payroll` that:
   - Fetches salary structures
   - Gets attendance records for the period
   - Calculates deductions (PF, tax, LOP)
   - Creates payroll_records
2. Add PDF generation using jspdf library
3. Add CSV export for bank transfer file

---

### Issues 12-15: Finance Module - Mock Data

**Components to Fix**:
- Reimbursements
- Investments/Tax Declarations
- Form 16
- Compliance Reports

**Fix Pattern**: Replace mock data with Supabase queries:
1. Query respective tables with organization filter
2. Implement CRUD mutations
3. Add approval workflow integration

---

## Implementation Priority Order

### Week 1 (Critical)
1. Fix DepartmentManagement, TeamManagement, LocationManagement (mock data)
2. Verify attendance regularization works
3. Debug role creation flow
4. Verify Employee of Month nomination

### Week 2 (High)
5. Enhance employee cards with department info
6. Debug HR Analytics data loading
7. Verify Org Chart hierarchy
8. Fix timesheet filtering

### Week 3 (Medium)
9. Fix project navigation flows
10. Remove duplicate service desk tabs
11. Stabilize sidebar state
12. Verify role-based dashboards

### Week 4 (Lower)
13. Enhance payroll automation
14. Fix finance module components
15. Add benchmarking real data
16. Card alignment polish

---

## Database Tables to Verify/Create

### Tables That May Need Verification:
1. `exit_interviews` - Used by HR Analytics
2. `job_postings` - Used by HR Analytics
3. `attendance_regularization_requests` - Recently created
4. `locations` - May not exist

### Columns to Verify:
1. `profiles.reporting_manager_id` - Required for Org Chart
2. `profiles.department_id` - Required for employee cards
3. `kudos.badge_type` - Used for Employee of Month

---

## Files to Modify Summary

| File | Issue | Priority |
|------|-------|----------|
| `src/components/admin/DepartmentManagement.tsx` | Mock data | High |
| `src/components/admin/TeamManagement.tsx` | Mock data | High |
| `src/components/admin/LocationManagement.tsx` | Mock data | High |
| `src/components/InternManagement.tsx` | Employee card details | Medium |
| `src/components/timesheets/TimesheetManagement.tsx` | Filtering | Medium |
| `src/components/payroll/PayrollDashboard.tsx` | Automation | Medium |
| `src/hooks/useCustomRoles.tsx` | Role creation | High |
| Navigation config files | Routing issues | Medium |
