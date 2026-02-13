
# Plan: Complete Theme Migration -- Remove All Remaining Emerald/Green References

There are still **64 files** using hardcoded `emerald` colors and **6 files** using `teal` colors that were not updated in the previous round. This plan covers all of them systematically.

---

## Priority 1: UI Primitives (8 files -- highest impact)

These components are used across the entire app, so updating them fixes hundreds of instances at once.

| File | Change |
|------|--------|
| `src/components/ui/button.tsx` | Replace `emerald-500` focus ring with `ring-primary`, `emerald-600` default bg with `bg-primary`, `emerald-700` hover with `hover:bg-primary/90`, link variant `emerald-600` with `text-primary` |
| `src/components/ui/checkbox.tsx` | Replace `emerald-500/600` checked states with `bg-primary` and `border-primary` |
| `src/components/ui/dialog.tsx` | Replace `emerald-500` focus ring with `ring-primary` |
| `src/components/ui/progress.tsx` | Replace `emerald-500` bar with `bg-primary` |
| `src/components/ui/progress-bar.tsx` | Replace `emerald-600/500` bar with `bg-primary` |
| `src/components/ui/radio-group.tsx` | Replace `emerald-600/500` colors with `text-primary`, `fill-primary` |
| `src/components/ui/select.tsx` | Replace `emerald-500` focus ring with `ring-primary` |
| `src/components/ui/spinner.tsx` | Replace `emerald-600` border with `border-primary` |

---

## Priority 2: Core App Components (12 files)

| File | Change |
|------|--------|
| `src/App.tsx` | Line 94: Replace `border-emerald-600` spinner with `border-primary` |
| `src/components/EnhancedOverview.tsx` | Replace `emerald-500/600/100/900` icon backgrounds and trending indicators with `primary` tokens |
| `src/components/DashboardWidgets.tsx` | Same as EnhancedOverview -- icon backgrounds and trending colors |
| `src/components/ProductivityDashboard.tsx` | Replace `emerald-100/600/900/400` focus score colors with `primary` tokens |
| `src/components/KanbanBoard.tsx` | Replace `emerald-500/50/950` verified column border and drag-over states with `primary` tokens |
| `src/components/TaskCalendar.tsx` | Replace `emerald-600` verified status color |
| `src/components/TaskEditDialog.tsx` | Replace `emerald-500` verified status dot |
| `src/components/TaskStatusIndicator.tsx` | Replace `emerald-50` gradient in approved status (keep green since it's semantic "success") |
| `src/components/TaskActions.tsx` | Replace `emerald-50/50` gradient background |
| `src/components/InternManagement.tsx` | Replace `emerald-100/800/900/300` team lead badge colors |
| `src/components/common/FeaturePlaceholder.tsx` | Replace `emerald-100/700/900/400` finance category color |
| `src/components/tasks/EnhancedSubtaskList.tsx` | Replace `emerald-500/100` verified status |

---

## Priority 3: Page-Level Components (16 files)

| File | Change |
|------|--------|
| `src/pages/Pricing.tsx` | Line 111: Replace `emerald-500/10` starter gradient with `primary/10` |
| `src/pages/Privacy.tsx` | Lines 25-26, 171: Replace `emerald-100/900/600` icon bg and button colors |
| `src/pages/super-admin/OrganizationDetail.tsx` | Replace `emerald-500` active badges |
| `src/pages/super-admin/SuperAdminDashboard.tsx` | Replace `emerald-500/600` active org stats |
| `src/pages/super-admin/OrganizationsList.tsx` | Replace `emerald-500/600` active badges and menu items |
| `src/pages/super-admin/CreateOrganization.tsx` | Replace `emerald-500/600` password strength indicators |
| `src/pages/TaskDetailPage.tsx` | Replace `emerald-100/800/900` verified status badge |
| `src/pages/ProjectDetailPage.tsx` | Replace `emerald-100/800/900/400` completed status |
| `src/pages/Tutorial.tsx` | Replace `emerald-500` payroll feature highlight |
| `src/pages/settings/RolesPermissions.tsx` | Replace `emerald-100/800/900/300` team lead role color |
| `src/pages/admin/OrganizationSettings.tsx` | Update Emerald Green theme preset name/reference |
| `src/components/super-admin/SuperAdminLayout.tsx` | Replace `emerald-600` active org count |
| `src/components/servicedesk/TicketAnalytics.tsx` | Replace `emerald-50/600/700/950` SLA on-track colors |
| `src/components/training/VideoProgressTracker.tsx` | Replace `emerald-500/50/800/300/950` completion states |
| `src/components/project-detail/ProjectSprintsTab.tsx` | Replace `emerald-100/800/900` completed badge |
| `src/components/project-detail/ProjectTasksTab.tsx` | Replace `emerald-100/800/900/400` verified status |

---

## Priority 4: Baseline & RBAC Components (7 files)

| File | Change |
|------|--------|
| `src/components/baselines/ProjectHealthScorecard.tsx` | Replace `emerald-500/600/50/950` healthy status colors with success/primary tokens |
| `src/components/baselines/BaselineComparisonChart.tsx` | Replace `emerald-500/600` positive variance colors |
| `src/components/rbac/OrgChartViewer.tsx` | Replace `emerald-500/50/950` team lead node colors |
| `src/components/rbac/RoleEditor.tsx` | Replace `emerald-500` team lead role color |
| `src/components/rbac/TeamRoleAssignment.tsx` | Replace `emerald-100/800/900/300` team lead role badge |
| `src/components/timesheets/TimesheetSummaryCards.tsx` | Replace `emerald-50/900` revenue card gradient |

---

## Remaining Files (searched but with fewer occurrences)

Any additional files found with `emerald` references in the search results will also be updated with the same pattern:
- Semantic success/healthy indicators: Use `text-green-600` or `hsl(var(--success))` 
- Branding/accent colors: Use `primary` CSS variable tokens
- Status-specific verified/completed: Use `primary` or `success` tokens

---

## Approach for Color Replacement

The replacement strategy is contextual:

1. **Brand/accent colors** (buttons, links, focus rings, badges used for branding): Replace with `primary` CSS variable tokens (e.g., `bg-primary`, `text-primary`, `ring-primary`)

2. **Success/healthy status indicators** (health scores, on-track SLA, password strength): Replace with `text-green-600` / `bg-green-500` since green is semantically correct for "success" -- these are NOT emerald-brand colors, they are status colors

3. **Role-specific badge colors** (team_lead, supervisor): These use emerald/teal as a differentiating color in a multi-color palette. Replace with `bg-sky-100 text-sky-800` (blue family) to align with the new blue theme

---

## Total Files to Update: ~43 files

All changes are color-class replacements with no logic changes. The UI primitives (Priority 1) will have the biggest visual impact since they propagate to every page.
