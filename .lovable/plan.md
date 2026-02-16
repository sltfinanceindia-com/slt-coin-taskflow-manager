

# Fix: Organization Data Not Fetching, Database Errors, and Unconnected Pages

This plan addresses three categories of issues found across the TeneXA codebase after a thorough audit of 134+ hooks, the tab registry, and the navigation configuration.

---

## Category 1: Missing Organization Filtering (Data Leaking Across Orgs)

These hooks query Supabase tables WITHOUT filtering by `organization_id`, which means they either return data from all organizations (security leak) or fail with RLS errors if policies are restrictive.

### Fix 1.1: `useCommunication.tsx` -- Channels query missing org filter
- **File:** `src/hooks/useCommunication.tsx` (line 182-185)
- **Problem:** `fetchChannels()` queries `communication_channels` without `.eq('organization_id', profile.organization_id)`
- **Fix:** Add `.eq('organization_id', profile.organization_id)` to the channels query

### Fix 1.2: `useCommunication.tsx` -- Presence query missing org filter
- **File:** `src/hooks/useCommunication.tsx` (line 147-149)
- **Problem:** `user_presence` in `fetchTeamMembers()` fetches ALL presence records across orgs
- **Fix:** Add `.eq('organization_id', profile.organization_id)` or filter client-side by known team member IDs

### Fix 1.3: `usePresence.tsx` -- Presence list missing org filter
- **File:** `src/hooks/usePresence.tsx` (line 142-153)
- **Problem:** `fetchPresenceList()` queries ALL `user_presence` rows with no org filter
- **Fix:** Join with profiles to filter by organization, or add org filter if `user_presence` has the column

### Fix 1.4: `useGroups.tsx` -- Entire hook missing org isolation
- **File:** `src/hooks/useGroups.tsx` (lines 39-55, 58-100)
- **Problem:** `fetchGroups()` has NO org filter. `createGroup()` does not set `organization_id`. This is a complete bypass of multi-tenancy.
- **Fix:**
  - Add `useAuth()` import and get `profile`
  - Add `.eq('organization_id', profile.organization_id)` to fetchGroups query
  - Add `organization_id: profile?.organization_id` to the insert in `createGroup`

---

## Category 2: Unconnected Pages (Sidebar items with no tab component)

These navigation items appear in the sidebar but have no corresponding entry in `tab-registry.ts`, so clicking them shows the fallback `<EnhancedDashboardWidgets />` instead of a meaningful page.

### Fix 2.1: `attendance-reports` -- Missing from tab registry
- **File:** `src/pages/dashboard/tab-registry.ts`
- **Problem:** `attendance-reports` is listed in admin sidebar (`src/config/navigation/admin-groups.ts` line 151) but has no entry in `tabRegistry`
- **Fix:** Add an `attendance-reports` entry to `tabRegistry` that loads an `AttendanceReports` component. Since no dedicated component exists, create a simple wrapper that reuses the existing `AttendanceTracker` or `AnalyticsPage` with attendance-scoped data. Alternatively, create a new `src/components/workforce/AttendanceReports.tsx` component.

### Fix 2.2: `my-goals` -- Missing from tab registry (standalone route exists but no page)
- **File:** `src/pages/dashboard/tab-registry.ts` and route config
- **Problem:** `my-goals` is in the standalone routes map pointing to `/my-goals` but no route or page component exists
- **Fix:** Either create a `/my-goals` page that shows the user's OKRs filtered to their own, OR redirect to the OKRs tab with a personal filter

---

## Category 3: Performance & Data Issues

### Fix 3.1: `useActivityLogs.tsx` -- No pagination on 6500+ row query
- **File:** `src/hooks/useActivityLogs.tsx` (line 55-63)
- **Problem:** Queries ALL `activity_logs` for the organization without `.limit()`. This table has 6536+ rows and growing, causing slow loads.
- **Fix:** Add `.limit(500)` to the query to cap the initial load. The UI already only shows "today's" logs via `getActivityStats`, so the full dataset isn't needed.

---

## Implementation Details

### File: `src/hooks/useCommunication.tsx`

**Change 1 (line 182-185):** Add org filter to channels query
```typescript
const { data: channelsData, error: channelsError } = await supabase
  .from('communication_channels')
  .select('*')
  .eq('organization_id', profile.organization_id)  // ADD THIS
  .order('last_message_at', { ascending: false, nullsFirst: false });
```

**Change 2 (line 147-149):** Filter presence to org team members only
```typescript
const teamMemberIds = (profiles || []).map(p => p.id);
const { data: presenceData } = await supabase
  .from('user_presence')
  .select('*')
  .in('user_id', teamMemberIds);  // Only get presence for org members
```

### File: `src/hooks/usePresence.tsx`

**Change (line 140-153):** Add org-based filtering to presence list
```typescript
const fetchPresenceList = async () => {
  if (!profile?.organization_id) return;
  
  // Get org member IDs first
  const { data: orgMembers } = await supabase
    .from('profiles')
    .select('id')
    .eq('organization_id', profile.organization_id)
    .eq('is_active', true);
  
  const memberIds = orgMembers?.map(m => m.id) || [];
  
  const { data, error } = await supabase
    .from('user_presence')
    .select(`*, profile:user_id (id, full_name, avatar_url, role)`)
    .in('user_id', memberIds)
    .order('last_activity_at', { ascending: false });
  // ... rest unchanged
```

### File: `src/hooks/useGroups.tsx`

**Changes:**
1. Import `useAuth` and get `profile`
2. Add `.eq('organization_id', profile.organization_id)` to `fetchGroups`
3. Add `organization_id: profile?.organization_id` to `createGroup` insert
4. Guard fetches with `if (!profile?.organization_id) return`

### File: `src/hooks/useActivityLogs.tsx`

**Change (line 63):** Add limit to prevent loading 6500+ rows
```typescript
.eq('organization_id', profile.organization_id)
.order('timestamp', { ascending: false })
.limit(500);  // ADD THIS
```

### File: `src/pages/dashboard/tab-registry.ts`

**Change:** Add missing `attendance-reports` entry
```typescript
'attendance-reports': {
  component: lazy(() => import('@/components/workforce/AttendanceReports').then(m => ({ default: m.AttendanceReports }))),
  adminOnly: true,
},
```

### New File: `src/components/workforce/AttendanceReports.tsx`

Create a simple attendance reports component that reuses existing attendance data with summary statistics and charts.

### File: `src/config/navigation/index.ts` (or route config)

**Change:** Either create a `/my-goals` page or update `standaloneRoutes` to redirect `my-goals` to `/dashboard?tab=okrs`

---

## Summary

| Category | Files Changed | Issue Count |
|----------|--------------|-------------|
| Missing org filter | 4 hooks | 4 fixes |
| Unconnected pages | tab-registry + 1 new component + nav config | 2 fixes |
| Performance | 1 hook | 1 fix |
| **Total** | **7 files modified, 1 new file** | **7 fixes** |

