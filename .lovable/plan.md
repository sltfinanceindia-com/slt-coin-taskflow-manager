
# Enterprise Feature Expansion Plan

## Executive Summary

This plan adds 10 major modules and 3 end-to-end flows to transform the application into a Workfront/Workday-class enterprise platform. The implementation builds on existing architecture including portfolios, programs, work requests, OKRs, and templates.

---

## Current Architecture Analysis

### What Already Exists (Leverage These)
| Feature | Status | Location |
|---------|--------|----------|
| Portfolio Management | Implemented | `usePortfolios.tsx`, `PortfolioManagement.tsx` |
| Program Management | Implemented | `usePrograms.tsx` |
| Work Requests | Implemented | `useWorkRequests.tsx`, `RequestHub.tsx` |
| Scoring Models | Implemented | `useScoringModels.tsx`, `ScoringHub.tsx` |
| Project Templates | Implemented | `useProjectTemplates.tsx`, `TemplateLibrary.tsx` |
| OKR/Objectives | Implemented | `usePerformanceManagement.tsx`, `OKRManagement.tsx` |
| Task Comments | Implemented | `useTaskComments.tsx` with @mentions |
| Risks & Issues | Implemented | `useProjectRisks.tsx`, `useIssues.tsx` |
| Change Requests | Implemented | `useChangeRequests.tsx`, `ChangeRequestHub.tsx` |
| Self-Service Portal | Implemented | `EmployeeSelfServicePortal.tsx` |

### Gaps to Fill
- No unified "My Work" center aggregating all work items
- No service desk/ticketing system for operational work
- No project-OKR alignment tracking
- No role-based resource planning (vs. named resources only)
- No project-level financial forecasting
- No playbooks (combined templates + KB)
- No GRC compliance checkpoints
- No activity feed on all entities

---

## Phase 1: Database Schema Expansion

### 1.1 New Tables Required

```text
-- Strategic alignment: Link projects to OKRs
portfolio_objectives
  - id, portfolio_id, objective_id, alignment_score, notes

project_objectives
  - id, project_id, objective_id, contribution_weight, notes

-- Service Desk & Ticketing
service_tickets
  - id, organization_id, ticket_number, type (incident/request/change/problem)
  - title, description, priority, status, requester_id, assignee_id
  - sla_response_due, sla_resolution_due, first_response_at, resolved_at
  - category, subcategory, knowledge_article_id, major_incident (bool)
  - root_cause, resolution_notes

sla_rules
  - id, organization_id, name, ticket_type, priority
  - response_hours, resolution_hours, is_active

-- "My Work" aggregation (view, not table)
v_my_work
  - Unified view joining: tasks, work_requests, service_tickets, approvals, meetings

-- Role-based Resource Planning
resource_roles
  - id, organization_id, name, hourly_rate, skill_requirements

project_role_allocations
  - id, project_id, role_id, allocated_hours, allocation_type (soft/hard)
  - week_start, assigned_user_id (nullable for generic roles)

-- Project Financials
project_cost_items
  - id, project_id, type (labor/non_labor), description, amount
  - date_incurred, category (capex/opex)

project_revenue_items
  - id, project_id, description, amount, billing_date, status (forecast/actual)

-- Playbooks
playbooks
  - id, organization_id, name, description, category
  - template_id, kb_article_ids (array)

-- GRC Compliance
compliance_checkpoints
  - id, organization_id, name, description, regulation
  - required_stage (design/build/test/deploy), is_mandatory

project_compliance_status
  - id, project_id, checkpoint_id, status (pending/passed/failed/waived)
  - completed_by, completed_at, waiver_approved_by, notes

-- Entity Comments (generic for all entities)
entity_comments
  - id, entity_type (project/ticket/request/risk/etc), entity_id
  - user_id, content, mentions, attachments, is_decision (bool)
  - created_at

-- Entity Followers (follow/unfollow)
entity_followers
  - id, entity_type, entity_id, user_id, created_at
```

### 1.2 Extend Existing Tables

```text
-- Add to projects table
  objective_id UUID REFERENCES objectives(id)  -- Primary OKR alignment
  capex_budget DECIMAL
  opex_budget DECIMAL
  billing_model TEXT (fixed_price/time_material/retainer)
  client_id UUID

-- Add to work_requests table
  effort_score INTEGER  -- 1-5 scoring
  value_score INTEGER
  risk_score INTEGER
  compliance_impact BOOLEAN

-- Add to portfolios table
  strategic_alignment_score DECIMAL
  nps_score DECIMAL
  schedule_health TEXT (on_track/at_risk/delayed)
```

---

## Phase 2: Module Implementation

### 2.1 Enhanced Portfolio Layer (Extend Existing)

**Files to Modify:**
- `src/hooks/usePortfolios.tsx` - Add KPI calculations, OKR roll-up
- `src/components/project/PortfolioManagement.tsx` - Add KPI dashboard
- `src/pages/PortfolioDetailPage.tsx` - Add scenario planning

**New Features:**
- Portfolio KPIs widget: ROI, NPS, schedule health, risk score
- Strategic objective alignment view
- What-if scenario builder (add/remove projects, see capacity impact)
- Auto-calculate OKR contribution from child projects

**Components to Create:**
```text
src/components/portfolio/
  ├── PortfolioKPIDashboard.tsx    -- ROI, NPS, health metrics
  ├── StrategicAlignmentView.tsx   -- OKR linkage visualization
  ├── ScenarioPlanningTool.tsx     -- What-if analysis
  └── PortfolioRollupMetrics.tsx   -- Aggregate from programs/projects
```

---

### 2.2 Enhanced Work Intake (Extend Existing)

**Files to Modify:**
- `src/hooks/useWorkRequests.tsx` - Add scoring model integration
- `src/components/requests/RequestPortal.tsx` - Add effort/value/risk scoring
- `src/components/requests/TriageQueue.tsx` - Add auto-routing logic

**New Features:**
- Scoring model on request submission
- Auto-route to portfolio/operations queue based on type
- One-click convert to project (with template selection)
- Scoring comparison view for prioritization

**Components to Create:**
```text
src/components/requests/
  ├── RequestScoringForm.tsx      -- Effort/value/risk inputs
  ├── RoutingRulesEngine.tsx      -- Conditional routing logic
  └── RequestConversionWizard.tsx -- Convert to project/task flow
```

---

### 2.3 "My Work" Unified Workspace (NEW)

**New Hook:**
```text
src/hooks/useMyWork.tsx
  - Aggregates: tasks, work_requests, service_tickets, approvals, meetings, learning
  - Filters: Today, This Week, Overdue, Blocked
  - Quick actions: log time, change status, comment, delegate
```

**New Components:**
```text
src/components/mywork/
  ├── MyWorkCenter.tsx            -- Main unified view
  ├── WorkItemCard.tsx            -- Generic card for any work type
  ├── SmartPrioritization.tsx     -- AI-suggested prioritization
  ├── QuickActionPanel.tsx        -- Log time, status, comment
  └── WorkItemFilters.tsx         -- Today/Week/Overdue/Blocked
```

**Navigation:**
- Add to `src/config/navigation.ts` under "Main" for both admin and intern
- Register in `tab-registry.ts` as `my-work`

---

### 2.4 Advanced Resource & Role Management (Extend Existing)

**Files to Modify:**
- `src/hooks/useWorkload.tsx` - Add role-based allocation
- `src/components/resources/ResourceAllocation.tsx` - Role planning view

**New Features:**
- Role catalog management
- Plan by role before assigning people
- Soft vs hard bookings
- Utilization heatmaps by role/team/time

**New Components:**
```text
src/components/resources/
  ├── RoleCatalog.tsx             -- Manage resource roles
  ├── RoleBasedPlanner.tsx        -- Plan allocations by role
  ├── AllocationHeatmap.tsx       -- Visual utilization view
  └── BookingTypeToggle.tsx       -- Soft/hard booking controls
```

---

### 2.5 Project Financial Management (Extend Existing)

**Files to Modify:**
- `src/hooks/useEnhancedProjects.tsx` - Add financial tracking
- `src/components/project/ProjectDetail.tsx` - Add financials tab

**New Hook:**
```text
src/hooks/useProjectFinancials.tsx
  - CRUD for cost_items and revenue_items
  - Forecast vs actuals calculations
  - Margin analytics
```

**New Components:**
```text
src/components/finance/
  ├── ProjectFinancialsTab.tsx    -- Main financial view
  ├── CostBreakdownChart.tsx      -- Labor vs non-labor
  ├── ForecastVsActuals.tsx       -- Variance tracking
  ├── MarginAnalytics.tsx         -- Gross margin by project
  └── BillingSchedule.tsx         -- Revenue forecasting
```

---

### 2.6 Service Desk & Ticketing (NEW)

**New Hook:**
```text
src/hooks/useServiceDesk.tsx
  - CRUD for service_tickets
  - SLA timer calculations
  - Knowledge article suggestions
  - Major incident workflow
```

**New Components:**
```text
src/components/servicedesk/
  ├── ServiceDeskHub.tsx          -- Main ticketing interface
  ├── TicketList.tsx              -- Filterable ticket queue
  ├── TicketDetail.tsx            -- Full ticket view
  ├── TicketForm.tsx              -- Create/edit ticket
  ├── SLATracker.tsx              -- SLA countdown timers
  ├── KnowledgeSuggester.tsx      -- Auto-suggest KB articles
  ├── MajorIncidentPanel.tsx      -- War room, timeline, RCA
  └── TicketMetrics.tsx           -- MTTR, FCR, volume trends
```

**Navigation:**
- Add "Service Desk" to admin Work Management nav group
- Register as `service-desk` in tab-registry

---

### 2.7 Playbooks & Extended Templates (Extend Existing)

**Files to Modify:**
- `src/hooks/useTemplates.tsx` - Add playbook support
- `src/components/templates/TemplateLibrary.tsx` - Add playbook section

**New Hook:**
```text
src/hooks/usePlaybooks.tsx
  - Combine templates with KB articles
  - Versioning and usage tracking
```

**New Components:**
```text
src/components/templates/
  ├── PlaybookBuilder.tsx         -- Create playbooks
  ├── PlaybookViewer.tsx          -- Execute playbook steps
  └── IntakeFormBuilder.tsx       -- Dynamic request forms
```

---

### 2.8 Collaboration Layer (Extend Existing)

**Files to Modify:**
- `src/hooks/useTaskComments.tsx` - Already has mentions, extend to entities
- Create generic entity comments hook

**New Hook:**
```text
src/hooks/useEntityComments.tsx
  - Works for any entity type (project, ticket, request, risk, etc.)
  - @mentions with notifications
  - Mark as decision
  - Attachments support
```

**New Hook:**
```text
src/hooks/useEntityFollowers.tsx
  - Follow/unfollow any entity
  - Notification subscriptions
```

**New Components:**
```text
src/components/collaboration/
  ├── ActivityFeed.tsx            -- Generic activity stream
  ├── CommentThread.tsx           -- Enhanced comment display
  ├── DecisionLog.tsx             -- Filter for decision comments
  ├── FollowButton.tsx            -- Follow/unfollow toggle
  └── MentionInput.tsx            -- @mention autocomplete
```

---

### 2.9 GRC (Governance, Risk & Compliance) (Extend Existing)

**Files to Modify:**
- `src/hooks/useProjectRisks.tsx` - Extend with GRC fields
- `src/components/work/RiskManagement.tsx` - Add compliance view

**New Hook:**
```text
src/hooks/useCompliance.tsx
  - Manage compliance checkpoints
  - Track project compliance status
  - Exception/waiver workflow
```

**New Components:**
```text
src/components/grc/
  ├── ComplianceCheckpointManager.tsx  -- Define checkpoints
  ├── ProjectComplianceTracker.tsx     -- Status per project
  ├── PolicyMapping.tsx                -- Link to regulations
  └── ExceptionWorkflow.tsx            -- Waiver approval flow
```

---

### 2.10 OKR & Strategy Alignment (Extend Existing)

**Files to Modify:**
- `src/hooks/usePerformanceManagement.tsx` - Add project linkage
- `src/components/performance/OKRManagement.tsx` - Add contribution view

**New Features:**
- Link projects to OKRs
- Auto-roll progress from tasks → projects → OKRs
- Contribution analytics dashboard

**New Components:**
```text
src/components/okr/
  ├── OKRProjectLinkage.tsx       -- Link projects to objectives
  ├── ContributionAnalytics.tsx   -- Which projects drive OKRs
  └── ProgressRollup.tsx          -- Automated progress calculation
```

---

## Phase 3: End-to-End Flows

### 3.1 Strategy → Portfolio → Work Flow

```text
1. Define OKRs (Performance module)
2. Create portfolios/programs linked to OKRs
3. Department submits request (Work Intake)
4. Auto-score with scoring model
5. Simulate capacity/budget impact (Scenario Planning)
6. Portfolio board approves
7. Convert to project using template
8. Deliver via sprint/kanban
9. Monitor on portfolio dashboard
10. Auto-update OKR progress
```

**Implementation:**
- Wire `RequestConversionWizard` to `applyProjectTemplate`
- Add `project_objectives` linkage on conversion
- Create portfolio approval workflow in `useApprovals`

---

### 3.2 Operational Request → Fulfillment Flow

```text
1. User submits ticket via Service Desk
2. System auto-routes based on category
3. SLA timer starts
4. Assignee works, logs time, adds comments
5. If threshold exceeded, promote to project
6. On completion, send satisfaction survey
7. Update knowledge base if new solution
8. Feed metrics to analytics
```

**Implementation:**
- Service Desk hook with SLA calculations
- Threshold-based promotion logic
- CSAT widget integration (already exists)

---

### 3.3 Financial Forecasting Flow

```text
1. PM defines budget and billing model on project
2. Capacity planner sets planned hours by role/week
3. System generates cost/revenue forecast
4. As time logs come in, actuals update
5. Dashboard shows variance
6. At close, data feeds historical analytics
```

**Implementation:**
- Extend `useTimeLogs` to calculate labor costs
- `useProjectFinancials` for variance reports
- Add to `AnalyticsPage` for historical trends

---

## Phase 4: Navigation & Integration

### 4.1 Update Navigation Config

```typescript
// src/config/navigation.ts additions

// Add to Main group (both admin and intern)
{ title: "My Work", url: "my-work", icon: Inbox }

// Add to Work Management group (admin)
{ title: "Service Desk", url: "service-desk", icon: HeadphonesIcon }
{ title: "Playbooks", url: "playbooks", icon: BookMarked }

// Add to Project Controls group
{ title: "Compliance", url: "compliance", icon: ShieldCheck }

// Add to Admin Tools
{ title: "Role Catalog", url: "role-catalog", icon: Users2 }
```

### 4.2 Update Tab Registry

```typescript
// src/pages/dashboard/tab-registry.ts additions

'my-work': {
  component: lazy(() => import('@/components/mywork/MyWorkCenter')),
},
'service-desk': {
  component: lazy(() => import('@/components/servicedesk/ServiceDeskHub')),
  adminOnly: true,
},
'playbooks': {
  component: lazy(() => import('@/components/templates/PlaybookBuilder')),
  adminOnly: true,
},
'compliance': {
  component: lazy(() => import('@/components/grc/ProjectComplianceTracker')),
  adminOnly: true,
},
'role-catalog': {
  component: lazy(() => import('@/components/resources/RoleCatalog')),
  adminOnly: true,
},
```

---

## Implementation Priority & Phases

### Wave 1: High-Value, Low-Complexity (Week 1-2)
1. **My Work Center** - Aggregation view with existing data
2. **OKR-Project Alignment** - Link existing objectives to projects
3. **Enhanced Scoring in Work Intake** - Extend existing RequestPortal
4. **Entity Comments/Activity Feed** - Generalize existing task comments

### Wave 2: Core New Features (Week 3-4)
5. **Service Desk** - New module with SLA tracking
6. **Role-Based Resource Planning** - Extend existing capacity
7. **Project Financials** - Cost/revenue tracking

### Wave 3: Advanced Features (Week 5-6)
8. **Portfolio KPI Dashboard** - Extend PortfolioManagement
9. **GRC Compliance** - Extend risk management
10. **Playbooks** - Combine templates + KB

---

## Database Migration Summary

```sql
-- New tables (10):
portfolio_objectives, project_objectives
service_tickets, sla_rules
resource_roles, project_role_allocations
project_cost_items, project_revenue_items
compliance_checkpoints, project_compliance_status
playbooks
entity_comments, entity_followers

-- Extended tables (3):
ALTER TABLE projects ADD objective_id, capex_budget, opex_budget, billing_model
ALTER TABLE work_requests ADD effort_score, value_score, risk_score
ALTER TABLE portfolios ADD strategic_alignment_score, nps_score, schedule_health
```

---

## Files Summary

### New Files to Create (~40 files)
```text
Hooks (8):
  useMyWork, useServiceDesk, useProjectFinancials
  useEntityComments, useEntityFollowers
  useCompliance, usePlaybooks, useResourceRoles

Components (32):
  mywork/ (5)
  servicedesk/ (8)
  portfolio/ (4)
  resources/ (4)
  finance/ (5)
  grc/ (4)
  collaboration/ (5)
  okr/ (3)
  templates/ (3)
  requests/ (3)
```

### Files to Modify (~15 files)
```text
Hooks: usePortfolios, useWorkRequests, useEnhancedProjects
       usePerformanceManagement, useWorkload

Components: PortfolioManagement, RequestPortal, TriageQueue
            TemplateLibrary, RiskManagement, OKRManagement

Config: navigation.ts, tab-registry.ts

Types: supabase/types.ts (auto-updated by migrations)
```

---

## Success Metrics

After implementation, the platform will support:
- 100% visibility: All work (tasks, tickets, requests) in one place
- Strategic alignment: Every project linked to organizational OKRs
- Financial control: Real-time forecast vs actual tracking
- Compliance assurance: Automated checkpoint enforcement
- Collaboration: Activity feeds and decision logs on all entities
- Operational efficiency: SLA-tracked service desk

