

# TeneXA Application Structure Audit & Alignment Plan

## Executive Summary

After thorough exploration of the codebase, I've identified the current state versus your detailed specification. The application has a **solid foundation** with role-based navigation, 90+ tab components, and modular architecture. However, several gaps exist between the current implementation and your comprehensive specification.

---

## Current State Analysis

### What's Already Implemented

| Category | Status | Details |
|----------|--------|---------|
| **Multi-tenant Architecture** | Implemented | Organization isolation via `organization_id`, RLS policies |
| **Role Hierarchy (10 levels)** | Implemented | super_admin → intern with priority levels 10→4 |
| **Role-based Navigation** | Implemented | `src/config/navigation/` with 8 role-specific configs |
| **Tab Registry** | Implemented | 90+ lazy-loaded components with `allowedRoles` |
| **Header Components** | Implemented | GlobalSearch, QuickActions, OrgSwitcher |
| **Component Coverage** | ~80% | Most modules have components, some gaps |

### Component Inventory (What Exists)

**HR Components** (20 files in `src/components/hr/`):
- Onboarding, Exit, Contracts, Verification, Probation, Confirmations
- Handbook, Grievances, Disciplinary, HR Analytics
- Recruitment Pipeline, Job Postings, Interviews, Offers
- Benefits, F&F, Gratuity, Career Paths, Succession, Benchmarking

**Finance Components** (11 files in `src/components/finance/`):
- Payroll, Tax, Salary Structure, Salary Revisions, Bonus
- Reimbursements, Compliance, Form 16, Investments
- Budget Planning, Cost Centers

**Workforce Components** (22 files in `src/components/workforce/`):
- Attendance, Leave, Shifts, WFH, Holidays

**Work Management** (16 files in `src/components/work/`):
- Dependencies, Milestones, Risks, Issues, Overtime
- Project/Task Templates, Recurring Tasks, Meeting Notes
- Decisions, Lessons Learned, Work Calendars

**Performance** (4 files in `src/components/performance/`):
- OKRs, Feedback, 1:1 Meetings, PIPs

---

## Gap Analysis: Your Specification vs Current Implementation

### Priority 1: Critical Gaps (Missing Functionality)

| Specified Module | Current Status | Issue |
|------------------|----------------|-------|
| **Employee Profile Page Tabs** | Partial | Missing unified profile with all 11 tabs (Overview, Personal, Employment, Documents, Performance, Attendance, Leaves, Payroll, Assets, Training, History) |
| **Project Detail Page Tabs** | Partial | Missing full 9-tab structure (Overview, Team, Tasks, Sprints, Timeline, Files, Budget, Reports, Settings) |
| **Regularization Requests** | Missing | Attendance regularization workflow not in tab registry |
| **Biometric Integration** | Missing | No component for biometric attendance |
| **Shift Coverage** | Missing | Coverage management not in navigation |
| **Employee Analytics** | Exists | `hr-analytics` tab exists but not in employee sidebar section |
| **Bulk Import/Export** | Partial | Some modules have it, not standardized |

### Priority 2: Navigation Structure Gaps

**Current Navigation Issues:**

1. **Admin Sidebar Too Flat**: Your spec shows hierarchical grouping (e.g., HR Management → Employees → All Employees, Add Employee, Employee Lifecycle, etc.). Current sidebar groups items without sub-levels.

2. **Missing Navigation Groups**:
   - "Employee Lifecycle" sub-group (Onboarding, Probation, Confirmations, Notice, Exit)
   - "Benefits & Compensation" as separate group
   - "Calendar & Events" main group
   - "Organization Settings" with full sub-items

3. **Feature Links in Header**: All feature dropdown items link to `/features` without hash anchors to auto-select the tab.

### Priority 3: Quick Actions Gaps

**Your Specification**:
```
For All Employees:
• Check In/Check Out    ← MISSING
• Log Time              ✓ Exists
• Create Task           ✓ Exists
• Apply Leave           ✓ Exists
• Submit Expense        ✓ Exists
• Schedule Meeting      ← MISSING
• Send Message          ← MISSING

For Managers:
• Approve Leaves        ✓ Exists
• Approve Expenses      ← MISSING (no action)
• View Team             ← MISSING

For HR Admin:
• Add Employee          ✓ Exists
• Process Payroll       ✓ Exists

For PM:
• Create Project        ✓ Exists
• Start Sprint          ✓ Exists
```

### Priority 4: Missing Standalone Pages/Routes

Your spec includes these flows that should be dedicated pages:

| Route | Current Status | Action Needed |
|-------|----------------|---------------|
| `/calendar` | Missing | Calendar standalone page |
| `/inbox` | Missing | Unified inbox for messages |
| `/help` | Missing | Help center page |
| `/admin/audit-logs` | Partial | In super-admin only |

---

## Detailed Implementation Plan

### Phase 1: Fix Features Page Navigation (Quick Win)

**Problem**: Feature dropdown links all go to `/features` without tab selection.

**Files to modify:**
- `src/components/public/PublicHeader.tsx`
- `src/pages/Features.tsx`

**Changes:**
```typescript
// PublicHeader.tsx - Add hash anchors
{ name: 'HR Management', href: '/features#hr', ... }
{ name: 'Attendance & Time', href: '/features#attendance', ... }
{ name: 'Project Management', href: '/features#projects', ... }
// etc.

// Features.tsx - Parse hash on mount
useEffect(() => {
  const hash = window.location.hash.replace('#', '');
  if (hash && featureTabs.some(t => t.id === hash)) {
    setActiveTab(hash);
  }
}, []);
```

---

### Phase 2: Restructure Navigation Groups

**Goal**: Align navigation with your specification's hierarchical structure.

**Files to modify:**
- `src/config/navigation/admin-groups.ts`
- `src/config/navigation/hr-groups.ts`
- `src/config/navigation/pm-groups.ts`
- `src/config/navigation/employee-groups.ts`
- `src/config/navigation/manager-groups.ts`
- `src/config/navigation/finance-groups.ts`

**Key restructuring:**

```typescript
// Example: HR Admin restructure (hr-groups.ts)
{
  label: "Employees",
  icon: Users,
  items: [
    { title: "All Employees", url: "interns" },
    { title: "Add Employee", url: "add-employee" },
    { title: "Employee Lifecycle", url: "lifecycle" },
    { title: "Bulk Import", url: "bulk-import" },
    { title: "Analytics", url: "hr-analytics" },
  ]
},
{
  label: "Organization",
  icon: Building2,
  items: [
    { title: "Org Chart", url: "org-chart", standalone: true },
    { title: "Departments", url: "departments" },
    { title: "Teams", url: "teams" },
    { title: "Locations", url: "locations" },
  ]
},
```

---

### Phase 3: Add Missing Quick Actions

**File to modify:** `src/components/navigation/QuickActionsDropdown.tsx`

**Add these actions:**
```typescript
// Check In/Out (for all employees)
{
  id: 'check-in',
  label: 'Check In/Out',
  icon: MapPin,
  action: () => navigate('/dashboard?tab=attendance&action=clock'),
},
// Schedule Meeting
{
  id: 'schedule-meeting',
  label: 'Schedule Meeting',
  icon: Calendar,
  action: () => navigate('/dashboard?tab=meetings&action=new'),
},
// Approve Expenses (for managers)
{
  id: 'approve-expenses',
  label: 'Approve Expenses',
  icon: Receipt,
  action: () => navigate('/dashboard?tab=expenses&filter=pending'),
  roles: ['admin', 'org_admin', 'super_admin', 'finance_manager', 'manager'],
},
// View Team (for managers)
{
  id: 'view-team',
  label: 'View Team',
  icon: Users2,
  action: () => navigate('/dashboard?tab=interns&filter=my-team'),
  roles: ['manager', 'team_lead', 'hr_admin', 'admin', 'org_admin', 'super_admin'],
},
```

---

### Phase 4: Add Missing Tab Registry Entries

**File to modify:** `src/pages/dashboard/tab-registry.ts`

**Missing tabs to add:**
```typescript
// Calendar & Events
'calendar': {
  component: lazy(() => import('@/components/OrganizationCalendar').then(m => ({ default: m.OrganizationCalendar }))),
},

// Departments management
'departments': {
  component: lazy(() => import('@/components/admin/DepartmentManagement').then(m => ({ default: m.DepartmentManagement }))),
  adminOnly: true,
  allowedRoles: ['super_admin', 'org_admin', 'admin', 'hr_admin'],
},

// Teams management
'teams': {
  component: lazy(() => import('@/components/admin/TeamManagement').then(m => ({ default: m.TeamManagement }))),
  adminOnly: true,
},

// Locations/branches
'locations': {
  component: lazy(() => import('@/components/admin/LocationManagement').then(m => ({ default: m.LocationManagement }))),
  adminOnly: true,
},

// Platform monitoring (super admin)
'monitoring': {
  component: lazy(() => import('@/components/super-admin/SystemMonitoring').then(m => ({ default: m.SystemMonitoring }))),
  allowedRoles: ['super_admin'],
},

// Organizations management (super admin)
'organizations': {
  component: lazy(() => import('@/components/super-admin/OrganizationsTab').then(m => ({ default: m.OrganizationsTab }))),
  allowedRoles: ['super_admin'],
},
```

---

### Phase 5: Create Missing Components

**New components needed:**

| Component | Path | Purpose |
|-----------|------|---------|
| `DepartmentManagement` | `src/components/admin/` | CRUD for departments |
| `TeamManagement` | `src/components/admin/` | CRUD for teams |
| `LocationManagement` | `src/components/admin/` | Branch/location management |
| `AttendanceRegularization` | `src/components/workforce/` | Regularization requests |
| `BulkImportExport` | `src/components/hr/` | Standardized bulk operations |
| `OrganizationsTab` | `src/components/super-admin/` | Inline org management |
| `SystemMonitoring` | `src/components/super-admin/` | System health in dashboard |

---

### Phase 6: Typography Application

**Apply the existing fluid typography system to:**

1. **AppSidebar** - Use `text-sidebar` class for menu items
2. **Table components** - Use `text-table-header` and `text-table-cell`
3. **Dashboard cards** - Use fluid heading classes

**Files to modify:**
- `src/components/AppSidebar.tsx`
- `src/components/ui/table.tsx`
- Various dashboard widgets

---

## Implementation Priority Order

1. **Phase 1**: Features page hash navigation (30 min)
2. **Phase 3**: Quick Actions additions (45 min)
3. **Phase 4**: Tab registry additions (1 hour)
4. **Phase 2**: Navigation restructuring (2 hours)
5. **Phase 5**: Missing components (4-6 hours)
6. **Phase 6**: Typography application (1 hour)

---

## Data Flow Verification Checklist

Based on your specification, these cross-module flows need verification:

| Flow | Status | Notes |
|------|--------|-------|
| Attendance → Payroll | Needs check | Hours worked → salary calculation |
| Leave → Attendance | Implemented | Auto-marks dates as "on leave" |
| Leave → Capacity | Needs check | Should reduce availability |
| Time Logs → Capacity | Implemented | Hours logged reduce capacity |
| Tasks → Time Logs | Implemented | Time logged per task |
| Recruitment → Onboarding | Needs check | Hired candidate → employee creation |
| Performance → Payroll | Needs check | Increment/bonus → salary update |

---

## Summary of Files to Change

| Priority | File | Changes |
|----------|------|---------|
| P0 | `src/components/public/PublicHeader.tsx` | Add hash anchors to feature links |
| P0 | `src/pages/Features.tsx` | Parse URL hash to select tab |
| P1 | `src/components/navigation/QuickActionsDropdown.tsx` | Add 4 missing quick actions |
| P1 | `src/pages/dashboard/tab-registry.ts` | Add ~6 missing tab entries |
| P2 | `src/config/navigation/*.ts` | Restructure groups per spec |
| P3 | `src/components/AppSidebar.tsx` | Apply typography classes |
| P3 | `src/components/ui/table.tsx` | Apply fluid table typography |
| P4 | New: `src/components/admin/DepartmentManagement.tsx` | Create component |
| P4 | New: `src/components/admin/TeamManagement.tsx` | Create component |
| P4 | New: `src/components/admin/LocationManagement.tsx` | Create component |

