

# TeneXA Audit Implementation Plan

## Scope
Based on your priorities: **RLS hardening**, **account lockout/login protection**, and **performance optimizations**.

---

## Step 1: RLS Hardening (12 Remaining Permissive Policies)

Create a single SQL migration to tighten the 12 remaining `WITH CHECK (true)` INSERT policies. These are on system/logging tables but should still require authentication to prevent anonymous abuse.

**Tables and policy changes:**
| Table | Current | New Policy |
|-------|---------|------------|
| audit_logs | `WITH CHECK (true)` | `WITH CHECK (auth.uid() IS NOT NULL)` |
| automation_logs | `WITH CHECK (true)` | `WITH CHECK (auth.uid() IS NOT NULL)` |
| contact_submissions | `WITH CHECK (true)` | Keep as-is (public form) |
| daily_email_log | INSERT + UPDATE `true` | `WITH CHECK (auth.uid() IS NOT NULL)` |
| email_notifications | `WITH CHECK (true)` | `WITH CHECK (auth.uid() IS NOT NULL)` |
| notifications | `WITH CHECK (true)` | `WITH CHECK (auth.uid() IS NOT NULL)` |
| payments | `WITH CHECK (true)` | `WITH CHECK (auth.uid() IS NOT NULL)` |
| referral_tracking | `WITH CHECK (true)` | `WITH CHECK (auth.uid() IS NOT NULL)` |
| scratch_cards | `WITH CHECK (true)` | `WITH CHECK (auth.uid() IS NOT NULL)` |
| subscription_history | `WITH CHECK (true)` | `WITH CHECK (auth.uid() IS NOT NULL)` |
| trial_signups | `WITH CHECK (true)` | Keep as-is (public form) |

**Note:** `contact_submissions` and `trial_signups` are intentionally public-facing -- they remain permissive. The remaining 10 policies get hardened.

---

## Step 2: Account Lockout & Login Protection

### 2a. Database: Create `login_attempts` table
- Columns: `id`, `email`, `ip_address`, `attempted_at`, `success`, `organization_id`
- Create a helper function `is_account_locked(p_email TEXT)` that checks if 5+ failed attempts occurred in the last 15 minutes
- Auto-cleanup trigger to purge attempts older than 24 hours

### 2b. Frontend: Update `useAuth.tsx` sign-in flow
- Before calling `signInWithPassword`, check lockout status via a lightweight edge function or RPC
- On failed login, record the attempt
- On successful login, clear failed attempts for that email
- Show user-friendly lockout message with remaining time

### 2c. Edge Function: `check-login-status`
- Accepts email, returns `{ locked: boolean, remainingMinutes: number }`
- Uses service role to query `login_attempts` (user isn't authenticated yet)
- Records failed/successful attempts

---

## Step 3: Performance Optimizations

### 3a. Route-level code splitting (App.tsx)
Currently all 40+ page imports are eager in `App.tsx`. Convert to `React.lazy()`:
- Super Admin pages (12 imports)
- Module landing pages (9 imports)
- Detail pages (5 imports)
- Other protected pages

This will significantly reduce initial bundle size.

### 3b. Query optimization
- Add `gcTime` and tighter `staleTime` to QueryClient defaults
- Ensure all large-table queries have `LIMIT` clauses (time_logs, attendance_records, leave_balances)

### 3c. Suspense boundaries
- Add `<Suspense>` fallbacks with existing skeleton components around lazy-loaded routes

---

## Technical Details

### Migration SQL (Step 1)
Single migration dropping old policies and creating authenticated-only replacements for 10 tables.

### New Files
- `supabase/migrations/[timestamp]_rls_hardening.sql` -- RLS policy updates
- `supabase/migrations/[timestamp]_login_attempts.sql` -- Login attempts table + RPC
- `supabase/functions/check-login-status/index.ts` -- Login lockout check edge function

### Modified Files
- `src/hooks/useAuth.tsx` -- Add lockout check before sign-in, record attempts
- `src/App.tsx` -- Convert eager imports to `React.lazy()` with Suspense
- `supabase/config.toml` -- Add `check-login-status` function config

### Estimated Changes
- 2 SQL migrations
- 1 new edge function
- 2 file modifications

