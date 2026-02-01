
# TeneXA Structure Verification & Gap Closure Plan

## Current State Summary

After the previous implementation phases, the TeneXA application now has:

| Area | Status | Coverage |
|------|--------|----------|
| Navigation Structure | Complete | 8 role-specific configs |
| Tab Registry | Complete | 90+ lazy-loaded modules |
| Quick Actions | Complete | 13 role-based actions |
| Features Page | Complete | Hash-based navigation |
| New Components | Complete | 8 new components created |
| Typography | Complete | Applied to tables/sidebar |

---

## Remaining Issues Identified

### Issue 1: Missing Route Definitions

**Problem:** The `standaloneRoutes` config includes `/calendar` and `/help` but these routes don't exist in `App.tsx`.

**Impact:** Users clicking "Calendar" or "Help" in navigation will see 404 errors.

**Fix Required:**
- Add `/calendar` route pointing to a Calendar standalone page
- Add `/help` route pointing to a Help Center page

---

### Issue 2: Duplicate Navigation URLs

**Problem:** In some navigation configs, multiple items point to the same URL:

```text
{ title: "Kanban Board", url: "tasks" }
{ title: "All Tasks", url: "tasks" }
```

**Impact:** Both menu items show the same page, which may confuse users.

**Fix Required:**
- Create distinct views or use URL parameters to differentiate (e.g., `tasks?view=kanban` vs `tasks?view=list`)

---

### Issue 3: "My Salary Slips" Not Distinct for Employees

**Specification:**
```
Payroll & Finance (visible to Admin, Org Admin, Finance Manager, HR Admin)
└─ My Salary Slips (All Employees)
```

**Current State:** Employees see "Payroll" in Finance navigation which loads the admin PayrollManagement component.

**Fix Required:**
- Create a dedicated "My Payslips" tab/component for employees
- Show simplified employee view of their own salary slips only

---

### Issue 4: Recognition Module Incomplete

**Specification includes:**
- Give Recognition
- Awards & Badges
- Spot Bonuses
- Employee of Month
- Recognition Feed

**Current State:** Only "Kudos Wall" and "Coins" exist.

**Fix Required:**
- Enhance recognition section with Awards & Badges component
- Add Employee of Month functionality

---

## Implementation Plan

### Phase 1: Add Missing Routes (Priority: High)

**File:** `src/App.tsx`

Add routes:
```typescript
<Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
<Route path="/help" element={<HelpCenterPage />} />
```

**New Pages to Create:**
1. `src/pages/CalendarPage.tsx` - Standalone calendar with personal/team/company views
2. `src/pages/HelpCenterPage.tsx` - Help center with FAQs, guides, support tickets

---

### Phase 2: Fix Duplicate Navigation URLs

**Files to modify:**
- `src/config/navigation/pm-groups.ts`
- `src/config/navigation/admin-groups.ts`

**Changes:**
- Update "Kanban Board" to use `url: "tasks?view=kanban"`
- Keep "All Tasks" as `url: "tasks"`
- Update TasksTab component to read view query parameter

---

### Phase 3: Create Employee Payslips View

**New Component:** `src/components/employee/MyPayslipsView.tsx`

**Features:**
- List of employee's own salary slips
- Download PDF functionality
- YTD summary
- Tax information

**Tab Registry Update:**
```typescript
'my-payslips': {
  component: lazy(() => import('@/components/employee/MyPayslipsView')),
  internOnly: true, // Or allowedRoles for all non-admin
}
```

**Navigation Update:**
- Add "My Payslips" to employee-groups.ts Finance section

---

### Phase 4: Enhance Recognition Module

**New Components:**
1. `src/components/recognition/AwardsBadgesManagement.tsx`
2. `src/components/recognition/EmployeeOfMonth.tsx`
3. `src/components/recognition/RecognitionFeed.tsx`

**Tab Registry Updates:**
```typescript
'awards-badges': { component: lazy(() => import(...)) },
'employee-of-month': { component: lazy(() => import(...)) },
'recognition-feed': { component: lazy(() => import(...)) },
```

---

## Technical Details

### CalendarPage Component Structure

```text
src/pages/CalendarPage.tsx
├─ StandalonePageLayout wrapper
├─ Tabs: My Calendar | Team Calendar | Company Calendar
├─ Views: Day | Week | Month | Agenda
├─ Event sources:
│  ├─ Shifts (from attendance module)
│  ├─ Leaves (from leave module)
│  ├─ Meetings (from meetings module)
│  ├─ Tasks (from tasks module)
│  ├─ Holidays (from holidays module)
│  └─ Training (from training module)
└─ Quick actions: Create Event, Apply Leave, Book Meeting
```

### HelpCenterPage Component Structure

```text
src/pages/HelpCenterPage.tsx
├─ StandalonePageLayout wrapper
├─ Sections:
│  ├─ Getting Started (onboarding guide)
│  ├─ User Guides (by module)
│  ├─ Video Tutorials (embedded)
│  ├─ FAQs (searchable)
│  └─ Contact Support
└─ Search functionality across all content
```

---

## Files to Create/Modify

| Priority | File | Action |
|----------|------|--------|
| P0 | `src/pages/CalendarPage.tsx` | Create |
| P0 | `src/pages/HelpCenterPage.tsx` | Create |
| P0 | `src/App.tsx` | Add routes |
| P1 | `src/config/navigation/pm-groups.ts` | Fix duplicate URLs |
| P1 | `src/config/navigation/admin-groups.ts` | Fix duplicate URLs |
| P1 | `src/pages/dashboard/tabs/TasksTab.tsx` | Add view parameter handling |
| P2 | `src/components/employee/MyPayslipsView.tsx` | Create |
| P2 | `src/config/navigation/employee-groups.ts` | Add My Payslips |
| P2 | `src/pages/dashboard/tab-registry.ts` | Add new tabs |
| P3 | `src/components/recognition/AwardsBadgesManagement.tsx` | Create |
| P3 | `src/components/recognition/EmployeeOfMonth.tsx` | Create |

---

## Summary

The TeneXA application structure is approximately **95% complete** after the previous implementation phases. The remaining work focuses on:

1. **Route completeness** - Adding missing `/calendar` and `/help` routes
2. **UX refinement** - Fixing duplicate navigation URLs
3. **Employee self-service** - Adding dedicated payslips view
4. **Recognition enhancement** - Completing the awards & badges module

All changes follow the existing architectural patterns and maintain role-based access control throughout.
