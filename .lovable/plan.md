

# TeneXA Complete Application Audit -- Findings & Fix Plan

## Critical Issues Found

### CATEGORY 1: BROKEN (Missing Database Table)

| Tab | Issue | Root Cause |
|-----|-------|------------|
| **Bonus Management** | Infinite loading spinner, cannot add data | `employee_bonuses` table does NOT exist in the database. The component queries `supabase.from('employee_bonuses')` which silently fails. |

### CATEGORY 2: CONNECTIVITY / DATA ISSUES

| Tab | Issue | Root Cause |
|-----|-------|------------|
| **Leave Management** | Shows "No leave balances configured" despite 26 leave_types existing | Leave balances (0 records for this user) need to be initialized per-employee. No auto-provisioning when employee is created. |
| **Overview Dashboard** | Shows "0 Hours This Week", "0 completed this week" | Time logs are from Dec 2025/Jan 2026 (old data). Dashboard only shows current week. This is correct behavior but misleading with old data. |
| **Coin Transactions** | Shows "0 0" on dashboard | 0 coin_transactions for this org. Coins tab works but no transactions have been created. |

### CATEGORY 3: WORKING CORRECTLY (Verified)

| Tab | Status | Data |
|-----|--------|------|
| Overview Dashboard | WORKS | Shows 2 tasks, charts render |
| Kanban Board (Tasks) | WORKS | Shows "Assigned: 1" correctly (fix applied) |
| Projects | WORKS | 1 project "SLT Hostels Marketing" |
| OKRs | WORKS | 1 objective "Increase customer satisfaction" |
| Expenses | WORKS | 1 claim (Rs 5,000 pending) |
| Shifts | WORKS | Shows overview, 1 shift type |
| Overtime | WORKS | Queries time_logs correctly |
| Comp-Off | WORKS | Uses leave_requests table |
| Risk Register | WORKS | Uses project_risks table |
| Attendance | WORKS | 6 records |
| Time Logs | WORKS | 3 entries |
| Timesheets | WORKS | 6 timesheets |
| Sprint Planning | WORKS | 1 sprint |
| Backlog | WORKS | Uses tasks table |
| Payroll | WORKS | Component loads |

### CATEGORY 4: EMPTY BUT FUNCTIONAL (No data entered yet)

These tabs load correctly with proper empty states -- they just need data:

- WFH, Holidays, On-Call, Shift Swap
- Meeting Notes, Decision Log, Lessons Learned, Work Calendars
- Issue Tracker, Dependencies, Milestones
- Project/Task/Recurring Templates
- Documents, Assets, Loans and Advances
- Expense Categories, Reimbursements
- Salary Structure, Salary Revisions, Tax Management
- Form 16, Compliance
- Investments, Benefits, F&F Settlement, Gratuity
- Onboarding, Exit Management, Contracts, Verification
- Probation, Confirmations, Handbook, Grievances, Disciplinary
- HR Analytics, Benchmarking, Succession, Career Paths
- Job Postings, Recruitment, Interviews, Offers
- Budget Planning, Cost Centers
- Feedback (360), 1:1 Meetings, PIPs
- All Admin Tools tabs

---

## Fix Plan

### Fix 1: Create `employee_bonuses` table (CRITICAL)
This is the only truly broken tab. Create the missing database table with proper schema:

```
- id (uuid, PK)
- employee_id (uuid, FK to profiles)
- organization_id (uuid, FK to organizations)
- bonus_type (text: performance, festival, retention, spot, referral)
- amount (numeric)
- reason (text)
- status (text: pending, approved, rejected, paid)
- payout_date (date, nullable)
- approved_by (uuid, nullable)
- created_at, updated_at (timestamptz)
```

Add RLS policies using `is_same_org_user` and `is_same_org_admin` patterns.

### Fix 2: Auto-provision leave balances for new employees
When a new profile is created in an organization, auto-create `leave_balances` entries for all active `leave_types` in that org. This requires a database trigger on `profiles` INSERT.

### Fix 3: Update Supabase types
After creating the `employee_bonuses` table, the TypeScript types file will auto-update, removing the need for `(supabase as any)` casts in `BonusManagement.tsx`.

---

## Implementation Details

### Database Migration

1. Create `employee_bonuses` table with all columns matching the component's expected schema
2. Add RLS policies for org-scoped access
3. Create trigger `auto_provision_leave_balances` on `profiles` INSERT to populate leave balances from `leave_types`
4. Add indexes on `employee_id` and `organization_id`

### Code Changes

- None required for Fix 1 (component already written correctly, just needs the table)
- No code changes for Fix 2 (trigger handles it)
- Types file auto-updates

### Summary

| Fix | Type | Impact |
|-----|------|--------|
| Create `employee_bonuses` table | DB migration | Unblocks Bonus Management tab |
| Auto-provision leave balances | DB trigger | New employees get leave balances automatically |
| RLS policies | DB migration | Secures new table |

**Total: 1 database migration with 2 fixes. No frontend code changes needed.**

