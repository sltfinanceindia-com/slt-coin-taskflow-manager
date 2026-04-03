

# TeneXA Platform — Complete Production Audit Report
**Audit Date: April 3, 2026**

---

## 🔴 Critical Issues (Production-Breaking)

### C1: No Password Reset / Forgot Password Flow
There is **no forgot password page**, no `/reset-password` route, and no password reset link anywhere in the Auth page. Users who forget their password have **zero recovery path**. This is a production blocker.
- **File**: `src/pages/Auth.tsx` — no forgot password link
- **Routes**: No `/reset-password` route in `App.tsx`
- **Fix**: Create forgot password component calling `supabase.auth.resetPasswordForEmail()` + `/reset-password` page calling `supabase.auth.updateUser({ password })`

### C2: Duplicate WelcomeDialog & GuidedTour Rendered Twice
In `App.tsx` lines 186-190, `WelcomeDialog` and `GuidedTour` are rendered **twice** — once outside `<BrowserRouter>` and once inside. Components using React Router hooks (useNavigate, useLocation) will crash when rendered outside BrowserRouter.
- **File**: `src/App.tsx` lines 186-190
- **Fix**: Remove the duplicate pair outside `<BrowserRouter>` (lines 186-187)

### C3: OTP Login Calls Non-Existent Edge Function Pattern
The OTP login calls `supabase.functions.invoke('send-otp')` but the `send-otp` edge function exists — however if it returns a `magicLink` (line 201), the app does `window.location.href = data.magicLink` which is an open redirect vulnerability. Any response manipulation could redirect users to a phishing site.
- **Fix**: Validate the magicLink URL starts with `window.location.origin` before redirecting

### C4: Admin Pages Lack Admin-Level Route Protection
`/admin/settings` and `/admin/organization-settings` use generic `ProtectedRoute` (checks `user` only). **Any authenticated user** — including interns and employees — can access Organization Settings. Only `SuperAdminRoute` checks roles.
- **File**: `src/App.tsx` lines 225-229
- **Fix**: Create `AdminRoute` wrapper that checks `isAdmin` from `useUserRole()` and wrap admin routes

### C5: signUp Function Has Hardcoded Role Parameter
`signUp` in `useAuth.tsx` line 361: `role: 'admin' | 'intern' = 'intern'`. This allows callers to pass `'admin'` and self-elevate to admin during signup. The Supabase trigger `handle_new_user` trusts the role from `raw_user_meta_data`.
- **Fix**: Remove the role parameter from signUp entirely, or hardcode it to `'intern'` and never expose it to user input

---

## 🟠 High Priority Issues

### H1: Index Page Serves Stale Dashboard at /index
`src/pages/Index.tsx` renders `AdminDashboard` or `InternDashboard` but is NOT used by any route in `App.tsx`. The `/` route redirects authenticated users to `/dashboard` (ModernDashboard). However, the user's current route shows `/index` which means this dead page could be accessible, showing an outdated UI.

### H2: Client-Side Rate Limiter is Trivially Bypassable
`src/utils/security.ts` implements `RateLimiter` in memory on the client. Refreshing the page or using a different tab resets it entirely. The server-side lockout via `check-login-status` edge function is the actual protection, but the client rate limiter gives false sense of security.

### H3: Content Protection is Security Theater
`ContentProtection.tsx` prevents right-click, PrintScreen, Ctrl+S, F12 — but none of these work against browser extensions, mobile screenshots, OS-level screen recording, or DevTools opened before page load. The watermark opacity is `0.015` — practically invisible.

### H4: Global signOut with `scope: 'global'` Kills All Sessions
`signOut` at line 557 uses `{ scope: 'global' }` which signs out ALL devices/sessions. If a user signs out on their phone, their desktop session also dies. This should be `{ scope: 'local' }` by default with an explicit "Sign out all devices" option.

### H5: 939 console.log/error Calls Across 41 Files
Production builds ship with extensive debug logging (`console.log('📋 Fetching profile...')`, `console.log('✅ Session refreshed')`). This leaks internal state, profile IDs, and role data to anyone opening DevTools.

### H6: Organization Settings Page Lacks Admin Check in Component
`OrganizationSettings.tsx` does not verify admin role internally. While the route uses `ProtectedRoute`, that only checks authentication. An employee navigating directly to `/admin/organization-settings` can view and potentially modify org settings.

### H7: Sidebar Hidden on Mobile (`hidden md:flex`)
`AppSidebar.tsx` line 254: `className="...hidden md:flex"` — the sidebar is completely hidden below `md` breakpoint. Mobile users rely entirely on `BottomNavigation`, which only shows 5 items + "More" dropdown. The vast majority of 80+ modules are inaccessible on mobile without knowing the URL.

---

## 🟡 Medium Issues

### M1: No Error Boundary at App Root
Only `ModernDashboard` wraps tab content in `ErrorBoundary`. An error in `Auth.tsx`, `Landing.tsx`, or any public page crashes the entire app with a white screen.

### M2: `dangerouslySetInnerHTML` Used in SearchAndFilters
`src/components/communication/SearchAndFilters.tsx` uses `dangerouslySetInnerHTML` with DOMPurify. While sanitized, this is a fragile pattern — if DOMPurify is misconfigured or bypassed in future edits, it becomes an XSS vector.

### M3: Framer Motion on Landing Page Adds ~40KB
The Landing page imports `framer-motion` for a simple fade-in animation (`opacity: 0 → 1`). This can be replaced with a CSS animation or `@starting-style` to save bundle size.

### M4: `BrowserRouter` Nested Inside ContentProtection & TourStateProvider
The component tree in `App.tsx` has `BrowserRouter` deeply nested. Components rendered outside it (like the duplicate `WelcomeDialog`) cannot use routing hooks. Additionally, `ContentProtection` wraps everything including public pages, adding unnecessary event listeners and DOM elements for unauthenticated users.

### M5: QueryClient staleTime is 2 Minutes
`staleTime: 1000 * 60 * 2` means data goes stale after 2 minutes. For an enterprise app with real-time needs (attendance, tasks), this is reasonable, but `refetchOnWindowFocus: true` combined with this causes unnecessary refetches when users alt-tab frequently.

### M6: beforeunload Session Log Update Never Completes
`useAuth.tsx` lines 345-354: The `beforeunload` handler fires a Supabase update but doesn't `await` or use `navigator.sendBeacon()`. The browser terminates the connection before the request completes, so session logs rarely get `logout_time` set.

### M7: 10+ Empty Tables Still Need Data
Tables like `salary_structures`, `employee_contracts`, `employee_documents`, `exit_requests`, `grievances`, `tax_declarations`, `work_calendars`, `issues` remain at 0 records, making those modules appear broken.

---

## 🟢 Minor Issues

### L1: SEO Canonical URL Points to Wrong Domain
`Landing.tsx` line 22: `canonical="https://tenexa.lovable.app/"` but the actual published URL is `sltwork.lovable.app`.

### L2: Splash Screen Forces 2.5s Minimum Wait
`AppContent` lines 153-156: `setTimeout(() => setMinTimeElapsed(true), 2500)` — users always wait 2.5 seconds even if auth resolves instantly.

### L3: `isPublicRoute` Uses `window.location.pathname` Instead of Router
Line 164: Checking `window.location.pathname` directly instead of using React Router's `useLocation()` breaks with hash routing or any router changes.

### L4: Help Page is Not Protected
`/help` route (line 241) uses `<HelpCenterPage />` without `ProtectedRoute`. This is likely intentional but inconsistent with other authenticated pages.

### L5: Password Validation Inconsistency
Auth page checks `password.length < 6` (line 52) but `security.ts` requires `length >= 8` plus uppercase, lowercase, digit, and special char. Users meeting the lenient Auth check will fail the strict validation elsewhere.

---

## 📈 Performance Metrics (Estimated)

| Metric | Estimate | Target | Status |
|--------|----------|--------|--------|
| First Contentful Paint | ~1.5-2.0s | <1.8s | ⚠️ BORDERLINE |
| Time to Interactive | ~3.5-4.5s | <3.5s | ❌ SLOW (splash + auth + profile) |
| Largest Contentful Paint | ~2.5-3.5s | <2.5s | ❌ SLOW |
| Bundle Size (initial) | ~350-450KB | <300KB | ⚠️ LARGE |
| Lazy Chunks | 50+ chunks | Good | ✅ |
| Supabase Round-trips on Login | 5+ (session + profile + roles + lockout check + session_log + presence) | 2-3 | ❌ TOO MANY |

### Performance Bottlenecks
1. **5+ sequential Supabase calls on login**: Session → Profile → user_roles → check-login-status → session_log INSERT → update_user_presence RPC
2. **2.5s mandatory splash screen delay** even when auth resolves in <100ms
3. **framer-motion** imported on the landing page for trivial animation
4. **939 console statements** in production adds processing overhead

---

## 🔐 Security Risks

| # | Risk | Severity | Status |
|---|------|----------|--------|
| 1 | No password reset flow | CRITICAL | Missing |
| 2 | Self-elevation via signUp role param | CRITICAL | Exploitable |
| 3 | Admin pages lack role checks | CRITICAL | Exploitable |
| 4 | Open redirect via OTP magicLink | HIGH | Exploitable |
| 5 | OTP expiry too long | MEDIUM | Manual fix needed |
| 6 | Leaked password protection disabled | MEDIUM | Manual fix needed |
| 7 | Postgres security patches pending | MEDIUM | Manual fix needed |
| 8 | 2 permissive RLS policies remain | LOW | Intentional (public forms) |
| 9 | Client-side rate limiter only | LOW | Server lockout exists |
| 10 | Debug logs expose internal state | LOW | 939 console statements |
| 11 | Global scope signout | LOW | UX issue, not exploitable |

---

## 📱 Responsiveness Report

| Device | Issue | Severity |
|--------|-------|----------|
| Mobile (<768px) | Sidebar completely hidden, 80+ modules inaccessible via nav | HIGH |
| Mobile (<768px) | BottomNavigation shows only 5 items + overflow menu | MEDIUM |
| Mobile (<768px) | OrganizationSwitcher hidden (`hidden md:flex`) | MEDIUM |
| Mobile (360px viewport) | Auth page cards may have tight padding | LOW |
| Tablet | Generally OK with sidebar auto-collapse | LOW |
| Desktop | Full functionality | OK |

---

## 🧭 UX/Navigation Issues

| # | Issue | Severity |
|---|-------|----------|
| 1 | No forgot password link on login page | CRITICAL |
| 2 | 80+ modules only accessible via sidebar, which is hidden on mobile | HIGH |
| 3 | No breadcrumb on most pages to show current location | MEDIUM |
| 4 | Super Admin link only visible when sidebar header is expanded | MEDIUM |
| 5 | "Settings" nav item points to `/profile` which is confusing (Settings ≠ Profile) | LOW |
| 6 | Splash screen delay is annoying for returning users | LOW |
| 7 | WelcomeDialog & GuidedTour render twice (visual duplication possible) | MEDIUM |

---

## 🛠 Recommended Fixes (Priority Order)

### Immediate (Week 1) — Security & Critical

| # | Fix | Files |
|---|-----|-------|
| 1 | **Add forgot password flow** — Create reset password page + link on Auth page | New: `src/pages/ResetPassword.tsx`, Edit: `src/pages/Auth.tsx`, `src/App.tsx` |
| 2 | **Remove role param from signUp** — Hardcode to 'intern', never trust client role | `src/hooks/useAuth.tsx` line 361 |
| 3 | **Create AdminRoute wrapper** — Check `isAdmin` for admin pages | `src/App.tsx` |
| 4 | **Remove duplicate WelcomeDialog/GuidedTour** — Delete lines 186-187 | `src/App.tsx` |
| 5 | **Validate OTP magicLink origin** — Check URL starts with `window.location.origin` | `src/pages/Auth.tsx` line 201 |
| 6 | **Add admin role check in OrganizationSettings** — Redirect non-admins | `src/pages/admin/OrganizationSettings.tsx` |

### Short-Term (Week 2) — UX & Performance

| # | Fix | Files |
|---|-----|-------|
| 7 | **Fix mobile navigation** — Add full module access via mobile menu/drawer | `src/components/BottomNavigation.tsx` |
| 8 | **Reduce splash screen to 1s or remove** | `src/App.tsx` lines 153-156 |
| 9 | **Fix global signOut scope** — Change to `{ scope: 'local' }` | `src/hooks/useAuth.tsx` line 557 |
| 10 | **Strip console.logs for production** — Add Vite plugin `vite-plugin-strip` or conditional logging | `vite.config.ts` |
| 11 | **Use sendBeacon for beforeunload** — Ensure session logs complete | `src/hooks/useAuth.tsx` lines 345-354 |
| 12 | **Fix canonical URL** | `src/pages/Landing.tsx` line 22 |

### Medium-Term (Week 3-4) — Hardening

| # | Fix | Files |
|---|-----|-------|
| 13 | **Add ErrorBoundary at App root** | `src/App.tsx` |
| 14 | **Seed remaining empty tables** | SQL migration |
| 15 | **Manual Supabase Dashboard fixes** — OTP expiry, leaked passwords, patches | Dashboard |
| 16 | **Reduce login round-trips** — Batch profile + roles into single RPC call | New DB function + `useAuth.tsx` |
| 17 | **Password validation consistency** — Align Auth page with security.ts | `src/pages/Auth.tsx` |

---

## 🚀 Final Verdict

### Production Readiness Score: 4.5 / 10

| Category | Score | Weight | Weighted |
|----------|-------|--------|----------|
| Architecture | 8/10 | 15% | 1.20 |
| Security | 3/10 | 25% | 0.75 |
| Functionality | 5/10 | 20% | 1.00 |
| Performance | 5/10 | 10% | 0.50 |
| UX/Navigation | 4/10 | 10% | 0.40 |
| Responsiveness | 4/10 | 10% | 0.40 |
| Code Quality | 5/10 | 10% | 0.50 |
| **Total** | | **100%** | **4.75** |

### Explanation
The platform has strong architectural foundations (React + Supabase + 10-tier RBAC + 180+ tables) but has **critical security gaps** that make it unsuitable for production:

1. **No password reset** means locked-out users have no recovery
2. **Self-elevation via signup** means any user can create an admin account
3. **Admin pages accessible to all authenticated users** means data exposure
4. **Mobile users cannot access 75+ modules** via navigation

The codebase is well-structured with good patterns (lazy loading, error boundaries, DOMPurify), but the security issues alone make this a **4.5/10 — not production-ready**. Fixing the 6 critical issues in Week 1 would raise the score to approximately **6.5/10**, and completing all recommended fixes would bring it to **7.5-8/10**.

