

# Enterprise Feature Expansion Plan - Wave 2 UI Implementation

## Current State Analysis

The Wave 1 database schema and hooks have been successfully implemented:

**Existing Backend (Hooks Ready):**
- `useMyWork.tsx` - Aggregates tasks, requests, tickets, approvals, meetings
- `useServiceDesk.tsx` - Full ticketing CRUD with SLA calculations
- `useEntityComments.tsx` - Generic comments for all entity types
- `useProjectFinancials.tsx` - Cost/revenue tracking with margin analytics
- `useCompliance.tsx` - GRC checkpoint management
- `useResourceRoles.tsx` - Role-based allocation planning
- `usePortfolios.tsx` / `usePrograms.tsx` - Portfolio management already exists

**Missing UI Components:**
- No `src/components/mywork/` directory
- No `src/components/servicedesk/` directory  
- No `src/components/grc/` directory
- No `src/components/portfolio/` KPI components
- No `src/components/collaboration/` activity feed components

---

## Implementation Plan

### Phase 1: My Work Center (Unified Workspace)

Create a unified "My Work" center where users see all assigned items.

**New Files:**
```text
src/components/mywork/
  MyWorkCenter.tsx           - Main container with filters and list
  WorkItemCard.tsx           - Generic card for task/request/ticket/approval
  WorkItemFilters.tsx        - Filter bar: Today/Week/Overdue/Type
  QuickActionPanel.tsx       - Inline actions: status change, time log
```

**Navigation Updates:**
- Add "My Work" to both admin and intern navigation in `navigation.ts`
- Register `my-work` in `tab-registry.ts`

**Features:**
- Smart prioritization (overdue first, then today, then by priority)
- Filter by type (tasks, requests, tickets, approvals, meetings)
- Filter by period (Today, This Week, Overdue, All)
- Quick actions: change status, log time, add comment
- Color-coded priority and SLA indicators

---

### Phase 2: Service Desk Hub

Create a full ITSM ticketing interface.

**New Files:**
```text
src/components/servicedesk/
  ServiceDeskHub.tsx         - Main container with tabs
  TicketList.tsx             - Filterable ticket queue with SLA indicators
  TicketDetail.tsx           - Full ticket view with timeline
  TicketForm.tsx             - Create/edit ticket dialog
  SLATracker.tsx             - SLA countdown timer component
  TicketMetrics.tsx          - Summary cards: open, in-progress, breached
  SLARulesConfig.tsx         - Admin: configure SLA rules per type/priority
```

**Navigation Updates:**
- Add "Service Desk" to admin Work Management group
- Register `service-desk` in `tab-registry.ts`

**Features:**
- Ticket queue with status/type/priority filters
- Real-time SLA countdown timers with breach warnings
- Ticket detail with activity timeline
- Major incident workflow indicator
- Quick assign and status change
- Metrics dashboard: MTTR, FCR, SLA compliance

---

### Phase 3: Collaboration Components

Create reusable collaboration widgets for all entities.

**New Files:**
```text
src/components/collaboration/
  ActivityFeed.tsx           - Generic activity stream
  CommentThread.tsx          - Comments with replies and @mentions
  DecisionLog.tsx            - Filter view for decision comments
  FollowButton.tsx           - Follow/unfollow toggle
  MentionInput.tsx           - Rich input with @mention autocomplete
```

**Integration Points:**
- Add ActivityFeed to project detail pages
- Add CommentThread to ticket detail, request detail
- Add FollowButton to project headers
- Add DecisionLog to project controls

---

### Phase 4: Portfolio KPI Dashboard

Enhance existing PortfolioManagement with KPI widgets.

**New Files:**
```text
src/components/portfolio/
  PortfolioKPIDashboard.tsx  - ROI, NPS, health metrics widgets
  StrategicAlignmentView.tsx - OKR linkage visualization
  ScenarioPlanningTool.tsx   - What-if project add/remove analysis
  PortfolioRollupMetrics.tsx - Aggregate metrics from programs/projects
```

**Existing Files to Modify:**
- `PortfolioManagement.tsx` - Add KPI dashboard section
- `PortfolioDetailPage.tsx` - Add scenario planning tab

---

### Phase 5: GRC Compliance Tracker

Create compliance checkpoint management UI.

**New Files:**
```text
src/components/grc/
  ComplianceHub.tsx              - Main GRC interface
  CheckpointManager.tsx          - Define compliance checkpoints
  ProjectComplianceTracker.tsx   - Track compliance per project
  ComplianceStatusBadge.tsx      - Visual status indicator
  WaiverRequestDialog.tsx        - Request waiver for mandatory items
```

**Navigation Updates:**
- Add to Project Controls group in navigation
- Register `compliance` tab (update existing finance/ComplianceManagement redirect)

---

### Phase 6: Role-Based Resource Planning

Enhance resource allocation with role planning.

**New Files:**
```text
src/components/resources/
  RoleCatalog.tsx            - Manage resource roles with rates
  RoleBasedPlanner.tsx       - Allocate roles to projects by week
  AllocationHeatmap.tsx      - Visual utilization by role/team
  BookingTypeToggle.tsx      - Soft vs hard booking switch
```

**Existing Files to Modify:**
- `ResourceAllocation.tsx` - Add role-based planning tab

---

### Phase 7: Project Financials Tab

Create financial tracking UI for projects.

**New Files:**
```text
src/components/finance/
  ProjectFinancialsTab.tsx   - Main financial view for a project
  CostBreakdownChart.tsx     - Pie chart: labor vs non-labor, capex vs opex
  ForecastVsActuals.tsx      - Bar chart: budget vs spent variance
  MarginAnalytics.tsx        - Gross margin tracking
  CostItemForm.tsx           - Add/edit cost items
  RevenueItemForm.tsx        - Add/edit revenue items
```

**Integration:**
- Add "Financials" tab to project detail pages
- Link from portfolio dashboard to drill-down

---

## Navigation & Tab Registry Updates

**navigation.ts additions:**
```typescript
// Main group (both admin and intern)
{ title: "My Work", url: "my-work", icon: Inbox }

// Work Management group (admin)
{ title: "Service Desk", url: "service-desk", icon: Headphones }

// Admin Tools
{ title: "Role Catalog", url: "role-catalog", icon: Users2 }
```

**tab-registry.ts additions:**
```typescript
'my-work': {
  component: lazy(() => import('@/components/mywork/MyWorkCenter')),
},
'service-desk': {
  component: lazy(() => import('@/components/servicedesk/ServiceDeskHub')),
  adminOnly: true,
},
'role-catalog': {
  component: lazy(() => import('@/components/resources/RoleCatalog')),
  adminOnly: true,
},
```

---

## File Summary

### New Files to Create (28 files)

**My Work (4 files):**
- `src/components/mywork/MyWorkCenter.tsx`
- `src/components/mywork/WorkItemCard.tsx`
- `src/components/mywork/WorkItemFilters.tsx`
- `src/components/mywork/QuickActionPanel.tsx`

**Service Desk (7 files):**
- `src/components/servicedesk/ServiceDeskHub.tsx`
- `src/components/servicedesk/TicketList.tsx`
- `src/components/servicedesk/TicketDetail.tsx`
- `src/components/servicedesk/TicketForm.tsx`
- `src/components/servicedesk/SLATracker.tsx`
- `src/components/servicedesk/TicketMetrics.tsx`
- `src/components/servicedesk/SLARulesConfig.tsx`

**Collaboration (5 files):**
- `src/components/collaboration/ActivityFeed.tsx`
- `src/components/collaboration/CommentThread.tsx`
- `src/components/collaboration/DecisionLog.tsx`
- `src/components/collaboration/FollowButton.tsx`
- `src/components/collaboration/MentionInput.tsx`

**Portfolio (4 files):**
- `src/components/portfolio/PortfolioKPIDashboard.tsx`
- `src/components/portfolio/StrategicAlignmentView.tsx`
- `src/components/portfolio/ScenarioPlanningTool.tsx`
- `src/components/portfolio/PortfolioRollupMetrics.tsx`

**GRC (5 files):**
- `src/components/grc/ComplianceHub.tsx`
- `src/components/grc/CheckpointManager.tsx`
- `src/components/grc/ProjectComplianceTracker.tsx`
- `src/components/grc/ComplianceStatusBadge.tsx`
- `src/components/grc/WaiverRequestDialog.tsx`

**Resources (3 files):**
- `src/components/resources/RoleCatalog.tsx`
- `src/components/resources/RoleBasedPlanner.tsx`
- `src/components/resources/AllocationHeatmap.tsx`

### Files to Modify (3 files)

- `src/config/navigation.ts` - Add new nav items
- `src/pages/dashboard/tab-registry.ts` - Register new tabs
- `src/components/project/PortfolioManagement.tsx` - Add KPI section

---

## Implementation Priority

| Phase | Feature | Complexity | User Impact |
|-------|---------|------------|-------------|
| 1 | My Work Center | Medium | High - unified view for all users |
| 2 | Service Desk | High | High - operational ticket management |
| 3 | Collaboration | Medium | Medium - activity feeds everywhere |
| 4 | Portfolio KPIs | Medium | Medium - executive visibility |
| 5 | GRC Compliance | Medium | Medium - regulated industries |
| 6 | Role Planning | Medium | Low - advanced resource management |
| 7 | Project Financials | Medium | Medium - financial tracking |

---

## Technical Notes

### My Work Aggregation Pattern
The `useMyWork` hook already implements smart prioritization:
1. Overdue items first
2. Today items next
3. Then by priority (critical > urgent > high > medium > low)
4. Finally by due date

### SLA Calculation
The `useServiceDesk` hook calculates SLA status in real-time:
- Response SLA: breached if `first_response_at` is null and past `sla_response_due`
- Resolution SLA: breached if `resolved_at` is null and past `sla_resolution_due`
- Time remaining displayed as "Xh Ym" or "Breached by Xh Ym"

### Entity Comments Pattern
Generic comment system works for any entity:
```typescript
const { comments, addComment, markAsDecision } = useEntityComments('project', projectId);
```

All hooks are organization-scoped and follow existing patterns.
