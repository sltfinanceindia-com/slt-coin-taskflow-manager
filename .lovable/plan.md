
# TeneXA Complete Application Fix Plan

## Root Cause Analysis

After thorough investigation of the codebase, database, and application structure, I've identified the core issues. The application has **properly implemented hooks and components** but suffers from:

1. **Empty Database Tables**: Key tables (`departments`, `teams`, `locations`, `custom_roles`) have zero records
2. **Missing Relationships**: `profile.department_id` is NULL for all 27 users
3. **Navigation Complexity**: The dashboard uses a tab-based system with 100+ tabs defined in `tab-registry.ts`
4. **Role Selection Limitation**: The "Add Team Member" form doesn't dynamically load custom roles from the database

---

## Phase 1: Fix "Add Team Member Roles" - Dynamic Role Loading

### Issue #2A: Role Dropdown Shows Only 8 Static Options

**File**: `src/components/InternManagement.tsx` (Lines 334-352)

**Current State**: Hardcoded 8 roles in the dropdown

**Fix**: Load custom roles from database AND system roles

Changes Required:
1. Add query to fetch custom_roles from database
2. Combine system roles with custom roles in dropdown
3. Show both pre-defined roles and organization-created custom roles

```
Technical Implementation:
- Import useCustomRoles hook
- Query custom_roles table filtered by organization_id
- Map custom roles to SelectItems
- Append to existing 8 system roles
```

---

## Phase 2: Fix Employee Cards - Show Department & Details

### Issue #2B: Employee Cards Missing Department Info

**File**: `src/components/InternManagement.tsx` (Lines 84-91)

**Current State**: Query doesn't JOIN with departments table

**Fix**: 
1. Update the query to include department relationship
2. Display department badge on employee cards
3. Show additional details (designation, location, joining date)

Changes Required:
```
Query update:
.select(`
  *,
  department:departments!profiles_department_id_fkey(id, name, color),
  designation:designations!profiles_designation_id_fkey(id, name)
`)
```

Add to card display:
- Department badge with color
- Designation title
- Join date
- Location if available

---

## Phase 3: Fix "My Work" Dashboard Data Loading

### Issue #1: My Work Not Loading Data

**Root Cause Analysis**:
- `useMyWork` hook correctly queries multiple tables
- Tables have data: 55 tasks, 151 time_logs, 3 meetings
- The issue is that tasks must be assigned to the current user (`assigned_to = profile.id`)

**Verification Needed**:
1. Check if tasks have `assigned_to` populated correctly
2. Verify user's profile.id matches task assignments

**Potential Fix**:
- If no tasks are assigned, show helpful "No assigned work" message
- Add quick task self-assignment option
- Ensure task creation properly assigns to users

---

## Phase 4: Fix Empty Tables - Department, Teams, Locations

### Issues #5-6: These tables exist but have ZERO records

**Current State (Database Query Results)**:
- departments: 0 rows
- teams: 0 rows  
- locations: 0 rows
- custom_roles: 0 rows

**The UI is Working Correctly** - Components properly show "No departments found - Create your first department" empty states

**User Action Required**: Users need to ADD data to these tables

**Enhancement**: Add helpful onboarding prompts when tables are empty:
1. Department Management: Show quick-start wizard
2. Team Management: Link to create team after department exists
3. Location Management: Add sample location template

---

## Phase 5: Fix Role Creation 

### Issue #23: Creating Role Not Working

**File**: `src/hooks/useCustomRoles.tsx`

**Current State**: The `createRoleMutation` function is properly implemented (Lines 108-161)

**Potential Issues**:
1. RLS policies may be blocking inserts
2. Form validation may be failing silently
3. Missing required fields in the form

**Fix Required**:
1. Add debug logging to mutation
2. Verify RLS policy on `custom_roles` table allows inserts
3. Ensure all required fields are passed from the form

```
RLS Policy Check:
- Verify INSERT policy exists for authenticated users
- Check organization_id is correctly passed
- Validate role_type enum matches allowed values
```

---

## Phase 6: Fix Sidebar Navigation Reset

### Issue #25: Sidebar Resets When Clicking Certain Tabs

**File**: `src/components/AppSidebar.tsx`

**Current State**: 
- Lines 138-141: Loads open groups from localStorage
- Lines 144-150: Saves to localStorage on toggle

**Root Cause**: When navigating to standalone routes (Training, Roles, etc.), the page changes completely causing sidebar remount

**Navigation Flow Analysis**:
```
Dashboard Tab (e.g., "overview") → stays in ModernDashboard component
Standalone Route (e.g., "training") → navigates to /training page entirely

This causes:
1. ModernDashboard unmounts
2. Training page mounts with different layout
3. On return, sidebar state may not persist
```

**Fix Required**:
1. Persist sidebar state in React context (not just localStorage)
2. Use consistent layout wrapper across all pages
3. Add animation/transition to prevent jarring state changes
4. Ensure standalone pages also use AppSidebar with same state

---

## Phase 7: Fix Role-Based Dashboards

### Issue #26: All Users See Same Dashboard

**File**: `src/pages/dashboard/tabs/OverviewTab.tsx`

**Current State**: Already has role-based rendering:
```typescript
if (isHRAdmin && !isAdmin) return <HRAdminDashboard />;
if (isFinanceManager && !isAdmin) return <FinanceManagerDashboard />;
if (isProjectManager && !isAdmin) return <ProjectManagerDashboard />;
if (isManager || isTeamLead) return <ManagerDashboard />;
if (isAdmin) return <EnhancedDashboardWidgets />;
return <EmployeeDashboard />;
```

**The Logic is Correct** - Issue is role detection

**Root Cause**: Users don't have proper roles assigned in `user_roles` table

**Database Check**:
- user_roles table has entries but mostly "intern" or "employee"
- Need to verify correct role assignment for test users

**Fix**: 
1. Verify `useUserRole` hook correctly reads from `user_roles` table
2. Ensure role assignment in InternManagement saves to `user_roles` table
3. Test with users having different roles

---

## Phase 8: Fix Card Alignment

### Issue #0: Inconsistent Card Heights

**Files**: 
- `src/components/EnhancedDashboardWidgets.tsx`
- `src/components/AnalyticsPage.tsx`

**Current State**: Cards already use `h-full` classes

**Additional Fix**:
1. Add `min-h-[200px]` to prevent collapse
2. Use `items-start` on grid to prevent stretching
3. Standardize all card content structure

---

## Phase 9: Fix Attendance Regularization

### Issue #7: Already Fixed!

**File**: `src/components/workforce/AttendanceRegularization.tsx`

**Current State**: Component is fully functional with:
- Real Supabase queries (Lines 64-88)
- Create mutation (Lines 91-129)
- Approve/Reject mutations (Lines 132-172)

**Verification Needed**: 
- Test the flow end-to-end
- Ensure RLS allows operations

---

## Database Schema Recommendations

### Tables That Need Data (User Action):
1. `departments` - Create at least one department
2. `teams` - Create teams after departments exist  
3. `locations` - Add office locations
4. `custom_roles` - Define custom roles if needed

### Columns That Need Data:
1. `profiles.department_id` - Assign users to departments
2. `profiles.designation_id` - Assign designations
3. `tasks.assigned_to` - Assign tasks to users
4. `profiles.reporting_manager_id` - Set up org chart hierarchy

---

## Implementation Priority

### Immediate (Phase 1-2):
1. Add dynamic custom role loading to InternManagement
2. Enhance employee cards with department display
3. Add department_id JOIN to profile queries

### Short-term (Phase 3-5):
4. Fix role creation RLS policies
5. Improve empty state messaging
6. Add onboarding wizards for empty tables

### Medium-term (Phase 6-8):
7. Fix sidebar navigation context
8. Ensure consistent layouts across routes
9. Standardize card alignment

---

## Files to Modify

| File | Changes | Priority |
|------|---------|----------|
| `src/components/InternManagement.tsx` | Add custom roles query, enhance employee cards | High |
| `src/components/AppSidebar.tsx` | Add context-based state persistence | Medium |
| `src/pages/dashboard/tabs/OverviewTab.tsx` | Already correct, verify role detection | Low |
| `src/hooks/useCustomRoles.tsx` | Add debug logging, verify RLS | High |
| `src/components/EnhancedDashboardWidgets.tsx` | Add min-height, align cards | Low |
| RLS Policies | Verify INSERT on custom_roles | High |

---

## Testing Checklist

After implementation:
1. Create a department and verify it appears in management
2. Create a team and assign to department
3. Add a custom role and verify it appears in Add Team Member dropdown
4. Assign an employee to the new role
5. Verify role-based dashboard shows correct view
6. Navigate between dashboard tabs and standalone pages
7. Verify sidebar state persists across navigation
8. Check My Work shows assigned tasks

