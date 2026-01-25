
# Comprehensive Fix Plan: Database Connections, Layout, and Feature Integration

## Overview
This plan addresses multiple critical issues across the application:
1. **Layout Issues** - Fix bottom spacing on Kanban board and other pages
2. **Time Logs Enhancement** - Add filter and search functionality
3. **Create Task Fix** - Add search for assignments, templates loading
4. **Updates Tab Integration** - Connect with all application feature triggers
5. **Sidebar Customization** - Filter navigation based on organization's enabled features
6. **Portfolio/Projects Fix** - Improve layout and functionality
7. **Remaining Mock Data Replacement** - Connect all placeholders to real data

---

## Phase 1: Layout Fixes

### 1.1 Fix Bottom Space on Kanban Board
**File:** `src/pages/ModernDashboard.tsx`

**Problem:** The `pb-20` padding for mobile bottom navigation is applied on all screen sizes unnecessarily, and the Kanban board has extra spacing.

**Solution:**
- Ensure `pb-20 md:pb-0` is correctly applied (already in place but verify)
- Remove unnecessary padding from KanbanBoard container

**File:** `src/components/KanbanBoard.tsx`
- Remove `pb-4` from the scroll container on desktop
- Change line 347: `pb-4` to `pb-4 sm:pb-0`

### 1.2 Fix Main Content Container
**File:** `src/pages/ModernDashboard.tsx`
- Verify the main container doesn't have extra bottom margin
- Ensure content fills available space properly

---

## Phase 2: Time Logs Tab Enhancement

**File:** `src/pages/dashboard/tabs/TimeLogsTab.tsx`

**Add Features:**
1. Search input (by task name, description, employee name)
2. Date range filter (from/to dates)
3. Employee filter dropdown (for admins)
4. Export functionality
5. Summary statistics (total hours, weekly/monthly breakdown)

**Implementation:**
```text
+-------------------------------------------+
|  Time Logs                    [Log Hours] |
|  Track your working hours                 |
+-------------------------------------------+
| Search: [___________] | From: [__] To:[__]|
| Employee: [All ▼]     | [Export CSV]      |
+-------------------------------------------+
| Summary: 40h this week | 160h this month  |
+-------------------------------------------+
|  Recent Time Entries                      |
|  ┌─────────────────────────────────────┐  |
|  │ Task Name         Hours    Date     │  |
|  │ [Edit] [Delete]                     │  |
|  └─────────────────────────────────────┘  |
+-------------------------------------------+
```

**Hook Update:** `src/hooks/useTimeLogs.tsx`
- Add delete mutation
- Add edit mutation
- Enhance filtering parameters

---

## Phase 3: Create Task Dialog Improvements

**File:** `src/components/CreateTaskDialog.tsx`

### 3.1 Add Search for Employee Assignment
- Add search/filter input in the employee selection area
- Filter employees by name as user types

### 3.2 Add Task Templates Support
- Create new hook `useTaskTemplates.tsx`
- Add "Use Template" dropdown at top of form
- Pre-fill form fields when template selected

### 3.3 Add Loading States
- Show skeleton/spinner while employees load
- Show skeleton while projects load

**New File:** `src/hooks/useTaskTemplates.tsx`
- Fetch from `task_templates` table
- CRUD operations for templates

---

## Phase 4: Updates Tab - Connect All Features

**File:** `src/pages/dashboard/tabs/UpdatesTab.tsx`
**File:** `src/hooks/useProjectUpdates.tsx`

**Problem:** Updates tab only shows manually posted updates, not automated system triggers.

**Solution:** Create automatic update triggers for:
1. Task status changes
2. Task assignments
3. Leave requests approved/rejected
4. Time logs submitted
5. Project milestones reached
6. Attendance clock-in/out
7. New employee onboarding

**Implementation:**
- Create edge function `auto-generate-updates` that listens to database changes
- OR add update creation in existing mutations across all hooks

**Hooks to Update (add update creation):**
- `useTasks.tsx` - Task status changes, assignments
- `useLeaveRequests.tsx` - Leave approvals
- `useTimeLogs.tsx` - Time log submissions
- `useAttendance.tsx` - Clock-in events

---

## Phase 5: Sidebar Customization Based on Enabled Features

**File:** `src/components/AppSidebar.tsx`

**Problem:** Sidebar shows all navigation items regardless of organization's `enabled_features` setting.

**Solution:**
1. Fetch organization's `enabled_features` from `useOrganization` hook
2. Filter navigation groups based on enabled features
3. Map feature keys to navigation items

**Feature to Navigation Mapping:**
```text
enabled_features.training -> Training Center, Training items
enabled_features.leave_management -> Leave, WFH items
enabled_features.attendance -> Attendance, Shifts items
enabled_features.projects -> Projects, Kanban items
enabled_features.communication -> Communication tab
enabled_features.assessments -> Assessments items
enabled_features.coin_rewards -> Coins/Rewards items
```

**Implementation:**
- Add feature flag check before rendering each nav group
- Hide entire groups if parent feature disabled
- Add visual indicator for disabled features in admin view

---

## Phase 6: Portfolio & Projects Enhancement

### 6.1 Portfolio Management Improvements
**File:** `src/components/project/PortfolioManagement.tsx`

- Add better grid layout with proper spacing
- Add portfolio detail view (drill-down)
- Add portfolio analytics/charts
- Connect to Programs properly

### 6.2 Projects Tab Enhancement
**File:** `src/pages/dashboard/tabs/TasksTab.tsx` or Projects route

- Add project creation with all fields
- Add project filtering by portfolio/program
- Add project timeline view
- Connect Gantt chart to real data

---

## Phase 7: Replace Remaining Mock Data

### 7.1 Work Management Features (Convert Placeholders to Real Components)
**Files:** `src/pages/dashboard/tabs/WorkManagementFeatures.tsx`

Create real implementations for:
1. **SprintsTab** - Connect to `sprints` table, create hook
2. **BacklogTab** - Connect to tasks with backlog status
3. **MilestonesTab** - Create `milestones` table and hook
4. **DependenciesTab** - Use existing `task_dependencies` table
5. **RisksTab** - Create `project_risks` table and hook
6. **IssuesTab** - Create `issues` table and hook

### 7.2 Finance Features
**Files:** `src/pages/dashboard/tabs/FinanceHRFeatures.tsx`

Connect remaining placeholders:
1. TaxManagement
2. SalaryStructure
3. BonusManagement

### 7.3 Benefits Claims & Dependents
**File:** `src/components/hr/BenefitsManagement.tsx`

- Create `benefit_claims` table
- Create `benefit_dependents` table
- Create hooks and connect UI

---

## Phase 8: Fix Edit Actions Across All Features

### Components Needing Edit Implementation:

| Component | Hook | Action |
|-----------|------|--------|
| BenefitsManagement | useBenefits | Add updateBenefit call |
| GrievanceManagement | useGrievances | Add updateGrievance call |
| ContractsManagement | useContracts | Add updateContract call |
| All HR components | Respective hooks | Wire up Edit buttons |
| All Finance components | Respective hooks | Wire up Edit buttons |

**Pattern for Each:**
1. Add `editingItem` state
2. Open dialog with pre-filled data when Edit clicked
3. Call update mutation on submit
4. Refresh list after success

---

## Technical Details

### New Database Tables Needed:
1. `sprints` - Sprint planning
2. `milestones` - Project milestones
3. `project_risks` - Risk register
4. `issues` - Issue tracking
5. `benefit_claims` - Employee claims
6. `benefit_dependents` - Covered family members
7. `task_templates` - Task templates

### New Hooks to Create:
1. `useSprints.tsx`
2. `useMilestones.tsx`
3. `useProjectRisks.tsx`
4. `useIssues.tsx`
5. `useBenefitClaims.tsx`
6. `useBenefitDependents.tsx`
7. `useTaskTemplates.tsx`

### Files to Modify:
1. `src/pages/ModernDashboard.tsx` - Layout fix
2. `src/components/KanbanBoard.tsx` - Bottom padding fix
3. `src/pages/dashboard/tabs/TimeLogsTab.tsx` - Complete rewrite with filters
4. `src/components/CreateTaskDialog.tsx` - Add search & templates
5. `src/components/AppSidebar.tsx` - Feature-based filtering
6. `src/hooks/useProjectUpdates.tsx` - Auto-trigger integration
7. `src/pages/dashboard/tabs/UpdatesTab.tsx` - Enhanced display
8. Multiple HR components - Add edit functionality
9. Multiple Finance components - Add edit functionality
10. Work Management features - Replace placeholders

---

## Implementation Order

1. **Immediate fixes** (Layout, bottom spacing) - Quick wins
2. **Time Logs enhancement** - User requested specifically
3. **Create Task fixes** - Search + templates
4. **Sidebar customization** - Feature flags
5. **Updates integration** - System-wide triggers
6. **Portfolio improvements** - Better layout
7. **Mock data replacement** - Batch by category
8. **Edit actions** - Across all components

---

## Estimated File Changes

| Category | Files | Priority |
|----------|-------|----------|
| Layout Fixes | 2 | High |
| Time Logs | 2 | High |
| Create Task | 2 | High |
| Sidebar | 1 | High |
| Updates Integration | 3 | Medium |
| Portfolio | 3 | Medium |
| New Hooks | 7 | Medium |
| Mock Data Replace | 10+ | Medium |
| Edit Actions | 15+ | Medium |
| Database Migrations | 2 | Medium |

**Total estimated files to create/modify: 45+**
