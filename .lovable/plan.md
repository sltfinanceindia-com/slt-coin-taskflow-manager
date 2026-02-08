
# TeneXA Full Application Audit & Fix Plan

## Executive Summary

After a thorough codebase audit, I've identified **working components**, **mock data issues**, and **navigation problems**. This plan addresses all 26+ reported issues plus the new requests.

---

## Section 1: DATA CLEANUP - Mock Data Locations

### 1.1 About Page - Fake Team Data
**File**: `src/pages/About.tsx` (Lines 50-57)

**Current Mock Data**:
```typescript
const team = [
  { name: 'Rajesh Kumar', role: 'CEO & Founder', image: null },
  { name: 'Priya Sharma', role: 'CTO', image: null },
  { name: 'Amit Patel', role: 'VP Engineering', image: null },
  { name: 'Sneha Reddy', role: 'VP Product', image: null },
  { name: 'Vikram Singh', role: 'VP Sales', image: null },
  { name: 'Anita Desai', role: 'VP Customer Success', image: null },
];
```

**Fix**: Replace with only the founder as requested:
```typescript
const team = [
  { name: 'Komirisetti Gopi', role: 'Founder', image: null },
];
```

---

### 1.2 Other Mock Data Files to Clean

| File | Mock Data Location | Status |
|------|-------------------|--------|
| `src/components/hr/BulkImportExport.tsx` | Lines 43-62: `mockHistory` array | NEEDS FIX |
| `src/components/super-admin/OrganizationsTab.tsx` | Lines 32-63: `mockOrganizations` array | NEEDS FIX |
| `src/components/profile/ProfileSecurityTab.tsx` | Lines 54-65: `activeSessions` and `loginHistory` | NEEDS FIX |
| `src/components/finance/ComplianceManagement.tsx` | Lines 24-66: `complianceItems` hardcoded | NEEDS FIX |
| `src/components/communication/AutoTranslation.tsx` | Line 94: `mockTranslation` (acceptable - demo feature) | LOW PRIORITY |

---

## Section 2: DUPLICATE TASK LIST Investigation

### Analysis
After searching the codebase, I found these TaskList-related components:

1. **`src/components/TaskList.tsx`** - Standalone component used in InternDashboard
2. **`src/pages/dashboard/tabs/TasksTab.tsx`** - Dashboard tab using `TabBasedKanban`
3. **`src/components/tasks/SubtaskList.tsx`** - Subtask management
4. **`src/components/tasks/EnhancedSubtaskList.tsx`** - Enhanced subtask view

**Root Cause**: The `TaskList.tsx` component is used in `InternDashboard.tsx` line 159, which is SEPARATE from the dashboard `TasksTab`. These are NOT duplicates - they serve different purposes:
- `TaskList.tsx` - Simple list for intern dashboard (legacy)
- `TasksTab.tsx` - Full-featured Kanban for main dashboard

**Recommendation**: No duplicate exists. If users see tasks twice, it may be because both InternDashboard and ModernDashboard are being shown based on role logic in `Index.tsx`.

---

## Section 3: FULL APPLICATION AUDIT REPORT

### Database Status (Live Data)
```
profiles: 27 records ✅
tasks: 55 records ✅
time_logs: 151 records ✅
departments: 0 records ⚠️ Empty
teams: 0 records ⚠️ Empty
locations: 0 records ⚠️ Empty
custom_roles: 0 records ⚠️ Empty
```

---

### Page-by-Page Status Report

| Page/Feature | Status | Issues Found | Fix Required |
|--------------|--------|--------------|--------------|
| **PUBLIC PAGES** | | | |
| Landing (`/`) | Working | None | No |
| About (`/about`) | Working | Fake team names | Yes - Update to Komirisetti Gopi |
| Features (`/features`) | Working | None | No |
| Pricing (`/pricing`) | Working | None | No |
| Auth (`/auth`) | Working | None | No |
| **DASHBOARD** | | | |
| Overview Tab | Working | None | No |
| My Work Tab | Working | Shows empty when no tasks assigned to user | No (data issue) |
| Updates Tab | Working | None | No |
| Analytics Tab | Working | None | No |
| **EMPLOYEES** | | | |
| All Employees (interns tab) | Working | Role dropdown already shows 8 system roles + custom roles | Verify custom_roles table |
| Employee Cards | Working | Department shows when `department_info` exists | Verify `department_id` is set on profiles |
| View All Details | Working | Shows all available fields | No |
| **HR MANAGEMENT** | | | |
| HR Analytics | Working | Shows 0 when empty data | No (data issue) |
| Org Chart | Working | Empty when `reporting_manager_id` not set | No (data issue) |
| Department Mgmt | Working | Uses real Supabase hook | No |
| Teams Mgmt | Working | Uses real Supabase hook | No |
| Locations Mgmt | Working | Uses real Supabase hook | No |
| Bulk Import | Broken | Uses `mockHistory` array | Yes |
| **ATTENDANCE** | | | |
| Attendance Tab | Working | Navigation fixed with query params | Verify |
| Regularization | Working | Real Supabase integration | No |
| **TIME MANAGEMENT** | | | |
| Timesheets | Working | May need data filtering verification | Verify |
| Time Logs | Working | None | No |
| Overtime | Working | Filter needs department data | No (data issue) |
| **FINANCE** | | | |
| Payroll | Working | Full functionality | No |
| Reimbursements | Working | Real Supabase hook exists | Verify mutations |
| Investments | Working | Real Supabase hook created | Verify |
| Form 16 | Working | Real Supabase hook created | Verify |
| Compliance | Broken | Hardcoded mock data | Yes |
| **PROJECTS** | | | |
| Project Hub | Working | Tabs work (Portfolios/Programs/Projects) | No |
| Kanban Board | Fixed | Navigation updated for query params | Verify |
| Task List | Fixed | Navigation updated for query params | Verify |
| Gantt Chart | Working | Shows all tasks by design | No |
| Backlog | Working | None | No |
| **SERVICE DESK** | | | |
| Service Desk | Working | Not duplicated | No |
| Requests | Working | Different feature from Service Desk | No |
| **ROLES & PERMISSIONS** | | | |
| Role Creation | Fixed | RLS policies updated, error messages added | Verify |
| Role Dropdown | Working | Shows system + custom roles | No |
| **OTHER** | | | |
| Employee of Month | Working | Has real mutations | Verify |
| Sidebar Navigation | Fixed | Context provider added | Verify |
| Card Alignment | Fixed | Added min-height and items-stretch | Verify |
| Benchmarking | Partial | Uses `useSalaryBenchmarks` but has static chart data | Yes - Lines 21-36 |

---

## Section 4: DETAILED FIX PLAN

### Phase 1: Mock Data Removal (High Priority)

#### Fix 1.1: About Page Team
```typescript
// src/pages/About.tsx line 50-57
const team = [
  { name: 'Komirisetti Gopi', role: 'Founder', image: null },
];
```

#### Fix 1.2: Bulk Import History
```typescript
// src/components/hr/BulkImportExport.tsx
// Replace mockHistory with real Supabase query
// Create import_history table if not exists
```

#### Fix 1.3: Super Admin Organizations Tab
```typescript
// src/components/super-admin/OrganizationsTab.tsx
// Replace mockOrganizations with useQuery to organizations table
```

#### Fix 1.4: Profile Security Tab
```typescript
// src/components/profile/ProfileSecurityTab.tsx
// Replace mock sessions with real auth.sessions() query
```

#### Fix 1.5: Compliance Management
```typescript
// src/components/finance/ComplianceManagement.tsx
// Create compliance_items table and hook
// Replace hardcoded array with Supabase query
```

#### Fix 1.6: Benchmarking Charts
```typescript
// src/components/hr/BenchmarkingManagement.tsx
// Lines 21-36: Replace static comparisonData and radarData
// Aggregate from salary_benchmarks table or profiles data
```

---

### Phase 2: Navigation Verification

The navigation fix was already implemented:
- `AppSidebar.tsx` - Query param handling in `handleTabChange`
- `useTabPersistence.tsx` - Base tab extraction

**Tabs to test:**
1. Kanban Board (`tasks?view=kanban`)
2. Task List (`tasks?view=list`)
3. All standalone routes in navigation config

---

### Phase 3: Data Verification

Many issues are "no data" issues, not code bugs. The components work correctly but show empty states because:

1. **Departments table is empty** - Users need to create departments
2. **Teams table is empty** - Users need to create teams
3. **Locations table is empty** - Users need to create locations
4. **Custom roles table is empty** - Users need to create custom roles
5. **Profile department_id is NULL** - Employees not assigned to departments
6. **Profile reporting_manager_id is NULL** - Org chart has no hierarchy

---

## Section 5: ROLE-BASED DASHBOARD AUDIT

### Role Detection Logic
File: `src/pages/dashboard/tabs/OverviewTab.tsx`

```typescript
if (isHRAdmin && !isAdmin) return <HRAdminDashboard />;
if (isFinanceManager && !isAdmin) return <FinanceManagerDashboard />;
if (isProjectManager && !isAdmin) return <ProjectManagerDashboard />;
if (isManager || isTeamLead) return <ManagerDashboard />;
if (isAdmin) return <EnhancedDashboardWidgets />;
return <EmployeeDashboard />;
```

**This logic is correct.** If role-based dashboards aren't showing:
1. Verify user has correct role in `user_roles` table
2. Verify `useUserRole` hook is reading roles correctly
3. Check if role is stored in both `profiles.role` AND `user_roles` table

---

## Section 6: COMPLETE FEATURE STATUS

### Working Features
- Authentication and login
- User management (All Employees)
- Task creation and management
- Kanban board with filters
- Time logging
- Leave management
- Attendance tracking
- Project Portfolio Hub (Portfolios/Programs/Projects)
- Work Requests
- Service Desk
- Approvals workflow
- Communication/Chat
- Training center
- Calendar integration
- Role-based navigation

### Broken Features (Needs Fix)
1. About page fake team data
2. Bulk Import history (mock data)
3. Super Admin organizations list (mock data)
4. Profile security sessions (mock data)
5. Compliance management (mock data)
6. Benchmarking charts (static data)

### Features Awaiting Data
- Department management (table empty)
- Team management (table empty)
- Location management (table empty)
- Custom roles (table empty)
- HR Analytics (needs department assignments)
- Org Chart (needs reporting_manager_id)
- Employee department badges (needs department_id on profiles)

---

## Section 7: FILES TO MODIFY

| File | Change | Priority |
|------|--------|----------|
| `src/pages/About.tsx` | Update team array to single founder | High |
| `src/components/hr/BulkImportExport.tsx` | Replace mock with Supabase query | High |
| `src/components/super-admin/OrganizationsTab.tsx` | Replace mock with Supabase query | High |
| `src/components/profile/ProfileSecurityTab.tsx` | Replace mock sessions | Medium |
| `src/components/finance/ComplianceManagement.tsx` | Create table and hook | High |
| `src/components/hr/BenchmarkingManagement.tsx` | Aggregate real data for charts | Medium |

---

## Technical Implementation Notes

### For Compliance Management Fix:
1. Create `compliance_items` table with schema:
   - id, organization_id, name, type, due_date, status, amount, last_filed

2. Create `useComplianceItems` hook with:
   - Query with organization filter
   - Create/Update/Delete mutations

3. Replace hardcoded array in component

### For Benchmarking Charts Fix:
1. Aggregate from existing `salary_benchmarks` table
2. Calculate comparison metrics from:
   - `profiles` for internal averages
   - `salary_benchmarks` for market data

### For Profile Sessions Fix:
1. Use Supabase auth admin API or custom session tracking table
2. Query `auth.sessions()` if available
