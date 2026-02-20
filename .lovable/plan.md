

# TeneXA Tab Audit Results & Fix Plan

## Critical Issues Found

### Issue 1: Tasks Tab -- Default "Current" Tab Always Empty
**Status:** BROKEN (data exists but not visible)
**Root Cause:** The Kanban board defaults to the "Current" tab which only shows unassigned tasks (`!task.assigned_to && status === 'assigned'`). Since all 6 tasks in the org are assigned to a user, the default view is always empty. The user sees "No tasks in Current" even though Assigned: 1 and Verified: 1 exist.

**Fix:** Change the default tab from `'current'` to `'assigned'` in `TabBasedKanban.tsx` (line 59). This way users see their assigned tasks first, which is the most useful default.

### Issue 2: Overview Dashboard -- Shows "0 Hours This Week" Despite 3 Time Logs
**Status:** PARTIAL (data mismatch)
**Root Cause:** The dashboard widgets (`EnhancedDashboardWidgets`) likely filter time_logs by the current user's profile ID and current week. The 3 time_logs are dated Dec 2025 and Jan 2026 (old data), and may be logged by the other user (`slthostels@gmail.com`). The "Total Tasks: 2" only counts parent tasks, which is correct.

**Fix:** The dashboard widgets need to aggregate org-wide data for admins rather than just current user data. Review `EnhancedDashboardWidgets` to ensure admin users see organization-wide stats.

### Issue 3: OKRs Tab -- Blank/Skeleton Cards Rendering
**Status:** BROKEN (UI renders empty cards)
**Root Cause:** The OKR component loads but shows blank gray cards instead of proper content. This is likely a rendering issue where the component structure loads but data binding fails silently. Need to inspect the OKRManagement component.

**Fix:** Review `OKRManagement.tsx` to fix the card rendering -- ensure proper loading states and empty-state messaging instead of blank cards.

### Issue 4: Sidebar Role Flicker
**Status:** INTERMITTENT
**Root Cause:** On initial page load or fast tab switches, the `useUserRole` hook hasn't resolved yet, causing the sidebar to briefly show "Employee" navigation instead of "Admin" navigation. After a few seconds it corrects itself, but during that window, admin-only tabs are hidden.

**Fix:** Add a loading guard in `AppSidebar` that prevents rendering the navigation until the role is fully resolved, or cache the last-known role to prevent flicker.

## Tabs Verified as Working

| Tab | Status | Data |
|-----|--------|------|
| Overview | WORKS | Shows 2 tasks, 1 high priority, task distribution chart |
| Projects | WORKS | Shows "SLT Hostels Marketing", 50% completion, budget |
| Time Logs | WORKS | Shows 3 entries with correct task names and hours |
| Attendance | WORKS | Clock in/out with live time display |
| Leave | WORKS | Shows leave management (no balances configured yet) |
| Sprint Planning | WORKS | Shows 1 sprint "test" with correct dates and status |
| Payroll | WORKS | Shows 2 employees, correct processed amount |

## Tabs That Are Empty (No Data Entered Yet -- Not Broken)

These tabs load correctly but have no data because the admin hasn't created records yet. They are working as designed:
- WFH, Shifts, Holidays, Comp-Off, On-Call, Shift Swap
- Expenses, Loans, Documents, Assets
- All Finance sub-tabs (Tax, Salary Structure, Bonus, etc.)
- All Employee Lifecycle tabs (Onboarding, Exit, Contracts, etc.)
- All HR Analytics tabs
- All Recruitment tabs
- Budget Planning, Cost Centers
- Meeting Notes, Decisions, Lessons Learned
- Risk Register, Issue Tracker
- Templates (Project/Task/Recurring)

## Implementation Plan

### Fix 1: Change Kanban Default Tab (Quick Win)
**File:** `src/components/kanban/TabBasedKanban.tsx`
- Change line 59: `useState<StatusTab>('current')` to `useState<StatusTab>('assigned')`
- This immediately shows assigned tasks as the default view

### Fix 2: Fix Overview Dashboard Stats for Admins
**File:** `src/components/EnhancedDashboardWidgets.tsx`
- Ensure admin users see org-wide task counts and hours
- Fix "Hours This Week" to aggregate across all org members for admins
- Fix "Completion Rate" to reflect actual task completion

### Fix 3: Fix OKRs Page Blank Cards
**File:** `src/components/performance/OKRManagement.tsx`
- Inspect and fix the card rendering to show proper content or empty states
- Replace blank skeleton cards with proper "No OKRs created yet" messaging

### Fix 4: Prevent Sidebar Role Flicker
**File:** `src/components/AppSidebar.tsx`
- Add loading guard before rendering navigation
- Cache last-known role to prevent brief "Employee" flash

### Technical Details

All fixes are frontend-only code changes. No database migrations needed.

| Fix | File | Type | Impact |
|-----|------|------|--------|
| 1 | TabBasedKanban.tsx | 1 line change | Tasks tab shows data immediately |
| 2 | EnhancedDashboardWidgets.tsx | Logic update | Overview shows correct org stats |
| 3 | OKRManagement.tsx | UI fix | OKRs renders properly |
| 4 | AppSidebar.tsx | Loading guard | No sidebar flicker |

