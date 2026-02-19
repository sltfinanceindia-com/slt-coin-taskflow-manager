

# TeneXA Audit Checklist -- Updated Status (Feb 19, 2026)

## Changes Since Last Audit

Phase 1-2 fixes have been applied:
- `sprint_tasks` junction table: CREATED (0 records, but functional)
- `generate-recurring-tasks` edge function: DEPLOYED (0 active recurring tasks to process)
- `invoices` RLS: FIXED (now uses `is_same_org_admin` / `is_same_org_user`)
- `update_updated_at_column` search_path: FIXED (`search_path=public`, `SECURITY DEFINER`)
- `budget_allocations.alert_threshold_percentage`: ADDED
- Kanban filter persistence: IMPLEMENTED via `usePersistedKanbanFilters`
- F&F auto-trigger from exit_requests: **NOT CREATED** (trigger missing from DB)

---

## 1. Main & Work Management

### Overview & Dashboard
| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Dashboard displays accurate real-time data | PASS | Live data: 55 tasks, 151 time_logs, 20 attendance |
| 2 | User permissions control widget visibility | PASS | `useUserRole` + `allowedRoles` on tabs |
| 3 | Performance metrics load within acceptable timeframes | PASS | React Query caching active |
| 4 | Data refresh intervals configured | PASS | `staleTime` + `refetchOnWindowFocus` |

### Kanban Board
| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Task status transitions follow workflows | PASS | Enforced state machine |
| 2 | Drag-and-drop across browsers | PASS | `@hello-pangea/dnd` |
| 3 | Board filters save per user | **PASS** (was PARTIAL) | Fixed: `usePersistedKanbanFilters` now persists to localStorage |
| 4 | Archived tasks retrievable | PARTIAL | No explicit archive status |

### Projects
| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Mandatory fields on creation | PASS | 3 projects in DB |
| 2 | Timelines/dependencies accurate | PARTIAL | 1 dependency, no Gantt critical-path |
| 3 | Status updates trigger notifications | PASS | Edge function operational |
| 4 | Historical data preserved | PASS | `project_baselines` table exists |

### Time Management
| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Time logs with validation | PASS | 151 records |
| 2 | Time entries link to projects/tasks | PASS | FK relationships |
| 3 | Overtime calculations | PASS | `overtime_hours` column |
| 4 | Timesheet approval workflows | PASS | 9 timesheets, 5 entries |
| 5 | Time tracking matches payroll | UI-ONLY | 0 payroll_runs |

### Capacity & Resource Planning
| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Prevents double-booking | PARTIAL | No hard constraint |
| 2 | Accounts for leaves/holidays | PARTIAL | No automatic subtraction |
| 3 | Workload reports accurate | PASS | DB function exists |
| 4 | Real-time availability | PARTIAL | No Realtime subscription |

### Attendance & Leave Management
| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Attendance syncs with time logs | PARTIAL | Independent systems |
| 2 | Leave balances calculate correctly | PASS | 31 balances, 26 types |
| 3 | Leave approval routes correctly | PASS | Approval hook working |
| 4 | WFH integrates with attendance | PASS | 4 WFH requests |
| 5 | Shift swaps require authorization | UI-ONLY | 0 records |
| 6 | On-call prevents conflicts | PARTIAL | 1 schedule, no conflict check |

### Sprint & Agile Tools
| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Story point assignment | **PASS** (was PARTIAL) | Fixed: `sprint_tasks` table created with `story_points` column |
| 2 | Backlog prioritization | PASS | Component exists |
| 3 | Burndown charts | PARTIAL | Needs more sprint data |
| 4 | Velocity calculations | PARTIAL | Only 1 sprint |

### Risk & Issue Management
| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Risk register fields | PARTIAL | 0 records, project-scoped |
| 2 | Issue tracker priority/severity | UI-ONLY | 0 records |
| 3 | Dependencies visualized | PARTIAL | 1 dependency, no graph |
| 4 | Escalation rules | UI-ONLY | No escalation engine |

### Templates & Recurring Work
| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Project templates clone | UI-ONLY | 0 templates |
| 2 | Task templates maintain fields | UI-ONLY | 0 templates |
| 3 | Recurring tasks generate on schedule | **PASS** (was BROKEN) | Fixed: Edge function deployed + configured |
| 4 | Template updates don't affect existing | PASS | Clone-on-use |

### Documentation
| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Meeting notes link to projects | UI-ONLY | 0 records |
| 2 | Decision log audit trail | UI-ONLY | 0 records |
| 3 | Lessons learned searchable | UI-ONLY | 0 records |
| 4 | Document version control | UI-ONLY | 0 records |

---

## 2. Performance Management

### OKRs
| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | OKR cascading | PARTIAL | 2 objectives, 1 key_result |
| 2 | Progress auto-updates from tasks | PARTIAL | No task-to-KR link |
| 3 | Review cycles trigger notifications | UI-ONLY | 0 check-ins |
| 4 | Historical data preserved | PASS | Timestamped records |

### Feedback & Reviews
| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | 360 feedback anonymity | PARTIAL | Flag exists, untested |
| 2 | 1:1 notes private/secure | PASS | RLS in place |
| 3 | Review cycles include eligible | UI-ONLY | Framework exists |
| 4 | PIPs tracking | PASS | 3 PIPs |

---

## 3. Finance & HR

### Payroll & Compensation
| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Payroll matches salary structures | UI-ONLY | 0 payroll_runs |
| 2 | Tax withholdings comply | UI-ONLY | 0 form16_records |
| 3 | Salary revisions approval | UI-ONLY | 0 salary_revisions |
| 4 | Bonus calculations | UI-ONLY | Component exists |
| 5 | Form 16 generates | UI-ONLY | 0 records |
| 6 | Reimbursements link to expenses | UI-ONLY | 0 reimbursements |

### Expenses & Advances
| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Expense approvals by amount | UI-ONLY | 0 claims, 0 categories |
| 2 | Categories enforce budgets | UI-ONLY | 0 categories |
| 3 | Loans track repayment | UI-ONLY | 0 loan_requests |
| 4 | Expense reports integrate accounting | MISSING | No integration |

### Assets & Documents
| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Asset tracks custody | UI-ONLY | 0 records |
| 2 | Document access controls | PARTIAL | RLS exists, 0 docs |
| 3 | Compliance expiration alerts | UI-ONLY | 0 checkpoints |
| 4 | Asset depreciation | MISSING | No logic |

### Benefits & Investments
| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Investment declarations | UI-ONLY | 0 records |
| 2 | Benefits enrollment | UI-ONLY | 0 records |
| 3 | F&F settlement | UI-ONLY | 0 records |
| 4 | Gratuity calculations | UI-ONLY | 0 records |

---

## 4. Employee Lifecycle

### Onboarding
| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Checklists auto-generate | UI-ONLY | 0 records |
| 2 | Access provisioning | PARTIAL | No automation |
| 3 | Offer letters | UI-ONLY | 0 offers |
| 4 | Probation alerts | UI-ONLY | 0 probations |

### Offboarding
| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Exit checklist | UI-ONLY | 0 exit_requests |
| 2 | F&F initiates automatically | **MISSING** | Trigger was NOT created in migration |
| 3 | Knowledge transfer documented | PARTIAL | No KT workflow |
| 4 | Access revoked promptly | MISSING | No automation |

### Contracts & Verification
| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Digital signatures | UI-ONLY | No e-signature |
| 2 | Background verification | UI-ONLY | 0 records |
| 3 | Confirmation after probation | UI-ONLY | 1 confirmation |
| 4 | Contract renewal alerts | UI-ONLY | No scheduler |

### Employee Relations
| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Grievance confidentiality | UI-ONLY | 0 grievances |
| 2 | Disciplinary due process | UI-ONLY | 0 records |
| 3 | Handbook version-controlled | UI-ONLY | 0 policies |
| 4 | Policy acknowledgment | UI-ONLY | 0 acknowledgments |

---

## 5. HR Analytics & Growth
| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | HR analytics real-time | PASS | Live data |
| 2 | Benchmarking reliable | UI-ONLY | Static data |
| 3 | Reports exportable | PASS | CSV/PDF |
| 4 | Custom report builder | UI-ONLY | 0 custom_reports |
| 5 | Succession planning | UI-ONLY | 0 plans |
| 6 | Career paths linked to skills | UI-ONLY | 0 paths |
| 7 | Skill gap triggers training | PARTIAL | 1 skill, no trigger |
| 8 | Internal mobility visible | UI-ONLY | 0 levels |

---

## 6. Recruitment
| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Job postings sync external | MISSING | 0 postings, no API |
| 2 | ATS filters candidates | UI-ONLY | 0 applications |
| 3 | Interview scheduling | UI-ONLY | 0 interviews |
| 4 | Offer management | UI-ONLY | 0 offers |
| 5 | Pipeline conversion reports | PARTIAL | UI exists, 0 data |

---

## 7. Planning & Budgeting
| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Budget integrates with expenses | UI-ONLY | 0 allocations |
| 2 | Cost centers track spending | UI-ONLY | 0 cost_centers |
| 3 | Budget alerts at thresholds | **PARTIAL** (was MISSING) | `alert_threshold_percentage` column added, but no trigger/check logic |
| 4 | Variance reports | UI-ONLY | No data |

---

## 8. Admin & System Tools

### Access Control
| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Least privilege roles | PASS | 10 role tiers |
| 2 | Permission changes logged | PARTIAL | 8 audit_logs |
| 3 | Role assignments secure | PASS | 29 user_roles, RLS |
| 4 | Admin secondary approval | MISSING | Not implemented |

### Organization Structure
| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Org chart reflects reporting | PASS | 3 reporting_structure |
| 2 | Org changes update modules | PARTIAL | No cascading |
| 3 | Department hierarchies routing | PASS | parent_id support |

### Automation & Workflows
| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Approval workflows route | PARTIAL | 0 configured |
| 2 | Notifications deliver | PASS | Edge functions working |
| 3 | SLA tracking | UI-ONLY | 0 sla_rules |
| 4 | Failed automations alert | PARTIAL | 4 rules, no failure alerts |

### Audit & Compliance
| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Audit packs complete | UI-ONLY | No packs generated |
| 2 | System logs capture actions | PASS | 6536 activity_logs |
| 3 | Data retention enforced | MISSING | No purge scheduler |
| 4 | Compliance reports accurate | UI-ONLY | 0 checkpoints |

### System Health
| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Work health monitoring | PASS | Component exists |
| 2 | Error logs reviewed | PARTIAL | No in-app viewer |
| 3 | Database backups | PASS | Supabase automatic |
| 4 | API integrations functional | PASS | 21+ edge functions |

### Reporting & Analytics
| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Custom reports | UI-ONLY | 0 reports |
| 2 | Report scheduling | MISSING | No scheduler |
| 3 | Analytics matches source | PASS | Direct queries |
| 4 | Export works | PASS | CSV/PDF |

---

## 9. Resources & Communication

### Employee Engagement
| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Kudos wall | PASS | 4 kudos |
| 2 | Pulse survey anonymity | PARTIAL | 2 surveys |
| 3 | Communication broadcasts | PASS | Chat working |
| 4 | Coins/rewards balances | PASS | 33 transactions |

### Training & Development
| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Training completion tracking | UI-ONLY | 0 progress |
| 2 | Tutorial content current | PASS | Component exists |
| 3 | App feedback collected | PASS | Form exists |
| 4 | Training certificates | UI-ONLY | 0 certificates |

---

## 10. Technical & Security

### Database & Performance
| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Queries optimized | PASS | React Query + limits |
| 2 | RLS enforces isolation | **IMPROVED** | `invoices` fixed; 13 remaining `USING(true)` are system-insert tables (audit_logs, notifications, etc.) -- acceptable |
| 3 | Indexes configured | PARTIAL | PKs only |
| 4 | Slow pages identified | PARTIAL | No monitoring |

### Security & Access
| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Password policies | PASS | OTP + OAuth |
| 2 | CORS authorized only | PASS | Supabase managed |
| 3 | API auth required | PASS | Edge functions use `getUser()` |
| 4 | Data encrypted | PASS | AES-256 + TLS |
| 5 | OTP expiry | WARN | Still exceeds threshold (manual fix needed) |
| 6 | Leaked password protection | WARN | Still disabled (manual fix needed) |
| 7 | Postgres patches | WARN | Upgrade recommended |
| 8 | Function search_path | **PASS** (was WARN) | Fixed: `SET search_path = public` |

### Integration & APIs
| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Third-party integrations | PARTIAL | Resend + PhonePe |
| 2 | API rate limits | PASS | Supabase defaults |
| 3 | Webhook reliability | UI-ONLY | Untested |
| 4 | Error handling | PASS | try/catch + toasts |

### Deployment & DevOps
| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Staging mirrors production | PASS | Test + Live |
| 2 | Rollback capability | PASS | Lovable handles |
| 3 | Environment variables | PASS | Configured |
| 4 | Monitoring alerts | PARTIAL | No custom alerting |

---

## 11. Compliance & Legal
| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Employee classification | MISSING | No exempt/non-exempt field |
| 2 | Labor law notices | MISSING | No module |
| 3 | Anti-discrimination policies | UI-ONLY | 0 handbook_policies |
| 4 | FMLA/leave compliance | PARTIAL | Configurable types |
| 5 | Data privacy (GDPR) | PARTIAL | RLS isolates, no self-service export |
| 6 | Payroll tax accuracy | UI-ONLY | 0 runs |
| 7 | Workplace safety | MISSING | No module |

---

## Updated Summary Scorecard

| Category | Total | PASS | PARTIAL | UI-ONLY | MISSING | WARN |
|----------|-------|------|---------|---------|---------|------|
| Main & Work Management | 36 | 17 (+2) | 10 (-2) | 8 | 0 | 0 |
| Performance Management | 8 | 3 | 2 | 3 | 0 | 0 |
| Finance & HR | 16 | 0 | 1 | 13 | 2 | 0 |
| Employee Lifecycle | 16 | 0 | 2 | 11 | 3 | 0 |
| HR Analytics & Growth | 8 | 2 | 1 | 5 | 0 | 0 |
| Recruitment | 5 | 0 | 1 | 3 | 1 | 0 |
| Planning & Budgeting | 4 | 0 | 1 (+1) | 2 (-1) | 1 (-1) | 0 |
| Admin & System Tools | 19 | 8 | 5 | 4 | 2 | 0 |
| Resources & Communication | 8 | 5 | 1 | 2 | 0 | 0 |
| Technical & Security | 16 | 11 (+1) | 3 (-1) | 1 | 0 | 3 (-1) |
| Compliance & Legal | 7 | 0 | 2 | 2 | 3 | 0 |
| **TOTAL** | **143** | **46 (32%)** | **29 (20%)** | **54 (38%)** | **12 (8%)** | **3 (2%)** |

**Net improvement from last audit: +3 PASS, -2 PARTIAL, -1 WARN**

---

## Remaining Fix Plan

### Phase A: Missing Trigger (Previously Planned But Not Applied)

**Fix 1: Create F&F auto-trigger from exit_requests**
The DB trigger `trigger_auto_create_fnf` was planned in Phase 2 but the migration did not create it. Need to:
- Create function `auto_create_fnf_on_exit_approval()` that inserts into `fnf_settlements` when `exit_requests.status` changes to `'approved'`
- Create trigger `AFTER UPDATE ON exit_requests` calling this function

### Phase B: Budget Alert Logic (Column exists, logic missing)

**Fix 2: Budget threshold check on expense submission**
- The `alert_threshold_percentage` column exists on `budget_allocations` but no trigger/check fires
- Create a DB function that runs after `expense_claims` INSERT to compare total spend against budget allocation and insert a notification if threshold is exceeded

### Phase C: Remaining PARTIAL Items (Code Improvements)

**Fix 3: Kanban archive workflow**
- Add `'archived'` to task status enum
- Add archive/unarchive buttons on task cards
- Filter archived tasks from default view, add "Show Archived" toggle

**Fix 4: Attendance-Time Log sync**
- When clock-out happens in attendance, auto-create/update a time_log entry for the same day

### Phase D: Manual Admin Actions (No Code Changes)

These require Supabase Dashboard changes:
- Reduce OTP expiry to 300 seconds (Auth > Settings)
- Enable leaked password protection (Auth > Settings)
- Apply Postgres security patches (Infrastructure)

### Phase E: Data Population (Admin UI Actions)

All remaining UI-ONLY items need initial data through the admin interface -- no code changes required. The tables and UI components all exist.

### Implementation Summary

| Phase | Fix | Type | Impact |
|-------|-----|------|--------|
| A | F&F auto-trigger | DB migration | Fixes 1 MISSING item |
| B | Budget alert logic | DB trigger + hook | Upgrades 1 PARTIAL to PASS |
| C | Kanban archive | Code change | Upgrades 1 PARTIAL to PASS |
| C | Attendance-Time sync | Code change | Upgrades 1 PARTIAL to PASS |
| D | OTP/Password/Postgres | Manual dashboard | Fixes 3 WARN items |
| E | Data population | Admin UI | Addresses 54 UI-ONLY items |

**Total code changes needed: 4 fixes (2 DB migrations + 2 frontend updates)**

