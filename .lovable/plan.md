
# TeneXA Complete Multi-Tenant Architecture Implementation Plan

## ✅ IMPLEMENTATION STATUS: COMPLETE

All 8 phases have been implemented successfully.

---

## Executive Summary

This plan implements a comprehensive multi-tenant architecture for TeneXA with 7-tier role hierarchy, granular module-based permissions, role-specific sidebar navigation, and complete application layout restructuring. The implementation builds upon existing RBAC infrastructure while adding new roles (HR Admin, Project Manager, Finance Manager) and implementing role-based sidebar visibility.

---

## Current State Analysis

### Existing Infrastructure (What We Have)

**Database Schema:**
- `user_roles` table with `app_role` enum: `admin`, `intern`, `employee`, `super_admin`, `org_admin`, `manager`, `team_lead`
- `custom_roles` table for organization-specific roles with `role_type` column
- `role_permissions` table with granular permissions: `can_view`, `can_create`, `can_edit`, `can_delete`, `can_approve`, `can_export`, `visibility_scope`
- `reporting_structure` table for manager-subordinate relationships
- Security definer functions: `get_direct_reports`, `get_team_members`, `check_module_permission`, `get_visibility_scope`

**Frontend Components:**
- `useUserRole` hook with role priority hierarchy (7 levels)
- `useDataVisibility` hook for module-based visibility filtering
- `AppSidebar` with two navigation configurations: `adminNavGroups` and `internNavGroups`
- `tab-registry.ts` with 75+ lazy-loaded tab components and `adminOnly`/`internOnly` flags
- `navigation.ts` with centralized navigation configuration

**Current Role Hierarchy:**
```
super_admin (7) → org_admin (6) → admin (6) → manager (5) → team_lead (4) → employee (3) → intern (2)
```

### Gap Analysis

| Specification | Current State | Gap |
|---------------|---------------|-----|
| HR Admin role | Not implemented | Need to add role + permissions |
| Project Manager role | Not implemented | Need to add role + permissions |
| Finance Manager role | Not implemented | Need to add role + permissions |
| Role-specific sidebars | Only Admin vs Intern | Need 7 distinct configurations |
| Top navigation (Org Switcher, Quick Actions) | Basic header | Missing org switcher, quick actions |
| Breadcrumb navigation | Not implemented | Need to add |
| Module-level permission checks | Exists in DB | Need UI integration |
| Approval workflow visibility | Partial | Need badge counts + routing |

---

## Implementation Architecture

### Phase 1: Database Schema Updates

**1.1 Extend app_role enum**

Add new specialized roles to the existing enum:

```sql
-- Migration: Add HR_Admin, Project_Manager, Finance_Manager roles
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'hr_admin' AFTER 'admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'project_manager' AFTER 'hr_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'finance_manager' AFTER 'project_manager';
```

**1.2 Update role priority in useUserRole**

```typescript
const ROLE_PRIORITY: Record<AppRole, number> = {
  'super_admin': 10,
  'org_admin': 9,
  'admin': 9,
  'hr_admin': 8,
  'project_manager': 8,
  'finance_manager': 8,
  'manager': 7,
  'team_lead': 6,
  'employee': 5,
  'intern': 4,
};
```

**1.3 Create default permissions for new roles**

Update `initialize_default_roles` function to include:
- **HR Admin**: Full access to HR modules, employees, attendance, leaves, payroll, performance, recruitment, training
- **Project Manager**: Full access to projects, tasks, sprints, capacity, team calendar, reports
- **Finance Manager**: Full access to payroll, expenses, loans, reimbursements, financial reports, budgets

---

### Phase 2: Role-Based Navigation Configuration

**2.1 Create new navigation.ts structure**

Replace the current 2-tier (admin/intern) with 7-tier role-specific configurations:

```typescript
// src/config/navigation.ts

export type NavigationRole = 
  | 'super_admin' 
  | 'org_admin' 
  | 'hr_admin' 
  | 'project_manager' 
  | 'finance_manager'
  | 'manager' 
  | 'team_lead' 
  | 'employee' 
  | 'intern';

// Navigation groups per role
export const roleNavGroups: Record<NavigationRole, NavGroup[]> = {
  super_admin: [...allModules, platformManagement],
  org_admin: [...allModules, orgSettings],
  hr_admin: [dashboard, hrManagement, attendance, leaveManagement, payroll, performance, recruitment, training],
  project_manager: [dashboard, projects, tasks, sprints, capacity, teamCalendar, reports],
  finance_manager: [dashboard, payroll, expenses, loans, reimbursements, financialReports, budgets],
  manager: [dashboard, myTeam, tasks, attendance, leaves, performance, reports],
  team_lead: [dashboard, myTeam, tasks, attendance, leaves, reports],
  employee: [selfServiceModules],
  intern: [limitedSelfServiceModules],
};
```

**2.2 Define complete sidebar structure**

Create comprehensive navigation groups matching the specification:

```text
src/config/
├── navigation.ts          # Core navigation types and helpers
├── navigation/
│   ├── admin-groups.ts    # Super Admin, Org Admin, Admin navigation
│   ├── hr-groups.ts       # HR Admin navigation
│   ├── pm-groups.ts       # Project Manager navigation
│   ├── finance-groups.ts  # Finance Manager navigation
│   ├── manager-groups.ts  # Manager, Team Lead navigation
│   └── employee-groups.ts # Employee, Intern navigation
```

---

### Phase 3: Sidebar Component Restructuring

**3.1 Update AppSidebar.tsx**

Modify to use role-based navigation selection:

```typescript
export function AppSidebar({ activeTab, onTabChange }: AppSidebarProps) {
  const { role } = useUserRole();
  
  // Get navigation groups based on user's primary role
  const navGroups = useMemo(() => {
    return getNavGroupsForRole(role, organization?.enabled_features);
  }, [role, organization?.enabled_features]);
  
  // ... rest of component
}
```

**3.2 Create role-specific sidebar sections**

| Role | Sidebar Sections |
|------|------------------|
| Super Admin | Platform Management, All Modules, Organization Settings |
| Org Admin | All Modules, Organization Settings, User Management |
| HR Admin | HR Management, Employees, Attendance, Leaves, Payroll, Performance, Recruitment, Training |
| Project Manager | Dashboard, Projects, Tasks, Sprints, Capacity, Resources, Reports |
| Finance Manager | Dashboard, Payroll, Expenses, Loans, Budgets, Financial Reports |
| Manager/Team Lead | Dashboard, My Team, Tasks, Attendance, Leaves, Performance, Reports |
| Employee | My Dashboard, My Profile, Attendance, Leaves, Tasks, Calendar, Payslips |
| Intern | My Dashboard, Tasks, Training, Attendance |

---

### Phase 4: Top Navigation Bar Enhancement

**4.1 Update AppHeader.tsx**

Add missing components:
- **Organization Switcher** (for super admins with multi-org access)
- **Global Search** (already exists)
- **Quick Actions Menu** with role-specific shortcuts
- **Notification Center** with badge counts
- **Profile Menu** (already exists)

**4.2 Create OrganizationSwitcher component**

```typescript
// src/components/navigation/OrganizationSwitcher.tsx
// Dropdown showing organizations user has access to
// Super admins see all orgs, others see only their org
```

**4.3 Create QuickActionsDropdown component**

Role-specific quick actions:

| Role | Quick Actions |
|------|---------------|
| All | Check In/Out, Log Time, Create Task, Apply Leave |
| Managers+ | Approve Leaves, Approve Expenses, View Team |
| HR Admin | Add Employee, Process Payroll |
| PM | Create Project, Start Sprint |

---

### Phase 5: Breadcrumb Navigation

**5.1 Create BreadcrumbNav component**

```typescript
// src/components/navigation/BreadcrumbNav.tsx
interface BreadcrumbProps {
  items: { label: string; href?: string }[];
}

// Auto-generate from current route:
// Dashboard > HR > Employees > John Doe
```

**5.2 Integrate with page layouts**

Add breadcrumb to `StandalonePageLayout` and `ModernDashboard`:

```tsx
<BreadcrumbNav items={[
  { label: 'Dashboard', href: '/dashboard' },
  { label: activeModule },
  { label: currentPage }
]} />
```

---

### Phase 6: Tab Registry Updates

**6.1 Add role-based access control**

Update `tab-registry.ts` to support granular role checking:

```typescript
export interface TabConfig {
  component: LazyExoticComponent<ComponentType<any>>;
  allowedRoles?: AppRole[];  // NEW: Explicit role whitelist
  requiredPermission?: { module: string; action: 'view' | 'create' | 'edit' };
  adminOnly?: boolean;
  internOnly?: boolean;
}

// Example entries with role restrictions
'payroll': {
  component: lazy(() => import('@/components/finance/PayrollManagement')),
  allowedRoles: ['super_admin', 'org_admin', 'admin', 'hr_admin', 'finance_manager'],
  requiredPermission: { module: 'payroll', action: 'view' },
},
```

**6.2 Update getTabComponent function**

```typescript
export function getTabComponent(
  tabId: string, 
  role: AppRole,
  permissions?: RolePermissions
): TabConfig | null {
  const config = tabRegistry[tabId];
  if (!config) return null;
  
  // Check role-based access
  if (config.allowedRoles && !config.allowedRoles.includes(role)) {
    return null;
  }
  
  // Check permission-based access
  if (config.requiredPermission && permissions) {
    const { module, action } = config.requiredPermission;
    if (!hasPermission(permissions, module, action)) {
      return null;
    }
  }
  
  return config;
}
```

---

### Phase 7: useUserRole Hook Enhancement

**7.1 Add new role flags**

```typescript
interface UserRoleData {
  role: AppRole;
  allRoles: AppRole[];
  organizationId: string | null;
  
  // Existing flags
  isSuperAdmin: boolean;
  isOrgAdmin: boolean;
  isAdmin: boolean;
  isManager: boolean;
  isTeamLead: boolean;
  isEmployee: boolean;
  
  // NEW role flags
  isHRAdmin: boolean;
  isProjectManager: boolean;
  isFinanceManager: boolean;
  
  // Permission helpers
  canAccessHRModules: boolean;
  canAccessProjectModules: boolean;
  canAccessFinanceModules: boolean;
  canAccessSettings: boolean;
  canManageUsers: boolean;
  
  isLoading: boolean;
}
```

**7.2 Create useRolePermissions hook**

```typescript
// src/hooks/useRolePermissions.tsx
export function useRolePermissions() {
  const { role, organizationId } = useUserRole();
  
  // Fetch permissions from role_permissions table
  const { data: permissions } = useQuery({
    queryKey: ['role-permissions', role, organizationId],
    queryFn: async () => {
      const { data } = await supabase
        .from('role_permissions')
        .select('*')
        .eq('organization_id', organizationId);
      return data;
    },
  });
  
  const hasPermission = (module: string, action: string) => {
    const perm = permissions?.find(p => p.module_name === module);
    if (!perm) return false;
    return perm[`can_${action}`] === true;
  };
  
  const getVisibilityScope = (module: string) => {
    const perm = permissions?.find(p => p.module_name === module);
    return perm?.visibility_scope || 'own';
  };
  
  return { permissions, hasPermission, getVisibilityScope };
}
```

---

### Phase 8: Employee Types Update

**8.1 Update src/types/employee.ts**

```typescript
export type UserRole = 
  | 'super_admin' 
  | 'org_admin' 
  | 'admin' 
  | 'hr_admin'          // NEW
  | 'project_manager'    // NEW
  | 'finance_manager'    // NEW
  | 'manager' 
  | 'team_lead' 
  | 'employee' 
  | 'intern';

export function getRolePermissions(role: UserRole): UserPermissions {
  const adminRoles: UserRole[] = ['super_admin', 'org_admin', 'admin'];
  const hrRoles: UserRole[] = [...adminRoles, 'hr_admin'];
  const projectRoles: UserRole[] = [...adminRoles, 'project_manager'];
  const financeRoles: UserRole[] = [...adminRoles, 'finance_manager'];
  const managerRoles: UserRole[] = [...adminRoles, 'manager', 'team_lead'];
  
  return {
    canManageTasks: projectRoles.includes(role) || managerRoles.includes(role),
    canManageProjects: projectRoles.includes(role),
    canManageEmployees: hrRoles.includes(role),
    canManagePayroll: financeRoles.includes(role) || hrRoles.includes(role),
    canManageCoins: adminRoles.includes(role),
    canManageOrganization: adminRoles.includes(role),
    canApproveTimesheets: managerRoles.includes(role),
    canApproveLeaves: hrRoles.includes(role) || managerRoles.includes(role),
    canViewReports: managerRoles.includes(role),
    canManageTraining: hrRoles.includes(role),
    canManageRecruitment: hrRoles.includes(role),
    canManageBudgets: financeRoles.includes(role),
  };
}

export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    super_admin: 'Super Admin',
    org_admin: 'Organization Admin',
    admin: 'Admin',
    hr_admin: 'HR Admin',
    project_manager: 'Project Manager',
    finance_manager: 'Finance Manager',
    manager: 'Manager',
    team_lead: 'Team Lead',
    employee: 'Employee',
    intern: 'Intern',
  };
  return roleNames[role] || 'User';
}
```

---

## Implementation Files Summary

### New Files to Create (12 files)

| File | Purpose |
|------|---------|
| `supabase/migrations/XXXXXX_add_specialized_roles.sql` | Add hr_admin, project_manager, finance_manager to app_role enum |
| `supabase/migrations/XXXXXX_update_default_permissions.sql` | Update initialize_default_roles with new role permissions |
| `src/config/navigation/admin-groups.ts` | Super Admin, Org Admin navigation |
| `src/config/navigation/hr-groups.ts` | HR Admin navigation |
| `src/config/navigation/pm-groups.ts` | Project Manager navigation |
| `src/config/navigation/finance-groups.ts` | Finance Manager navigation |
| `src/config/navigation/manager-groups.ts` | Manager, Team Lead navigation |
| `src/config/navigation/employee-groups.ts` | Employee, Intern navigation |
| `src/components/navigation/OrganizationSwitcher.tsx` | Org switching for multi-org users |
| `src/components/navigation/QuickActionsDropdown.tsx` | Role-specific quick actions |
| `src/components/navigation/BreadcrumbNav.tsx` | Breadcrumb navigation component |
| `src/hooks/useRolePermissions.tsx` | Permission checking hook |

### Files to Modify (8 files)

| File | Changes |
|------|---------|
| `src/hooks/useUserRole.tsx` | Add new role flags, update priority |
| `src/types/employee.ts` | Add new UserRole types |
| `src/config/navigation.ts` | Add role-based navigation selector |
| `src/components/AppSidebar.tsx` | Use role-based navigation groups |
| `src/components/AppHeader.tsx` | Add org switcher, quick actions, breadcrumb |
| `src/pages/dashboard/tab-registry.ts` | Add allowedRoles to tab configs |
| `src/pages/ModernDashboard.tsx` | Integrate breadcrumb, permission checks |
| `src/layouts/StandalonePageLayout.tsx` | Add breadcrumb navigation |

---

## Technical Implementation Details

### Navigation Group Definitions

**HR Admin Sidebar:**
```typescript
const hrAdminGroups: NavGroup[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    items: [
      { title: "Overview", url: "overview" },
      { title: "HR Dashboard", url: "hr-dashboard" },
    ]
  },
  {
    label: "HR Management",
    icon: Users,
    items: [
      { title: "Employees", url: "interns" },
      { title: "Add Employee", url: "add-employee" },
      { title: "Onboarding", url: "onboarding" },
      { title: "Exit Management", url: "exit" },
      { title: "Org Chart", url: "org-chart" },
      { title: "Documents", url: "documents" },
    ]
  },
  {
    label: "Attendance & Leave",
    icon: Clock,
    items: [
      { title: "Attendance", url: "attendance" },
      { title: "Shifts", url: "shifts" },
      { title: "Leave Management", url: "leave" },
      { title: "Leave Approvals", url: "leave-approvals" },
      { title: "Holidays", url: "holidays" },
    ]
  },
  {
    label: "Payroll",
    icon: Wallet,
    items: [
      { title: "Payroll Processing", url: "payroll" },
      { title: "Salary Structures", url: "salary-structure" },
      { title: "Benefits", url: "benefits" },
    ]
  },
  {
    label: "Performance",
    icon: TrendingUp,
    items: [
      { title: "OKRs", url: "okrs" },
      { title: "Reviews", url: "reviews" },
      { title: "360° Feedback", url: "feedback" },
      { title: "PIPs", url: "pips" },
    ]
  },
  {
    label: "Recruitment",
    icon: UserPlus,
    items: [
      { title: "Job Postings", url: "job-postings" },
      { title: "Applications", url: "applications" },
      { title: "Interviews", url: "interviews" },
      { title: "Offers", url: "offers" },
    ]
  },
  {
    label: "Training",
    icon: BookOpen,
    items: [
      { title: "Programs", url: "training" },
      { title: "Enrollments", url: "enrollments" },
      { title: "Certifications", url: "certifications" },
    ]
  },
];
```

**Project Manager Sidebar:**
```typescript
const projectManagerGroups: NavGroup[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    items: [
      { title: "Overview", url: "overview" },
      { title: "Project Dashboard", url: "project-dashboard" },
    ]
  },
  {
    label: "Projects",
    icon: FolderOpen,
    items: [
      { title: "All Projects", url: "projects" },
      { title: "My Projects", url: "my-projects" },
      { title: "Create Project", url: "create-project" },
      { title: "Project Templates", url: "project-templates" },
    ]
  },
  {
    label: "Tasks",
    icon: CheckSquare,
    items: [
      { title: "Kanban Board", url: "tasks" },
      { title: "Task Calendar", url: "task-calendar" },
      { title: "Gantt Chart", url: "gantt" },
    ]
  },
  {
    label: "Sprints",
    icon: Target,
    items: [
      { title: "Sprint Planning", url: "sprints" },
      { title: "Backlog", url: "backlog" },
      { title: "Sprint Reports", url: "sprint-reports" },
    ]
  },
  {
    label: "Resources",
    icon: Users2,
    items: [
      { title: "Capacity", url: "capacity" },
      { title: "Resource Allocation", url: "resources" },
      { title: "Workload", url: "workload" },
    ]
  },
  {
    label: "Reports",
    icon: BarChart3,
    items: [
      { title: "Project Reports", url: "project-reports" },
      { title: "Time Tracking", url: "time-reports" },
      { title: "Analytics", url: "analytics" },
    ]
  },
];
```

**Finance Manager Sidebar:**
```typescript
const financeManagerGroups: NavGroup[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    items: [
      { title: "Overview", url: "overview" },
      { title: "Finance Dashboard", url: "finance-dashboard" },
    ]
  },
  {
    label: "Payroll",
    icon: Wallet,
    items: [
      { title: "Payroll Processing", url: "payroll" },
      { title: "Salary Structures", url: "salary-structure" },
      { title: "Salary Revisions", url: "salary-revisions" },
      { title: "Bonus Management", url: "bonus" },
    ]
  },
  {
    label: "Expenses",
    icon: Receipt,
    items: [
      { title: "Expense Approvals", url: "expense-approvals" },
      { title: "Expense Categories", url: "expense-categories" },
      { title: "Mileage Claims", url: "mileage" },
      { title: "Travel Expenses", url: "travel" },
    ]
  },
  {
    label: "Loans & Advances",
    icon: Banknote,
    items: [
      { title: "Loan Requests", url: "loan-requests" },
      { title: "Loan Approvals", url: "loan-approvals" },
      { title: "EMI Tracking", url: "emi" },
    ]
  },
  {
    label: "Tax & Compliance",
    icon: Shield,
    items: [
      { title: "Tax Management", url: "tax-management" },
      { title: "Form 16", url: "form16" },
      { title: "Compliance", url: "compliance" },
    ]
  },
  {
    label: "Budgets",
    icon: PieChart,
    items: [
      { title: "Budget Planning", url: "budget-planning" },
      { title: "Cost Centers", url: "cost-centers" },
    ]
  },
  {
    label: "Reports",
    icon: BarChart3,
    items: [
      { title: "Payroll Reports", url: "payroll-reports" },
      { title: "Expense Reports", url: "expense-reports" },
      { title: "Financial Analytics", url: "finance-analytics" },
    ]
  },
];
```

---

## Data Flow Diagram

```text
User Login
    │
    ▼
┌─────────────────────────────────────────────────┐
│ useAuth() - Fetches profile from profiles table │
└─────────────────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────────────────┐
│ useUserRole() - Fetches roles from user_roles   │
│ Returns: role, allRoles, isSuperAdmin, isHRAdmin │
└──────────────────────────────────────────────────┘
    │
    ▼
┌────────────────────────────────────────────────────┐
│ getNavGroupsForRole(role, enabledFeatures)         │
│ Returns: Filtered navigation groups for sidebar    │
└────────────────────────────────────────────────────┘
    │
    ▼
┌────────────────────────────────────────────────────┐
│ AppSidebar renders role-specific navigation        │
└────────────────────────────────────────────────────┘
    │
    ▼
┌────────────────────────────────────────────────────┐
│ Tab selected → getTabComponent(tabId, role)        │
│ Checks: allowedRoles, requiredPermission           │
└────────────────────────────────────────────────────┘
    │
    ▼
┌────────────────────────────────────────────────────┐
│ Component renders with role-based data visibility  │
│ useDataVisibility(module) filters data by scope    │
└────────────────────────────────────────────────────┘
```

---

## Security Considerations

1. **Server-side validation**: All role checks use `user_roles` table via Supabase RLS
2. **No client-side role storage**: Roles fetched fresh on each session
3. **SECURITY DEFINER functions**: Used for recursive permission checks to avoid RLS recursion
4. **Organization isolation**: All queries include `organization_id` filtering
5. **Permission-based tab access**: Tabs check both role and granular permissions

---

## Testing Checklist

- [ ] Create test users for each role type
- [ ] Verify sidebar shows correct modules per role
- [ ] Verify tab access restrictions work
- [ ] Verify data visibility scope (own vs team vs all)
- [ ] Test role switching (super admin viewing as org admin)
- [ ] Test approval workflows with proper routing
- [ ] Verify breadcrumb navigation accuracy
- [ ] Test quick actions per role
- [ ] Verify mobile navigation works for all roles

---

## Implementation Priority

| Priority | Phase | Effort | Impact |
|----------|-------|--------|--------|
| 1 | Database schema (add roles) | Low | High |
| 2 | Update useUserRole hook | Low | High |
| 3 | Navigation configuration | Medium | High |
| 4 | AppSidebar role-based rendering | Medium | High |
| 5 | Tab registry permission integration | Medium | High |
| 6 | Top navigation enhancements | Medium | Medium |
| 7 | Breadcrumb navigation | Low | Low |

---

## Estimated Effort

- **Database migrations**: 1-2 hours
- **Hook updates**: 2-3 hours
- **Navigation configuration**: 3-4 hours
- **Sidebar restructuring**: 2-3 hours
- **Tab registry updates**: 2-3 hours
- **Top navigation components**: 3-4 hours
- **Testing & refinement**: 4-6 hours

**Total**: 17-25 hours of development time

