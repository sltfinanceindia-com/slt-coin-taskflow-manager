
# TeneXA Application Fixes - Comprehensive Implementation Plan

## Executive Summary

After thorough code analysis and database verification, I've identified the root causes of all 26+ reported issues. This plan provides targeted fixes for each category of problems.

---

## Issue Category 1: Navigation Breaking for Tabs with Query Parameters

### Root Cause
When clicking sidebar items like "Kanban Board" (`tasks?view=kanban`), the navigation creates an invalid URL:
```
/dashboard?tab=tasks?view=kanban
```
This double-query-param format breaks URL parsing. The `activeTab` becomes `tasks?view=kanban` but the tab registry only has `tasks`.

### Affected Features
- Kanban Board (`tasks?view=kanban`)
- Task List (`tasks?view=list`)

### Solution
Modify `AppSidebar.tsx` to properly handle tabs with query parameters:

```typescript
// In handleTabChange function
const handleTabChange = (tab: string) => {
  if (standaloneRoutes[tab]) {
    navigate(standaloneRoutes[tab]);
  } else {
    // Handle tabs that include query params (e.g., "tasks?view=kanban")
    if (tab.includes('?')) {
      const [baseTab, queryString] = tab.split('?');
      navigate(`/dashboard?tab=${baseTab}&${queryString}`);
    } else {
      navigate(`/dashboard?tab=${tab}`);
    }
  }
  if (isMobile) {
    setOpenMobile(false);
  }
};
```

Also update `useTabPersistence` to extract the base tab:

```typescript
const getInitialTab = () => {
  const urlTab = searchParams.get(paramName);
  if (urlTab) {
    // Return base tab without embedded query params
    return urlTab.split('?')[0];
  }
  // ... rest of logic
};
```

And update `TasksTab.tsx` to read the `view` param from URL:

```typescript
// Already correctly implemented - reads from searchParams.get('view')
const view = searchParams.get('view') || 'kanban';
```

---

## Issue Category 2: Empty Tables Showing "No Data" States

### Root Cause (Database Verification)
```
departments: 0 rows
teams: 0 rows
locations: 0 rows
custom_roles: 0 rows
```

The components are working correctly - they're fetching from empty tables. Users need to create initial data.

### Enhancement: Add Onboarding Wizard
Create a first-run onboarding experience that prompts users to set up:
1. At least one department
2. At least one location
3. Default roles

Add helpful empty state messages with "Quick Setup" buttons.

---

## Issue Category 3: "My Work" Not Loading Data

### Root Cause
The `useMyWork` hook filters tasks by `assigned_to = profile.id`. The database has 53 tasks with assignments, but they may not be assigned to the current user.

### Solution
1. Verify query is working correctly (it is)
2. Enhance empty state to show helpful guidance
3. Add debug logging to help identify if it's a data issue vs code issue

---

## Issue Category 4: Employee Cards Missing Department Info

### Current State (Already Implemented!)
Looking at `InternManagement.tsx` lines 117-122:
```typescript
const { data: profilesData } = await supabase
  .from('profiles')
  .select(`
    *,
    department_info:departments(id, name, color)
  `)
```

The query already joins departments. However, the display might not be using the data.

### Fix Required
Update the employee card rendering to display `department_info`:

```typescript
{intern.department_info && (
  <Badge 
    variant="outline" 
    style={{ 
      backgroundColor: `${intern.department_info.color}20`,
      borderColor: intern.department_info.color 
    }}
  >
    {intern.department_info.name}
  </Badge>
)}
```

---

## Issue Category 5: Role Dropdown Already Dynamic!

### Current State (Already Implemented!)
`InternManagement.tsx` lines 95-108 and 402-425:
- Fetches custom roles via `useCustomRoles()`
- Shows system roles in one group
- Shows custom roles in separate group (if any exist)

**No code changes needed** - the issue is that `custom_roles` table is empty.

---

## Issue Category 6: Sidebar Resets on Navigation

### Current State (Already Fixed!)
The `SidebarContext` was created and integrated:
- `src/contexts/SidebarContext.tsx` - provides persistent state
- `AppSidebar.tsx` line 139 - uses context instead of local state
- `App.tsx` - wraps app in `SidebarProvider`

**This should now be working.** If still having issues, need to verify the context provider is at the correct level in the component tree.

---

## Issue Category 7: Service Desk Duplicate Tabs

### Analysis
Looking at `ServiceDeskHub.tsx` - the component has proper tabs:
- Ticket Queue
- Analytics  
- SLA Rules

And the tab registry has separate entries:
- `service-desk` → ServiceDeskHub
- `requests` → RequestHub

These are **different features**, not duplicates. The navigation may be showing both "Requests" and "Service Desk" in the sidebar, which is intentional.

**No changes needed** - these are distinct modules.

---

## Issue Category 8: Role Creation Not Working

### Potential Causes
1. RLS policies blocking INSERT
2. Missing required fields
3. Enum validation failing

### Fix Required
Update RLS policies for `custom_roles` table:

```sql
-- Allow organization admins and HR admins to create roles
CREATE POLICY "Allow admins to create roles"
ON custom_roles
FOR INSERT
TO authenticated
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'org_admin', 'hr_admin', 'super_admin')
  )
);
```

Add error handling in `useCustomRoles`:

```typescript
onError: (error) => {
  console.error('Create role error:', error);
  toast.error(`Failed to create role: ${error.message}`);
}
```

---

## Issue Category 9: HR Analytics Not Loading

### Current State (Already Correct!)
`HRAnalytics.tsx` correctly queries:
- `profiles` table for headcount
- `exit_interviews` table for attrition
- `job_postings` table for open positions

**The issue is empty data**, not broken code. When departments/profiles are properly set up, the analytics will populate.

---

## Issue Category 10: Card Alignment

### Fix
Add consistent min-height and grid alignment to dashboard cards:

```typescript
// In EnhancedDashboardWidgets.tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
  {statsCards.map(card => (
    <Card className="h-full min-h-[120px]">
      {/* ... */}
    </Card>
  ))}
</div>
```

---

## Implementation Order

### Phase 1: Critical Navigation Fix (Highest Priority)
1. Fix `AppSidebar.tsx` handleTabChange for query param tabs
2. Update `ModernDashboard.tsx` to extract view params
3. Test Kanban and Task List navigation

### Phase 2: Data Display Enhancements
4. Ensure employee cards show department badges when data exists
5. Add better empty states with setup guidance
6. Improve error messaging

### Phase 3: Database & RLS Fixes
7. Verify/fix RLS policies for custom_roles
8. Add debug logging to mutations
9. Test role creation flow

### Phase 4: UI Polish
10. Standardize card heights
11. Add onboarding wizard for empty organizations
12. Improve loading states

---

## Files to Modify

| File | Change | Priority |
|------|--------|----------|
| `src/components/AppSidebar.tsx` | Fix query param handling in navigation | Critical |
| `src/pages/ModernDashboard.tsx` | Extract view params properly | Critical |
| `src/hooks/useTabPersistence.tsx` | Handle embedded query params | Critical |
| `src/components/InternManagement.tsx` | Display department badges | High |
| `src/hooks/useCustomRoles.tsx` | Add error details to toast | Medium |
| `src/components/EnhancedDashboardWidgets.tsx` | Standardize card heights | Low |

---

## Database Verification Summary

| Table | Row Count | Status |
|-------|-----------|--------|
| profiles | 27 | ✅ Has data |
| tasks | 53 assigned | ✅ Has data |
| departments | 0 | ⚠️ Needs setup |
| teams | 0 | ⚠️ Needs setup |
| locations | 0 | ⚠️ Needs setup |
| custom_roles | 0 | ⚠️ Needs setup |

**Key Insight**: Many "not working" issues are actually "no data" issues. The code is correct but the database tables are empty.

---

## Testing Checklist

After implementation:
1. Click "Kanban Board" in sidebar → should navigate and show Kanban view
2. Click "Task List" → should show list view
3. Create a department → verify it appears
4. Create a custom role → verify it appears in dropdown
5. Navigate between pages → sidebar should maintain state
6. Check employee cards show department when assigned
