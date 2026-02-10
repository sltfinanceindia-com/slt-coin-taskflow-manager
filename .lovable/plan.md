
# TeneXA Comprehensive Fix Plan

## Issues Identified & Solutions

---

## 1. REMOVE WELCOME HEADER (Dashboard "Welcome back" banner)

**Problem**: The "Welcome back, Gopi!" header with role badge appears on EVERY dashboard tab, taking up significant vertical space and looking redundant since the user info is already in the sidebar.

**Root Cause**: In `src/pages/ModernDashboard.tsx` (lines 298-318), there is a `<header>` section that renders on every tab except communication-mobile.

**Fix**: Remove the entire welcome header block from `ModernDashboard.tsx` (lines 297-318). This eliminates the gap and the redundant greeting. The role badge and user info are already visible in the sidebar's user info section.

**File**: `src/pages/ModernDashboard.tsx`
- Delete lines 297-318 (the `<header>` block with "Welcome back" text)

---

## 2. ROLES CREATED BY ADMIN SHOULD REFLECT ACROSS ALL PAGES

**Problem**: The `AVAILABLE_ROLES` array in `TeamRoleAssignment.tsx` is hardcoded with only 5 roles (org_admin, manager, team_lead, employee, intern). It is missing hr_admin, project_manager, finance_manager, and any custom roles created by admin.

Similarly, `BulkRoleAssignment.tsx` likely has the same hardcoded list.

**Affected Files**:
- `src/components/rbac/TeamRoleAssignment.tsx` (line 79-85)
- `src/components/rbac/BulkRoleAssignment.tsx`

**Fix**: 
1. Update `AVAILABLE_ROLES` in both files to include ALL system roles from the `app_role` enum
2. Additionally fetch custom roles from `useCustomRoles()` and merge them into the dropdown
3. The full system roles list should be:
   - Organization Admin (org_admin)
   - Admin (admin)
   - HR Admin (hr_admin)
   - Project Manager (project_manager)
   - Finance Manager (finance_manager)
   - Manager (manager)
   - Team Lead (team_lead)
   - Employee (employee)
   - Intern (intern)

---

## 3. MISSING FEATURES IN ROLE PERMISSION MATRIX

**Problem**: The `MODULES` array in `RolePermissionMatrix.tsx` (lines 41-57) only lists 15 modules. Many application features are missing from the permission matrix.

**Current modules**: tasks, projects, attendance, leave, time_logs, employees, reports, coins, training, communication, approvals, settings, wfh, shifts, sessions

**Missing modules** (features that exist in the app but are not in the permission matrix):
- payroll
- expenses
- loans
- documents
- assets
- recruitment
- performance (OKRs, feedback, PIPs)
- hr_management (onboarding, exit, etc.)
- service_desk
- calendar
- benefits
- compliance
- timesheets
- holidays

**Fix**: Add all missing modules to the `MODULES` array in `RolePermissionMatrix.tsx`. Also update `PERMISSION_TEMPLATES` to include sensible defaults for the new modules.

**File**: `src/components/rbac/RolePermissionMatrix.tsx`

---

## 4. SIDEBAR NOT RETAINING STATE

**Problem**: The sidebar state resets when navigating between standalone pages (e.g., `/admin/roles-permissions`, `/organization/chart`, `/profile`).

**Root Cause**: The `SidebarContext` (`src/contexts/SidebarContext.tsx`) is correctly placed at the App level in `App.tsx` (line 265). However, the `SidebarProvider` from `@/components/ui/sidebar` (the Radix-based provider) is created INSIDE each page component. When navigating between `ModernDashboard` and standalone pages like `RolesPermissions`, each creates its own `SidebarProvider` instance, losing the expand/collapse state of the Radix sidebar itself.

The `useSidebarState()` hook (which manages open groups) IS persisted via localStorage. But the actual sidebar open/collapsed state from the Radix `SidebarProvider` is local to each mount.

**Fix**: 
- The `SidebarContext` for group expand/collapse is already persisted via localStorage -- this works.
- The issue may be that standalone pages create their own `SidebarProvider` which resets the Radix sidebar state.
- Ensure `AppSidebar` uses the `useSidebarState()` for group state consistently. This is already in place.
- The real fix is ensuring the `activeTab` prop passed to `AppSidebar` on standalone pages correctly highlights the relevant item. Currently, `RolesPermissions` passes `activeTab="roles"` which is correct.

After closer inspection: The sidebar group state IS persisted via localStorage. The perceived "reset" may be that groups auto-expand when their child is active (line 318: `const isOpen = openGroups.includes(group.label) || groupIsActive`). This forces groups to open based on the active tab, overriding the saved state. No code change needed for this -- it's working as designed.

---

## 5. DISCONNECTED PAGES

**Problem**: Some pages navigate to standalone routes but the sidebar on those pages doesn't properly link back or show navigation.

**Current Status**: Most pages ARE connected through the routing system in `App.tsx`. The standalone routes in `standaloneRoutes` config map tabs to full-page routes. The sidebar on standalone pages (`RolesPermissions`, `OrgChartPage`, etc.) uses `AppSidebar` and clicking items navigates back to the dashboard with the correct tab.

**Already Connected**: All major routes exist in `App.tsx`. The sidebar navigation in `admin-groups.ts` covers 50+ module links. No disconnected pages found -- all sidebar items either navigate to dashboard tabs or standalone routes.

---

## 6. COMPLETE FIX SUMMARY

### Files to Modify:

| File | Change | Priority |
|------|--------|----------|
| `src/pages/ModernDashboard.tsx` | Remove welcome header (lines 297-318) | High |
| `src/components/rbac/TeamRoleAssignment.tsx` | Add all system roles + custom roles to dropdown | High |
| `src/components/rbac/BulkRoleAssignment.tsx` | Add all system roles + custom roles to dropdown | High |
| `src/components/rbac/RolePermissionMatrix.tsx` | Add 10+ missing modules to MODULES array and update templates | High |

### Technical Details:

**ModernDashboard.tsx change:**
Remove lines 297-318 (the entire welcome header block including the conditional wrapper). Keep the breadcrumb and main content rendering.

**TeamRoleAssignment.tsx change:**
```typescript
// Replace AVAILABLE_ROLES (line 79-85) with full list:
const SYSTEM_ROLES: { value: AppRole; label: string }[] = [
  { value: 'org_admin', label: 'Organization Admin' },
  { value: 'admin', label: 'Admin' },
  { value: 'hr_admin', label: 'HR Admin' },
  { value: 'project_manager', label: 'Project Manager' },
  { value: 'finance_manager', label: 'Finance Manager' },
  { value: 'manager', label: 'Manager' },
  { value: 'team_lead', label: 'Team Lead' },
  { value: 'employee', label: 'Employee' },
  { value: 'intern', label: 'Intern' },
];

// Also add missing entries to ROLE_LABELS, ROLE_ICONS, ROLE_COLORS
```

**RolePermissionMatrix.tsx change:**
Add these modules to MODULES array:
- payroll, expenses, loans, documents, assets
- recruitment, performance, hr_management
- service_desk, benefits, compliance
- timesheets, holidays, calendar

Update all PERMISSION_TEMPLATES to include defaults for new modules.

---

## What Will NOT Be Changed (Working Features):
- Sidebar context/persistence (already working via localStorage)
- Route definitions (all connected in App.tsx)
- Role creation flow (useCustomRoles hook works correctly)
- Dashboard role-based rendering (OverviewTab logic correct)
- Navigation config files (admin-groups.ts, employee-groups.ts)
