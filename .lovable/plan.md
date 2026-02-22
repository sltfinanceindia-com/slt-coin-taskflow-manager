

# TeneXA Audit Fix -- February 22, 2026

## Issue: 13+ Duplicate `user_roles` Database Queries Per Page Load

### Problem
The `useUserRole` hook uses raw `useState` + `useEffect` with direct Supabase calls instead of React Query's `useQuery`. Since 94 components import this hook, every component instance triggers its own independent database fetch for the same `user_roles` data. Network logs show **13+ identical queries** on a single page load, each taking 200ms-2.7 seconds. This causes:
- Slow page loads (cumulative 10+ seconds of wasted API calls)
- Unnecessary database load
- Supabase rate limit risk

### Root Cause
In `src/hooks/useUserRole.tsx`, every call to `useUserRole()` runs its own `useEffect` → `supabase.from('user_roles').select(...)`. React Query would automatically deduplicate these into a single fetch via shared cache, but the hook doesn't use it.

### Fix: Convert `useUserRole` to use React Query

Replace the `useState` + `useEffect` pattern with `useQuery` from `@tanstack/react-query`. This ensures:
- All 94+ component instances share ONE cached query result
- Only ONE network request fires per session (with 5-minute stale time)
- Automatic refetching when the user changes

### Technical Details

**File changed:** `src/hooks/useUserRole.tsx`

**Before (current):**
```typescript
const [roleData, setRoleData] = useState<UserRoleData>({...});
useEffect(() => {
  const fetchUserRole = async () => {
    const { data } = await supabase.from('user_roles').select('role, organization_id')...
    setRoleData({...});
  };
  fetchUserRole();
}, [user, profile]);
```

**After (fixed):**
```typescript
import { useQuery } from '@tanstack/react-query';

const { data: roleRecords } = useQuery({
  queryKey: ['user-role', user?.id],
  queryFn: async () => {
    const { data } = await supabase.from('user_roles').select('role, organization_id')
      .eq('user_id', user!.id);
    return data;
  },
  enabled: !!user,
  staleTime: 1000 * 60 * 5, // 5 minutes - role rarely changes
});
// Derive all role flags from cached query result using useMemo
```

### Impact
- Network requests: **13+ queries reduced to 1** per page load
- Page load time improvement: **2-5 seconds faster**
- No UI changes -- all 94 consuming components work identically
- No database changes needed

### All Other Tabs Status
- **22+ tabs verified WORKING with data** (Dashboard, Kanban, Projects, HR Analytics, Leave, Bonus, Attendance, etc.)
- **50+ tabs EMPTY BUT FUNCTIONAL** (need data entry, not broken)
- **0 broken tabs remaining** after previous fixes

