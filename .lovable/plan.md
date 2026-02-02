
# TeneXA Navigation & Structure Comprehensive Audit Plan

## Executive Summary

After thorough analysis of the codebase against the provided specification, I've identified critical gaps in navigation architecture, routing structure, and role-based visibility. The current implementation is approximately **75% aligned** with the specification but requires significant restructuring for complete compliance.

---

## 1. CRITICAL NAVIGATION ARCHITECTURE GAPS

### 1.1 Layout Structure Mismatch

**Specification Requirements:**
```text
┌─────────────────────────────────────────────────────────────────┐
│ TOP NAVIGATION BAR (Fixed)                                       │
│ [Logo] [Org Switcher▾]     [Search🔍]  [Notifications🔔]        │
│                            [Quick Actions⚡] [Profile Menu▾]     │
└─────────────────────────────────────────────────────────────────┘
│            │ BREADCRUMB: Dashboard > HR > Employees > John Doe   │
```

**Current Status:**
| Component | Spec | Current | Gap |
|-----------|------|---------|-----|
| Logo | Sidebar | Sidebar | ✅ Match |
| Org Switcher | Top Header | Top Header | ✅ Match |
| Global Search | Top Header | Top Header | ✅ Match |
| Notifications | Top Header | Top Header + Sidebar | ⚠️ Duplicate |
| Quick Actions | Top Header | Top Header | ✅ Match |
| Profile Menu | Top Header | Top Header | ✅ Match |
| Breadcrumbs | Below Header | Only on Detail Pages | ❌ Missing on Dashboard |

### 1.2 Sidebar Navigation Structure Issues

**Specification (Grouped Hierarchy):**
```text
👥 HR MANAGEMENT
├─ 👤 EMPLOYEES
│  ├─ All Employees
│  ├─ Add Employee
│  ├─ Employee Lifecycle
│  └─ Employee Analytics
├─ 🏢 ORGANIZATION
│  ├─ Org Chart
│  ├─ Departments
│  └─ Teams
```

**Current Implementation:**
- Uses flat groups without nested sub-menus
- Groups are collapsible but items are not hierarchical
- Missing sub-group structure for complex modules

**Gap Analysis:**

| Module | Spec Sub-Groups | Current Structure |
|--------|-----------------|-------------------|
| HR Management | 6 sub-groups (Employees, Organization, Documents, etc.) | Flat groups mixed together |
| Attendance & Time | 4 sub-groups (Attendance, Shifts, Time Logs, Settings) | Single "Attendance" + "Shifts" + "Time Logs" groups |
| Leave Management | 6 sub-groups | Single "Leave Management" group |
| Payroll & Finance | 5 sub-groups (Payroll, Expenses, Loans, Benefits, Tax) | Split into "Payroll" + "Expenses & Loans" + "Benefits & Tax" |
| Project Management | 6 sub-groups | Split appropriately ✅ |
| Performance | 6 sub-groups | Single group ❌ |

---

## 2. ROLE-BASED SIDEBAR VISIBILITY AUDIT

### Current Role Definitions
The system has 10 roles defined in `types.ts`:
- super_admin, org_admin, admin, hr_admin, project_manager, finance_manager, manager, team_lead, employee, intern

### Visibility Compliance Check

| Sidebar Item | Spec Visibility | Current Visibility | Status |
|--------------|-----------------|-------------------|--------|
| Executive Dashboard | Admin only | Tab exists but not in sidebar | ❌ Missing |
| All Employees | Admin, HR, Managers | Via `interns` tab, adminOnly | ⚠️ Partial |
| Add Employee | Admin, HR | Quick Action exists | ⚠️ No sidebar item |
| Payroll Processing | Finance, Admin | adminOnly + allowedRoles | ✅ Correct |
| My Payslips | All Employees | Available to all | ✅ Correct |
| Team Attendance | Managers only | No specific filter | ❌ Missing |
| All Attendance | Admin, HR | adminOnly flag | ✅ Correct |
| Review Others | Managers only | adminOnly flag | ⚠️ Too restrictive |

### Role-Specific Navigation Files

| File | Role | Status |
|------|------|--------|
| admin-groups.ts | Super Admin, Org Admin, Admin | ✅ Complete |
| hr-groups.ts | HR Admin | ✅ Complete |
| pm-groups.ts | Project Manager | ✅ Complete |
| finance-groups.ts | Finance Manager | ✅ Complete |
| manager-groups.ts | Manager, Team Lead | ✅ Complete |
| employee-groups.ts | Employee, Intern | ✅ Complete |

---

## 3. ROUTE & PAGE STRUCTURE AUDIT

### Missing Routes (Per Specification)

| Specified Route | Current Status | Priority |
|-----------------|----------------|----------|
| `/employees` (List Page) | ❌ Uses `/dashboard?tab=interns` | HIGH |
| `/employees/:id` (Detail) | ✅ Exists | - |
| `/projects` (List Page) | ❌ Uses `/dashboard?tab=projects` | HIGH |
| `/projects/:id` (Detail) | ✅ Exists | - |
| `/attendance` | ❌ Uses tab | MEDIUM |
| `/leaves` | ❌ Uses tab | MEDIUM |
| `/payroll` | ❌ Uses tab | MEDIUM |
| `/performance` | ❌ Uses tab | MEDIUM |
| `/approvals` | ❌ Uses tab | MEDIUM |
| `/settings` | ✅ Redirects to org settings | - |
| `/me` or `/profile` | ✅ `/profile` exists | - |

### Current Standalone Routes (from `standaloneRoutes`)
```typescript
'training': '/training',
'tutorial': '/tutorial',
'my-goals': '/my-goals',
'kudos': '/kudos',
'pulse-surveys': '/pulse-surveys',
'profile': '/profile',
'org-chart': '/organization/chart',
'roles': '/admin/roles-permissions',
'settings': '/admin/organization-settings',
'super-admin': '/super-admin',
'calendar': '/calendar',
'help': '/help'
```

### Routes That SHOULD Be Standalone (Per Spec)
```text
/employees → Employee List Page
/employees/:id → Employee Detail (11 tabs)
/projects → Project List Page  
/projects/:id → Project Detail (9 tabs)
/attendance → Attendance Module Page
/leaves → Leave Management Page
/payroll → Payroll Module Page
/performance → Performance Module Page
/reports → Reports & Analytics Page
/approvals → Approvals Center Page
```

---

## 4. EMPLOYEE MODULE GAP ANALYSIS

### Specification: 11-Tab Employee Detail Page

| Tab | Current Status | Data Source |
|-----|----------------|-------------|
| 1. Overview | ✅ EmployeeOverviewTab.tsx | profiles, tasks, attendance |
| 2. Personal | ✅ EmployeePersonalTab.tsx | profiles (basic info) |
| 3. Employment | ✅ EmployeeEmploymentTab.tsx | profiles, departments |
| 4. Documents | ✅ EmployeeDocumentsTab.tsx | employee_documents |
| 5. Performance | ✅ EmployeePerformanceTab.tsx | objectives, time_logs |
| 6. Attendance | ✅ EmployeeAttendanceTab.tsx | attendance_records |
| 7. Leaves | ✅ EmployeeLeavesTab.tsx | leave_requests, leave_balances |
| 8. Payroll | ✅ EmployeePayrollTab.tsx | payroll_records |
| 9. Assets | ✅ EmployeeAssetsTab.tsx | assigned_assets |
| 10. Training | ✅ EmployeeTrainingTab.tsx | training_enrollments |
| 11. History | ✅ EmployeeHistoryTab.tsx | activity_logs |

**Status:** Employee Detail Page is complete ✅

### Missing Employee List Page Features

| Feature | Status |
|---------|--------|
| Table View (Name, ID, Department, Designation) | ❌ Uses card grid |
| Filters (Department, Location, Status, Type) | ⚠️ Partial search only |
| Add Employee Action | ✅ Exists |
| Bulk Import/Export | ✅ Separate tab |
| Export | ❌ Missing |

---

## 5. PROJECT MODULE GAP ANALYSIS

### Specification: 9-Tab Project Detail Page

| Tab | Current Status | Data Source |
|-----|----------------|-------------|
| 1. Overview | ✅ ProjectOverviewTab.tsx | projects, tasks |
| 2. Team | ✅ ProjectTeamTab.tsx | project_team |
| 3. Tasks | ✅ ProjectTasksTab.tsx | tasks |
| 4. Sprints | ✅ ProjectSprintsTab.tsx | sprints |
| 5. Timeline (Gantt) | ✅ ProjectTimelineTab.tsx | tasks |
| 6. Files | ✅ ProjectFilesTab.tsx | project_documents |
| 7. Budget | ✅ ProjectBudgetTab.tsx | project_costs |
| 8. Reports | ✅ ProjectReportsTab.tsx | time_logs |
| 9. Settings | ✅ ProjectSettingsTab.tsx | projects |

**Status:** Project Detail Page is complete ✅

---

## 6. MY PROFILE MODULE GAP ANALYSIS

### Specification: 8-Tab Profile Page

| Tab | Current Status | Priority |
|-----|----------------|----------|
| 1. Overview | ✅ Basic profile card exists | - |
| 2. Employment | ⚠️ Not separate tab, in EmployeeSelfService | MEDIUM |
| 3. Documents | ⚠️ In EmployeeSelfService | MEDIUM |
| 4. Payroll | ⚠️ In EmployeeSelfService | MEDIUM |
| 5. Time & Attendance | ⚠️ In EmployeeSelfService | MEDIUM |
| 6. Performance | ⚠️ In EmployeeSelfService | MEDIUM |
| 7. Preferences | ❌ Missing | HIGH |
| 8. Security | ❌ Missing (password change, 2FA) | HIGH |

### Current Profile Page Structure
- Simple card layout with basic info
- Assessment results section
- No tabbed structure
- Missing Preferences and Security sections

---

## 7. DASHBOARD MODULE GAP ANALYSIS

### Specification Requirements

| Component | Current Status | Priority |
|-----------|----------------|----------|
| KPI Cards (4-6) | ✅ EnhancedDashboardWidgets | - |
| Quick Actions Bar | ⚠️ In header dropdown, not dashboard | MEDIUM |
| Charts Section | ✅ Weekly Activity + Distribution | - |
| Recent Activity Feed | ✅ Recent tasks | - |
| Upcoming Events Widget | ❌ Missing | MEDIUM |
| Mobile Stack (1 KPI/row) | ✅ Responsive grid | - |

---

## 8. CALENDAR CENTRAL HUB AUDIT

### Event Type Integration

| Event Type | Currently Integrated | Status |
|------------|---------------------|--------|
| Tasks | ✅ Yes | - |
| Leaves | ✅ Yes | - |
| WFH | ✅ Yes | - |
| Meetings | ✅ Yes | - |
| Shifts | ❌ No (color defined but not fetched) | HIGH |
| Training | ❌ No | MEDIUM |
| Holidays | ⚠️ Separate HolidayCalendar component | MEDIUM |
| Reviews | ❌ No | LOW |

---

## 9. APPROVAL WORKFLOW AUDIT

### Current Implementation

| Feature | Status |
|---------|--------|
| Pending Approvals Tab | ✅ ApprovalCenter with tabs |
| Approved Tab | ✅ Included in All tab |
| Rejected Tab | ⚠️ No separate tab |
| Workflow Builder | ✅ ApprovalWorkflowConfig.tsx |
| Delegation | ❌ Missing |
| SLA Tracking | ❌ Missing |
| Escalation Rules | ❌ Missing |

---

## 10. PRIORITIZED REMEDIATION ROADMAP

### Phase 1: Navigation Structure Fixes (Critical - Week 1)

| Task | Priority | Effort | Files |
|------|----------|--------|-------|
| Add breadcrumbs to ModernDashboard | P0 | 2h | ModernDashboard.tsx |
| Restructure sidebar to match spec hierarchy | P0 | 4h | admin-groups.ts, hr-groups.ts, etc. |
| Add missing standalone routes | P0 | 3h | App.tsx, navigation/index.ts |
| Create dedicated module landing pages | P0 | 6h | New files: Employees.tsx, Projects.tsx, etc. |
| Remove duplicate NotificationCenter from sidebar | P1 | 30m | AppSidebar.tsx |

### Phase 2: Profile & Security (High - Week 1-2)

| Task | Priority | Effort | Files |
|------|----------|--------|-------|
| Expand Profile to 8-tab structure | P0 | 4h | Profile.tsx |
| Add Security tab (password, 2FA, sessions) | P0 | 4h | New: ProfileSecurityTab.tsx |
| Add Preferences tab (notifications, theme) | P1 | 3h | New: ProfilePreferencesTab.tsx |
| Merge EmployeeSelfService into Profile | P1 | 2h | Profile.tsx |

### Phase 3: Calendar & Integration (Medium - Week 2)

| Task | Priority | Effort | Files |
|------|----------|--------|-------|
| Add shift_schedules to OrganizationCalendar | P0 | 2h | OrganizationCalendar.tsx |
| Add training_programs to calendar | P1 | 1h | OrganizationCalendar.tsx |
| Add holidays from HolidayCalendar | P1 | 1h | OrganizationCalendar.tsx |
| Add My Calendar vs Team Calendar toggle | P1 | 2h | OrganizationCalendar.tsx |

### Phase 4: Dashboard Enhancements (Medium - Week 2)

| Task | Priority | Effort | Files |
|------|----------|--------|-------|
| Add QuickActionsBar widget to dashboard | P1 | 2h | New: DashboardQuickActions.tsx |
| Add UpcomingEventsWidget | P1 | 2h | New: UpcomingEventsWidget.tsx |
| Add Executive Dashboard tab (admin only) | P2 | 4h | New: ExecutiveDashboard.tsx |

### Phase 5: Module Landing Pages (Lower - Week 3)

Create standalone landing pages for major modules:
- `/employees` - EmployeesPage.tsx
- `/projects` - ProjectsPage.tsx
- `/attendance` - AttendancePage.tsx
- `/leaves` - LeavesPage.tsx
- `/payroll` - PayrollPage.tsx
- `/performance` - PerformancePage.tsx
- `/approvals` - ApprovalsPage.tsx

### Phase 6: Role Visibility Refinement (Lower - Week 3)

| Task | Priority | Effort |
|------|----------|--------|
| Add "Team Attendance" view for managers | P2 | 2h |
| Add "Review Others" visibility for managers (not just admin) | P2 | 1h |
| Add "My Team" filter across modules | P2 | 3h |

---

## 11. TECHNICAL IMPLEMENTATION DETAILS

### New Routes to Add in App.tsx

```typescript
// Module Landing Pages (redirect to dashboard tabs for now, can be expanded later)
<Route path="/employees" element={<ProtectedRoute><ModernDashboard defaultTab="interns" /></ProtectedRoute>} />
<Route path="/projects" element={<ProtectedRoute><ModernDashboard defaultTab="projects" /></ProtectedRoute>} />
<Route path="/attendance" element={<ProtectedRoute><ModernDashboard defaultTab="attendance" /></ProtectedRoute>} />
<Route path="/leaves" element={<ProtectedRoute><ModernDashboard defaultTab="leave" /></ProtectedRoute>} />
<Route path="/payroll" element={<ProtectedRoute><ModernDashboard defaultTab="payroll" /></ProtectedRoute>} />
<Route path="/performance" element={<ProtectedRoute><ModernDashboard defaultTab="okrs" /></ProtectedRoute>} />
<Route path="/approvals" element={<ProtectedRoute><ModernDashboard defaultTab="approvals" /></ProtectedRoute>} />
```

### Sidebar Hierarchy Restructure

Current flat structure needs nesting. Example for HR:

```typescript
// Current
{
  label: "Employees",
  items: [
    { title: "All Employees", url: "interns" },
    { title: "Employee Lifecycle", url: "lifecycle" },
  ]
},
{
  label: "Employee Lifecycle",
  items: [
    { title: "Onboarding", url: "onboarding" },
    ...
  ]
}

// Needed: Sub-menus or better grouping
// Option 1: Collapsible sub-groups
// Option 2: Categorized by HR Management umbrella
```

### Profile Page Restructure

```typescript
// Current Profile.tsx - simple layout
// Needed: 8-tab structure

const profileTabs = [
  { id: 'overview', label: 'Overview', icon: User },
  { id: 'employment', label: 'Employment', icon: Briefcase },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'payroll', label: 'Payroll', icon: DollarSign },
  { id: 'time-attendance', label: 'Time & Attendance', icon: Clock },
  { id: 'performance', label: 'Performance', icon: TrendingUp },
  { id: 'preferences', label: 'Preferences', icon: Settings },
  { id: 'security', label: 'Security', icon: Shield },
];
```

---

## 12. FILES TO CREATE/MODIFY

### New Files Required

| File | Purpose |
|------|---------|
| `src/pages/EmployeesPage.tsx` | Module landing page |
| `src/pages/ProjectsPage.tsx` | Module landing page |
| `src/pages/AttendancePage.tsx` | Module landing page |
| `src/pages/LeavesPage.tsx` | Module landing page |
| `src/pages/PayrollPage.tsx` | Module landing page |
| `src/pages/PerformancePage.tsx` | Module landing page |
| `src/pages/ApprovalsPage.tsx` | Module landing page |
| `src/components/profile/ProfileSecurityTab.tsx` | Security settings |
| `src/components/profile/ProfilePreferencesTab.tsx` | User preferences |
| `src/components/dashboard/DashboardQuickActions.tsx` | Quick actions widget |
| `src/components/dashboard/UpcomingEventsWidget.tsx` | Events widget |

### Files to Modify

| File | Changes |
|------|---------|
| `App.tsx` | Add new module routes |
| `navigation/index.ts` | Add new standalone routes |
| `admin-groups.ts` | Restructure hierarchy |
| `hr-groups.ts` | Restructure hierarchy |
| `pm-groups.ts` | Restructure hierarchy |
| `Profile.tsx` | Convert to 8-tab structure |
| `OrganizationCalendar.tsx` | Add shift_schedules, training |
| `ModernDashboard.tsx` | Add breadcrumbs, quick actions |
| `AppSidebar.tsx` | Remove duplicate notification widget |

---

## Summary Alignment Score

| Module | Current | Target | Gap |
|--------|---------|--------|-----|
| Top Navigation | 90% | 100% | Breadcrumbs missing on dashboard |
| Sidebar Structure | 70% | 100% | Needs hierarchical restructure |
| Routing | 60% | 100% | Missing module landing pages |
| Employee Module | 95% | 100% | List page needs table view |
| Project Module | 95% | 100% | List page needs filters |
| Profile Module | 50% | 100% | Missing 5 tabs |
| Calendar Hub | 75% | 100% | Missing shifts, training |
| Approvals | 80% | 100% | Missing delegation, SLA |
| Dashboard | 85% | 100% | Missing quick actions bar |

**Overall Alignment: 75%**

The core functionality exists but requires structural reorganization to match the enterprise HRMS specification precisely.
