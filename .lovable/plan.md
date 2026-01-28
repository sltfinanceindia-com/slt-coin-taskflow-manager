
# Complete Audit & Fix Plan: Convert Mock Data to Real Database Data

## Summary

After a thorough audit of the sidebar pages and dashboard components, I found **16+ components** that are using hardcoded mock data instead of fetching real data from Supabase. These components appear to work but show fake/placeholder data that doesn't reflect the organization's actual information.

## Components Identified with Mock Data

### Work Management Components (High Priority)
| Component | File | Issue |
|-----------|------|-------|
| Decisions Management | `src/components/work/DecisionsManagement.tsx` | Returns hardcoded array with "Adopt TypeScript" and "Switch to Supabase" |
| Lessons Learned | `src/components/work/LessonsLearnedManagement.tsx` | Returns hardcoded retrospective data |
| Meeting Notes | `src/components/work/MeetingNotesManagement.tsx` | Returns hardcoded "Weekly Sprint Planning" data |
| Recurring Tasks | `src/components/work/RecurringTasksManagement.tsx` | Returns hardcoded recurring task list |
| Work Calendars | `src/components/work/WorkCalendarsManagement.tsx` | Returns simulated calendar events |
| Shift Swap | `src/components/work/ShiftSwapManagement.tsx` | Returns simulated swap requests |
| On-Call | `src/components/work/OnCallManagement.tsx` | Returns simulated on-call schedules |
| Remote Policies | `src/components/work/RemotePoliciesManagement.tsx` | Returns hardcoded policy data |
| Project Templates | `src/components/work/ProjectTemplatesManagement.tsx` | Returns hardcoded template list |
| Task Templates | `src/components/work/TaskTemplatesManagement.tsx` | Returns hardcoded template list (but hook exists) |

### Components That Are Already Connected (Good)
- `OvertimeManagement.tsx` - Uses `time_logs` table
- `CompOffManagement.tsx` - Uses `leave_requests` table
- `SprintManagement.tsx` - Uses `projects` table (repurposed)
- `BacklogManagement.tsx` - Uses `tasks` table
- `TaxManagement.tsx` - Uses `tax_declarations` table

## Solution Architecture

### Phase 1: Create Missing Database Tables

We need to create these new tables with proper RLS policies:

1. **`decisions`** - Track project decisions
2. **`lessons_learned`** - Store retrospective learnings
3. **`meeting_notes`** - Store meeting documentation
4. **`recurring_tasks`** - Define recurring task patterns
5. **`calendar_events`** - Store work calendar events
6. **`shift_swaps`** - Track shift swap requests
7. **`on_call_schedules`** - Track on-call rotations
8. **`remote_policies`** - Store WFH policies
9. **`project_templates`** - Store project templates
10. **`template_tasks`** - Store tasks within templates

### Phase 2: Create Hooks for Each Table

For each table, create a hook following the existing pattern (e.g., `useBenefits.tsx`):

```text
src/hooks/
├── useDecisions.tsx
├── useLessonsLearned.tsx
├── useMeetingNotes.tsx
├── useRecurringTasks.tsx (update existing)
├── useCalendarEvents.tsx
├── useShiftSwaps.tsx
├── useOnCallSchedules.tsx
├── useRemotePolicies.tsx
├── useProjectTemplates.tsx
└── useTemplateDetails.tsx
```

Each hook will include:
- Query with organization filtering
- Create mutation
- Update mutation
- Delete mutation
- Proper query invalidation

### Phase 3: Update Components

Update each component to:
1. Import and use the new hook
2. Replace mock data `queryFn` with real database queries
3. Wire up Create/Edit/Delete buttons to actual mutations
4. Add proper loading, error, and empty states

## Technical Details

### Database Schema Design

**decisions table:**
```sql
CREATE TABLE decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  title TEXT NOT NULL,
  description TEXT,
  context TEXT,
  alternatives TEXT[],
  rationale TEXT,
  impact TEXT CHECK (impact IN ('low', 'medium', 'high')),
  status TEXT CHECK (status IN ('pending', 'approved', 'implemented', 'rejected')),
  decision_maker_id UUID REFERENCES profiles(id),
  stakeholders TEXT[],
  decision_date DATE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**lessons_learned table:**
```sql
CREATE TABLE lessons_learned (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  title TEXT NOT NULL,
  project_id UUID REFERENCES projects(id),
  project_name TEXT,
  category TEXT,
  what_went_well TEXT[],
  what_went_wrong TEXT[],
  recommendations TEXT[],
  impact TEXT CHECK (impact IN ('low', 'medium', 'high')),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**meeting_notes table:**
```sql
CREATE TABLE meeting_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  title TEXT NOT NULL,
  meeting_date DATE NOT NULL,
  attendees TEXT[],
  notes TEXT,
  action_items JSONB DEFAULT '[]',
  decisions TEXT[],
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**recurring_tasks table:**
```sql
CREATE TABLE recurring_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  title TEXT NOT NULL,
  description TEXT,
  frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'bi-weekly', 'monthly', 'quarterly')),
  assigned_to UUID REFERENCES profiles(id),
  next_occurrence DATE,
  last_created DATE,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**shift_swaps table:**
```sql
CREATE TABLE shift_swaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  requester_id UUID NOT NULL REFERENCES profiles(id),
  target_id UUID NOT NULL REFERENCES profiles(id),
  original_shift TEXT NOT NULL,
  requested_shift TEXT NOT NULL,
  swap_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reason TEXT,
  approved_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**on_call_schedules table:**
```sql
CREATE TABLE on_call_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  user_id UUID NOT NULL REFERENCES profiles(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  rotation_type TEXT CHECK (rotation_type IN ('daily', 'weekly', 'bi-weekly', 'monthly')),
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')),
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**remote_policies table:**
```sql
CREATE TABLE remote_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  description TEXT,
  max_wfh_days INTEGER DEFAULT 2,
  requires_approval BOOLEAN DEFAULT true,
  eligibility_criteria TEXT,
  equipment_allowance DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**project_templates table:**
```sql
CREATE TABLE project_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  estimated_duration INTEGER, -- days
  is_public BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**calendar_events table:**
```sql
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  title TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  event_type TEXT CHECK (event_type IN ('meeting', 'deadline', 'leave', 'holiday', 'task')),
  attendees TEXT[],
  description TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### RLS Policies (Same Pattern for All Tables)

Each table will have:
1. SELECT policy: Users can read data from their organization
2. INSERT policy: Users can insert into their organization
3. UPDATE policy: Users can update their organization's data
4. DELETE policy: Admins can delete from their organization

### Hook Implementation Pattern

Each hook will follow this structure:
```typescript
export function useDecisions() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['decisions', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('decisions')
        .select('*, decision_maker:profiles!decision_maker_id(full_name)')
        .eq('organization_id', profile?.organization_id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id
  });

  const createMutation = useMutation({...});
  const updateMutation = useMutation({...});
  const deleteMutation = useMutation({...});

  return {
    decisions: data || [],
    isLoading,
    error,
    createDecision: createMutation.mutateAsync,
    updateDecision: updateMutation.mutateAsync,
    deleteDecision: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
}
```

### Component Update Pattern

Each component update will:
1. Replace the mock `queryFn` with the hook
2. Wire up form submission to `createMutation`
3. Wire up Edit button to open dialog with pre-filled data
4. Wire up Delete button to `deleteMutation`
5. Add proper toast notifications

## Files to Create

| File | Purpose |
|------|---------|
| `supabase/migrations/xxx_work_management_tables.sql` | Create all new tables with RLS |
| `src/hooks/useDecisions.tsx` | CRUD hook for decisions |
| `src/hooks/useLessonsLearned.tsx` | CRUD hook for lessons |
| `src/hooks/useMeetingNotes.tsx` | CRUD hook for meeting notes |
| `src/hooks/useCalendarEvents.tsx` | CRUD hook for calendar events |
| `src/hooks/useShiftSwaps.tsx` | CRUD hook for shift swaps |
| `src/hooks/useOnCallSchedules.tsx` | CRUD hook for on-call |
| `src/hooks/useRemotePolicies.tsx` | CRUD hook for remote policies |
| `src/hooks/useProjectTemplates.tsx` | CRUD hook for project templates |

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/work/DecisionsManagement.tsx` | Use `useDecisions` hook, wire up CRUD |
| `src/components/work/LessonsLearnedManagement.tsx` | Use `useLessonsLearned` hook |
| `src/components/work/MeetingNotesManagement.tsx` | Use `useMeetingNotes` hook |
| `src/components/work/RecurringTasksManagement.tsx` | Update to use real hook |
| `src/components/work/WorkCalendarsManagement.tsx` | Use `useCalendarEvents` hook |
| `src/components/work/ShiftSwapManagement.tsx` | Use `useShiftSwaps` hook |
| `src/components/work/OnCallManagement.tsx` | Use `useOnCallSchedules` hook |
| `src/components/work/RemotePoliciesManagement.tsx` | Use `useRemotePolicies` hook |
| `src/components/work/ProjectTemplatesManagement.tsx` | Use `useProjectTemplates` hook |
| `src/components/work/TaskTemplatesManagement.tsx` | Use existing `useTaskTemplates` hook properly |
| `src/integrations/supabase/types.ts` | Update with new table types |

## Implementation Order

1. **Phase 1**: Run database migration (create all tables)
2. **Phase 2**: Create all hooks (9 new hooks)
3. **Phase 3**: Update components one by one
4. **Phase 4**: Test each feature end-to-end

## Estimated Changes

- **9 new hooks** to create
- **10 components** to update
- **1 database migration** with 10 tables
- **Total files**: ~20 files to create/modify

This comprehensive fix will ensure all sidebar pages display real organization-specific data with full CRUD functionality.
