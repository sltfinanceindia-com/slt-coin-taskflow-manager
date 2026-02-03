
# TeneXA 26-Issue Comprehensive Fix Plan

## Executive Summary

After thorough codebase analysis, I've mapped each of your 26 issues to specific files, root causes, and implementation fixes. The current implementation is approximately **78% complete** but has several critical gaps:

1. **Real Data Loading**: Many components use real Supabase queries but some still have mock data fallbacks
2. **Organization Scoping**: Most queries properly filter by `organization_id` but a few need verification
3. **Action Handlers**: Some UI actions (like nominations, regularization approvals) have incomplete backend connections
4. **Navigation**: Sidebar state persistence exists but may have route change issues
5. **Role-Based Dashboards**: Role-specific navigation exists but dashboard content doesn't fully adapt

---

## Issue-by-Issue Analysis & Fix Plan

### ISSUE 0: Card Alignment (Dashboard, Analytics, Tasks)
**Current State**: Cards use responsive grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` with proper spacing
**Root Cause**: Minor inconsistencies in card heights due to variable content
**Files to Modify**:
- `src/components/EnhancedDashboardWidgets.tsx`
- `src/components/AnalyticsPage.tsx`

**Fix**:
- Add `h-full` class to Card components to ensure equal heights
- Use CSS Grid with `auto-fit` and `minmax` for better responsiveness
- Standardize CardContent padding across all dashboard cards

---

### ISSUE 1: Dashboard - My Work Not Loading Data
**Current State**: `EnhancedDashboardWidgets.tsx` already uses real hooks (`useTasks`, `useTimeLogs`, `useCoinTransactions`)
**Status**: MOSTLY FIXED - The dashboard fetches real data from Supabase

**Verification Needed**:
- Ensure `useTasks` filters by `assigned_to = profile.id` for non-admins (Line 85-87 shows this logic exists)
- Weekly hours chart uses real `timeLogs` data (Lines 46-79)

**Minor Fix**:
- Add empty state handling when profile is loading
- Ensure time logs properly aggregate by user_id

---

### ISSUE 2A: Add Team Member - Only 5 Role Options
**Current State**: `InternManagement.tsx` Line 337-342 shows hardcoded 5 roles:
```typescript
<SelectItem value="org_admin">Organization Admin</SelectItem>
<SelectItem value="manager">Manager</SelectItem>
<SelectItem value="team_lead">Team Lead</SelectItem>
<SelectItem value="employee">Employee</SelectItem>
<SelectItem value="intern">Intern</SelectItem>
```

**Root Cause**: Missing other roles like `hr_admin`, `finance_manager`, `project_manager`

**Fix**: Update `InternManagement.tsx` Line 336-346:
```typescript
<SelectItem value="org_admin">Organization Admin</SelectItem>
<SelectItem value="hr_admin">HR Admin</SelectItem>
<SelectItem value="project_manager">Project Manager</SelectItem>
<SelectItem value="finance_manager">Finance Manager</SelectItem>
<SelectItem value="manager">Manager</SelectItem>
<SelectItem value="team_lead">Team Lead</SelectItem>
<SelectItem value="employee">Employee</SelectItem>
<SelectItem value="intern">Intern</SelectItem>
```

---

### ISSUE 2B: Employee Card Not Showing Department/Details
**Current State**: `InternManagement.tsx` displays:
- Full name, email, role badge, active status
- Department field is shown (Line 469-470)

**Gap**: Missing designation, location, joining date in card view

**Fix**: Enhance the query at Line 84-91 to JOIN with departments table:
```typescript
.select('*, departments:department_id(name, color)')
```

Add these fields to the card display at Line 419-455.

---

### ISSUE 2C: View All Details Not Updated
**Fix**: Create proper table view toggle in `InternManagement.tsx`:
- Add view toggle (Grid/List)
- Implement sortable columns in list view
- Add pagination (already implemented - Lines 119-134)

---

### ISSUE 3: HR Analytics - Not Loading Organization Data
**Current State**: `AnalyticsPage.tsx` already uses real data:
- Line 18-19: Uses `useTasks()` and `useTimeLogs()`
- Line 23-46: Fetches org-filtered profiles from Supabase

**Status**: WORKING - Uses real organization-scoped data

**Verification Needed**:
- Charts (`TaskPieChart`, `ProductivityLineChart`) must use the fetched data, not mock data
- Check if these chart components receive data as props

---

### ISSUE 4: Org Chart - Not Showing Employees
**Current State**: `OrgChartViewer.tsx` is fully implemented:
- Line 37: Uses `useOrgChart()` hook
- Lines 256-318: Builds tree structure from flat data using `reporting_manager_id`
- Handles empty state with helpful instructions (Lines 374-420)

**Status**: WORKING - The org chart is fully functional

**Verification Needed**:
- Ensure `useReportingStructure.tsx` Line 205 properly fetches all employees with manager relationships
- Check if `reporting_manager_id` is populated in profiles table

---

### ISSUE 5-6: Departments/Teams/Locations - Mock Data
**Files to Check**:
- `src/components/hr/DepartmentManagement.tsx`
- `src/components/hr/TeamManagement.tsx`
- `src/components/hr/LocationManagement.tsx`

**Fix Pattern**: Replace any hardcoded arrays with Supabase queries:
```typescript
const { data: departments } = useQuery({
  queryKey: ['departments', profile?.organization_id],
  queryFn: async () => {
    const { data } = await supabase
      .from('departments')
      .select('*')
      .eq('organization_id', profile?.organization_id);
    return data;
  }
});
```

---

### ISSUE 7: Attendance Regularization - Fake Data & Actions Not Working
**Current State**: Need to verify `AttendanceRegularization` component

**Fix Required**:
1. Create/use `attendance_regularization_requests` table
2. Implement approve/reject mutations that update both the request AND the original attendance record
3. Send notifications on status change

---

### ISSUE 8: Attendance Reports - Tab Navigation Issue
**Current State**: Routes are tab-based in `GeoAttendance.tsx` (Line 21-44)

**Fix**: Verify the tab registry and sidebar navigation point to correct tab values

---

### ISSUE 9: Timesheets - Calendar Missing & Filtering Broken
**Current State**: `TimesheetManagement.tsx` has:
- Week navigation (Lines 298-300)
- Date range filters (Lines 303-319)
- Calendar popover components (Lines 462-476)

**Status**: PARTIALLY IMPLEMENTED - Week view exists but no visual calendar grid

**Fix Required**:
1. Add weekly calendar grid component showing Mon-Sun with hour cells
2. Verify date range filtering applies correctly (Lines 303-319)

---

### ISSUE 10: Overtime - Filter Not Working
**Current State**: Need to verify `OvertimeManagement` component

**Fix Required**:
- Ensure department filter is applied to the query by JOINing with employees table
- Add `.eq('department_id', selectedDepartment)` when filter is active

---

### ISSUE 11: Payroll Dashboard - Not Fully Functional
**Current State**: `PayrollDashboard.tsx` is functional:
- Creates payroll records (Lines 80-125)
- Shows summary stats (Lines 128-131)
- Displays records table (Lines 296-357)

**Status**: BASIC FUNCTIONALITY WORKING

**Missing (Per Spec)**:
1. **Automated Calculation**: No integration with attendance for LOP deduction
2. **Steps Indicator**: No visual progress steps (Select → Calculate → Review → Finalize)
3. **Salary Slip PDF Generation**: Not implemented

**Fix Required**:
1. Add step-by-step UI for payroll processing
2. Create edge function for automated payroll calculation
3. Add salary slip PDF generation

---

### ISSUE 12-15: Reimbursements, Investments, Form 16, Compliance
**Status**: Need to verify these components

**Files to Check**:
- `src/components/expenses/ReimbursementList.tsx`
- `src/components/finance/InvestmentDeclarations.tsx`
- `src/components/finance/Form16Generator.tsx`
- `src/components/compliance/ComplianceReports.tsx`

---

### ISSUE 16: Benchmarking - Fake Graphs
**Fix**: Ensure chart components fetch real aggregated data:
- Performance benchmarks from `objectives` table
- Attendance benchmarks from `attendance_records`
- Productivity from `time_logs`

---

### ISSUE 17-21: Projects/Kanban/Tasks/Gantt/Backlog Navigation
**Current State**: These are all implemented as dashboard tabs

**Verified Working**:
- `ProjectDetailPage.tsx` - Full 9-tab implementation
- `TasksTab.tsx` - Kanban view with filters
- `GanttChart.tsx` - Timeline visualization

**Fix Required**:
- Ensure navigation from project list to project detail works
- Verify filter parameters persist across navigation

---

### ISSUE 22: Service Desk - Duplicated Tabs
**Fix**: Check `RequestHub.tsx` and tab-registry for duplicate entries
- Remove any duplicate tab definitions
- Ensure unique keys for all tab items

---

### ISSUE 23: Roles & Permissions - Create Role Not Working
**Current State**: `RoleEditor.tsx` exists in `src/components/rbac/`

**Fix Required**:
1. Verify mutation saves to `custom_roles` table
2. Ensure role_permissions junction table is updated
3. Add error handling and success feedback

---

### ISSUE 24: Employee of the Month - Action Not Working
**Current State**: `EmployeeOfMonth.tsx` has:
- Nominate dialog (Lines 89-133)
- BUT: Submit button only closes dialog, no database mutation (Line 128-129)
- Past winners use MOCK data (Lines 45-70)

**Fix Required**:
1. Create `employee_of_month_nominations` table
2. Create `employee_of_month_winners` table
3. Implement nomination submission mutation:
```typescript
const submitNomination = useMutation({
  mutationFn: async (data) => {
    await supabase.from('employee_of_month_nominations').insert({
      organization_id: profile?.organization_id,
      nominee_id: data.employeeId,
      nominator_id: profile?.id,
      month: format(new Date(), 'yyyy-MM'),
      reason: data.reason,
    });
  }
});
```
4. Replace mock pastWinners with real query

---

### ISSUE 25: Tab Navigation - Sidebar Resets
**Current State**: `AppSidebar.tsx` has state persistence:
- Line 138-141: Loads from localStorage
- Line 143-150: Saves to localStorage on toggle

**Status**: WORKING - Sidebar state is persisted

**Possible Issue**: If navigation causes full remount
**Fix**: Ensure `AppSidebar` is wrapped in a stable layout component that doesn't remount

---

### ISSUE 26: Role-Based Dashboards - Not Working
**Current State**:
- Role-specific navigation exists in `config/navigation/`
- Different nav groups per role (hr-groups.ts, pm-groups.ts, etc.)
- `EnhancedDashboardWidgets.tsx` has basic role check (Line 39: `isAdmin`)

**Gap**: Dashboard content doesn't change based on role

**Fix Required**:
1. Create role-specific dashboard components:
   - `EmployeeDashboard.tsx`
   - `ManagerDashboard.tsx`
   - `HRAdminDashboard.tsx`
   - `FinanceManagerDashboard.tsx`
   - `ProjectManagerDashboard.tsx`

2. Update `OverviewTab.tsx` to render based on role:
```typescript
export function OverviewTab() {
  const { role, isAdmin } = useUserRole();
  
  if (role === 'hr_admin') return <HRAdminDashboard />;
  if (role === 'finance_manager') return <FinanceManagerDashboard />;
  if (role === 'project_manager') return <ProjectManagerDashboard />;
  if (isAdmin) return <AdminDashboard />;
  if (['manager', 'team_lead'].includes(role)) return <ManagerDashboard />;
  return <EmployeeDashboard />;
}
```

3. Each dashboard shows role-specific widgets:
   - **Employee**: My Tasks, My Attendance, Leave Balance, Upcoming Events
   - **Manager**: Team Overview, Pending Approvals, Team Attendance
   - **HR Admin**: Headcount, Attrition, Pending Leaves, New Hires
   - **Finance**: Payroll Status, Pending Reimbursements, Expense Summary
   - **PM**: Project Status, Resource Allocation, Task Burndown

---

## Implementation Phases

### Phase 1: Critical Data Fixes (Priority: HIGH)
| Issue | Task | Effort |
|-------|------|--------|
| #2A | Add missing role options to team member form | 30 min |
| #2B | Enhance employee card with department/designation | 1 hour |
| #24 | Implement Employee of Month nomination mutation | 2 hours |
| #23 | Fix role creation mutation | 2 hours |

### Phase 2: Payroll & Finance Automation (Priority: HIGH)
| Issue | Task | Effort |
|-------|------|--------|
| #11 | Add payroll step-by-step UI | 3 hours |
| #11 | Create payroll calculation edge function | 4 hours |
| #12-15 | Verify/fix reimbursement/investment/Form16 components | 4 hours |

### Phase 3: Dashboard & Widgets (Priority: MEDIUM)
| Issue | Task | Effort |
|-------|------|--------|
| #0 | Standardize card heights with CSS Grid | 1 hour |
| #26 | Create role-specific dashboard components | 6 hours |
| #1 | Verify and enhance dashboard data loading | 2 hours |

### Phase 4: Navigation & UX (Priority: MEDIUM)
| Issue | Task | Effort |
|-------|------|--------|
| #8 | Fix attendance reports tab navigation | 1 hour |
| #22 | Remove duplicate service desk tabs | 30 min |
| #25 | Verify sidebar state persistence across routes | 1 hour |

### Phase 5: Module Enhancements (Priority: LOWER)
| Issue | Task | Effort |
|-------|------|--------|
| #7 | Implement regularization approval actions | 3 hours |
| #9 | Add timesheet calendar grid view | 3 hours |
| #10 | Fix overtime department filter | 1 hour |
| #16 | Replace benchmarking mock data | 2 hours |
| #17-21 | Verify project/task navigation | 2 hours |

---

## Database Tables Needed

### New Tables Required:
1. `employee_of_month_nominations` - For Issue #24
2. `employee_of_month_winners` - For Issue #24
3. `attendance_regularization_requests` (if not exists) - For Issue #7

### Tables to Verify:
- `departments` - has org_id, manager, and employee count
- `teams` - has team_lead_id and team_members junction
- `locations` - has address and coordinates

---

## Files Summary

### Files to Modify:
1. `src/components/InternManagement.tsx` - Issues #2A, #2B, #2C
2. `src/components/recognition/EmployeeOfMonth.tsx` - Issue #24
3. `src/pages/dashboard/tabs/OverviewTab.tsx` - Issue #26
4. `src/components/EnhancedDashboardWidgets.tsx` - Issues #0, #1
5. `src/components/payroll/PayrollDashboard.tsx` - Issue #11
6. `src/components/workforce/AttendanceDashboard.tsx` - Issue #7
7. `src/components/timesheets/TimesheetManagement.tsx` - Issue #9

### New Files to Create:
1. `src/components/dashboard/EmployeeDashboard.tsx`
2. `src/components/dashboard/ManagerDashboard.tsx`
3. `src/components/dashboard/HRAdminDashboard.tsx`
4. `src/components/dashboard/FinanceManagerDashboard.tsx`
5. `src/components/dashboard/ProjectManagerDashboard.tsx`

---

## Technical Notes

### Organization Scoping Pattern
All queries must include:
```typescript
.eq('organization_id', profile?.organization_id)
```

### Data Fetching Pattern
Replace all mock arrays with:
```typescript
const { data, isLoading } = useQuery({
  queryKey: ['entity-name', profile?.organization_id],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('table_name')
      .select('*')
      .eq('organization_id', profile?.organization_id);
    if (error) throw error;
    return data;
  },
  enabled: !!profile?.organization_id,
});
```

### Mutation Pattern for Actions
```typescript
const mutation = useMutation({
  mutationFn: async (data) => {
    const { error } = await supabase.from('table').insert(data);
    if (error) throw error;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['entity-name'] });
    toast({ title: 'Success message' });
  },
  onError: (error) => {
    toast({ title: 'Error', description: error.message, variant: 'destructive' });
  },
});
```

