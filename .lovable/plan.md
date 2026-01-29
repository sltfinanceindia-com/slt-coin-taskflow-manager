

# Comprehensive Fix Plan: Application Issues & Missing Features

## Summary

After thorough investigation, I identified 14 distinct issues across multiple modules. Each issue has been traced to root causes including missing database tables, mock data still in use, disconnected components, and missing CRUD operations.

---

## Issue Analysis & Solutions

### Issue 1: Sprint Planning Actions Not Functioning

**Root Cause:** The `sprints` table does NOT exist in the database. The current `SprintManagement.tsx` component is repurposing the `projects` table to simulate sprints.

**Solution:**
1. Create a proper `sprints` table with correct schema
2. Update `useSprints.tsx` hook to query the real `sprints` table
3. Update `SprintManagement.tsx` to use the hook with real mutations

**Files to Create:**
- Database migration for `sprints` table

**Files to Modify:**
- `src/hooks/useSprints.tsx` - Remove `(supabase as any)` cast, use real queries
- `src/components/sprints/SprintManagement.tsx` - Use `useSprints` hook instead of inline queries to `projects`

---

### Issue 2: Task Templates Not Actionable

**Root Cause:** `TaskTemplatesManagement.tsx` (lines 42-80) returns hardcoded mock data in its `queryFn` and doesn't use the existing `useTaskTemplates` hook.

**Solution:**
1. Replace mock `queryFn` with `useTaskTemplates` hook
2. Wire up Create, Edit, Delete buttons to real mutations
3. Implement "Use Template" action to create actual task from template

**Files to Modify:**
- `src/components/work/TaskTemplatesManagement.tsx` - Complete rewrite to use `useTaskTemplates` hook

---

### Issue 3: Projects Not Loading in Timesheet Tab

**Root Cause:** The `TimesheetManagement.tsx` component (line 143-156) fetches projects correctly, but the `EnhancedTimesheetEntry.tsx` may not be passing the projects prop correctly.

**Solution:**
1. Verify project data is passed to entry dialog
2. Check if `projects` table has `organization_id` filter working
3. Add loading state for projects dropdown

**Files to Modify:**
- `src/components/timesheets/TimesheetManagement.tsx` - Verify project fetch
- `src/components/timesheets/EnhancedTimesheetEntry.tsx` - Ensure projects prop works

---

### Issue 4: Timesheet Calendar Not Displaying

**Root Cause:** The TimesheetManagement component has a week-based view but no actual calendar component. The summary cards and entry list work, but there's no visual calendar.

**Solution:**
1. Add a calendar view component that shows timesheet entries visually
2. Create a toggle between list view and calendar view
3. Integrate with the existing week navigation

**Files to Create:**
- `src/components/timesheets/TimesheetCalendarView.tsx` - Visual calendar for timesheets

**Files to Modify:**
- `src/components/timesheets/TimesheetManagement.tsx` - Add calendar view toggle

---

### Issue 5: Remove Overtime Tab - Integrate into Timesheet

**Root Cause:** Overtime is tracked separately in `OvertimeManagement.tsx` but should be part of the main timesheet workflow.

**Solution:**
1. Add overtime hours field in timesheet entry form (already exists as `overtime_hours`)
2. Show overtime summary in timesheet summary cards
3. Add overtime filtering option in timesheet view
4. Keep `OvertimeManagement` for admin review but link to timesheet data

**Files to Modify:**
- `src/components/timesheets/TimesheetManagement.tsx` - Highlight overtime tracking
- `src/components/timesheets/TimesheetSummaryCards.tsx` - Already shows overtime

---

### Issue 6: Work Calendar Not Syncing Across Pages

**Root Cause:** Multiple calendar components exist (`WorkCalendarsManagement`, `CalendarHub`, `CalendarIntegration`) that all fetch from `calendar_events` table but don't share state or sync properly.

**Solution:**
1. Create a centralized calendar context/provider
2. Ensure all calendar components use the same `useCalendarEvents` hook
3. Add real-time subscription for calendar updates

**Files to Create:**
- `src/context/CalendarContext.tsx` - Shared calendar state

**Files to Modify:**
- `src/components/work/WorkCalendarsManagement.tsx` - Use shared context
- `src/components/calendar/CalendarHub.tsx` - Use shared context
- `src/components/communication/CalendarIntegration.tsx` - Use shared context

---

### Issue 7: Meeting Schedule Events Not Appearing in Main Calendar

**Root Cause:** `OneOnOneMeetings` component uses `one_on_one_meetings` table while the main calendar uses `calendar_events` table. No sync between them.

**Solution:**
1. When creating a 1:1 meeting, also create a corresponding `calendar_events` entry
2. Add database trigger or mutation to sync meetings to calendar
3. Display meeting type indicator in calendar

**Files to Modify:**
- `src/hooks/usePerformanceManagement.tsx` - Add calendar event creation in `createOneOnOneMeeting` mutation
- `src/components/performance/OneOnOneMeetings.tsx` - Sync with calendar

---

### Issue 8: Database Error When Creating CompOff Requests

**Root Cause:** The `leave_requests` table requires `leave_type_id` (NOT NULL), but `CompOffManagement.tsx` (line 74) sets it to `null`.

**Solution:**
1. Create a default "Comp-Off" leave type in the database
2. Query for this leave type and use its ID when creating comp-off requests
3. Add error handling for missing leave type

**Files to Modify:**
- `src/components/work/CompOffManagement.tsx` - Fetch comp-off leave type, set `total_days` field

**Database Changes:**
- Add migration to insert default "Comp-Off" leave type for organizations

---

### Issue 9: Multiple Workday Features Missing

**Root Cause:** Several placeholders exist in `WorkManagementFeatures.tsx` that aren't connected to real components.

**Solution:**
- The tab registry already points to real components for most features
- Verify each work management route loads the correct component
- Fix any components still showing `FeaturePlaceholder`

**Files to Review:**
- `src/pages/dashboard/tabs/WorkManagementFeatures.tsx` - Replace remaining placeholders
- `src/pages/dashboard/tab-registry.ts` - Verify all routes

---

### Issue 10: Payroll Actions Not Working / Database Errors

**Root Cause:** `PayrollManagement.tsx` (lines 50-80) queries `timesheets` table instead of proper `payroll_runs` table. It uses `(supabase as any)` casting and random values.

**Solution:**
1. The database already has `payroll_runs` and `payroll_records` tables
2. Create a proper `usePayroll` hook
3. Update PayrollManagement to use real payroll data

**Files to Create:**
- `src/hooks/usePayroll.tsx` - Proper CRUD for `payroll_runs` and `payroll_records`

**Files to Modify:**
- `src/components/finance/PayrollManagement.tsx` - Use real payroll hook

---

### Issue 11: WorkFront Features Missing - Needs Audit

**Root Cause:** No "WorkFront" named feature exists. This may refer to the main work management area.

**Solution:**
1. Audit all sidebar work management items
2. Ensure each points to functional component
3. Add missing features based on requirement

**Items to Verify:**
- Sprint Planning, Backlog, Milestones, Dependencies, Risks, Issues
- Resources, Workload, Overtime, Comp-Off, On-Call, Shift Swap
- Remote Policies, Project/Task Templates, Recurring Tasks
- Meeting Notes, Decisions, Lessons Learned, Work Calendars

---

### Issue 12: Dashboard Customization Not Working

**Root Cause:** `DashboardBuilder.tsx` queries `dashboard_widgets` table correctly, but the save mutation (line 96-118) may fail on updating widgets that don't exist in DB (default widgets have id like 'default-1').

**Solution:**
1. Fix the save logic - check if widget exists before update, use upsert
2. Ensure default widgets are created in DB on first use
3. Add proper error handling

**Files to Modify:**
- `src/components/dashboard/DashboardBuilder.tsx` - Fix save mutation to handle new/default widgets

---

### Issue 13: Organization Settings Not Functioning

**Root Cause:** `OrganizationSettings.tsx` uses fields like `timezone`, `date_format`, `currency`, `enabled_features` that may not exist in the `organizations` table, causing silent failures.

**Solution:**
1. Verify all organization settings fields exist in database
2. Add missing columns via migration if needed
3. Use proper type casting instead of `as any`

**Database Changes:**
- Add missing columns to `organizations` table:
  - `timezone`, `date_format`, `currency`, `first_day_of_week`
  - `enabled_features` (JSONB)
  - `notification_settings` (JSONB)
  - `security_settings` (JSONB)

**Files to Modify:**
- `src/pages/admin/OrganizationSettings.tsx` - Remove `as any` casts after schema update

---

### Issue 14: Application-Wide Layout Issues with Basic UI Components

**Root Cause:** Inconsistent padding, spacing issues on mobile/desktop transitions.

**Solution:**
1. Already fixed Kanban bottom padding
2. Review other components for similar issues
3. Ensure consistent use of `pb-20 md:pb-0` for mobile bottom nav spacing

**Files to Review:**
- All tab components in `src/pages/dashboard/tabs/`
- Main layout components

---

## Database Migrations Required

```text
Migration 1: Create `sprints` table
- id, organization_id, project_id, name, goal, start_date, end_date
- status, velocity, total_story_points, completed_story_points
- created_by, created_at, updated_at

Migration 2: Add missing organization settings columns
- timezone TEXT DEFAULT 'Asia/Kolkata'
- date_format TEXT DEFAULT 'DD/MM/YYYY'
- currency TEXT DEFAULT 'INR'
- first_day_of_week INTEGER DEFAULT 1
- enabled_features JSONB
- notification_settings JSONB
- security_settings JSONB

Migration 3: Create default Comp-Off leave type (per organization)
- Trigger function to create on organization creation
```

---

## Implementation Priority

| Priority | Issue | Complexity | Impact |
|----------|-------|------------|--------|
| High | #8 CompOff DB Error | Low | Blocks feature |
| High | #10 Payroll DB Errors | Medium | Blocks feature |
| High | #1 Sprint Planning | Medium | Core feature |
| High | #13 Org Settings | Medium | Admin critical |
| Medium | #2 Task Templates | Low | Workflow helper |
| Medium | #12 Dashboard Customization | Low | UX improvement |
| Medium | #3 Timesheet Projects | Low | Data visibility |
| Medium | #7 Meeting-Calendar Sync | Medium | Feature integration |
| Medium | #6 Calendar Sync | Medium | Data consistency |
| Low | #4 Timesheet Calendar | Medium | Nice to have |
| Low | #5 Overtime Integration | Low | UI preference |
| Low | #9 Workday Features | Medium | Placeholder cleanup |
| Low | #11 WorkFront Audit | Low | Documentation |
| Low | #14 Layout Issues | Low | Polish |

---

## Files to Create (Summary)

1. `supabase/migrations/YYYYMMDD_sprints_and_settings.sql`
2. `src/hooks/usePayroll.tsx`
3. `src/components/timesheets/TimesheetCalendarView.tsx` (optional)
4. `src/context/CalendarContext.tsx` (optional)

## Files to Modify (Summary)

1. `src/components/work/CompOffManagement.tsx` - Fix leave_type_id issue
2. `src/components/finance/PayrollManagement.tsx` - Use real payroll tables
3. `src/components/sprints/SprintManagement.tsx` - Use useSprints hook
4. `src/hooks/useSprints.tsx` - Query real sprints table
5. `src/components/work/TaskTemplatesManagement.tsx` - Use useTaskTemplates hook
6. `src/components/dashboard/DashboardBuilder.tsx` - Fix widget save logic
7. `src/pages/admin/OrganizationSettings.tsx` - After schema update
8. `src/hooks/usePerformanceManagement.tsx` - Sync meetings to calendar
9. `src/components/timesheets/TimesheetManagement.tsx` - Verify projects
10. Multiple calendar components - Ensure consistent data source

---

## Technical Notes

### CompOff Fix Pattern
```text
1. Query leave_types for type with name 'Comp-Off' or 'comp_off'
2. If not found, show error "Please configure Comp-Off leave type"
3. Use found leave_type_id in insert
4. Calculate total_days (required field)
```

### Dashboard Widget Save Fix Pattern
```text
1. Check if widget.id starts with 'default-'
2. If so, use INSERT instead of UPDATE
3. For existing widgets, use UPDATE
4. Consider using upsert for simplicity
```

### Sprint Table Schema
```text
sprints (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  project_id UUID REFERENCES projects(id),
  name TEXT NOT NULL,
  goal TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'cancelled')),
  velocity INTEGER DEFAULT 0,
  total_story_points INTEGER DEFAULT 0,
  completed_story_points INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
)
```

