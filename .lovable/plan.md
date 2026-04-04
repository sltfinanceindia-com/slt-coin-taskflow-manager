

# TeneXA Platform — Complete Production Audit Report
**Audit Date: April 4, 2026**

---

## 🔴 Critical Issues (Production-Breaking)

### C1: sendBeacon Missing Auth Headers — Session Logs Silently Fail
`src/hooks/useAuth.tsx:349` — The `navigator.sendBeacon` call to update `session_logs` sends a raw PATCH to the Supabase REST API **without an Authorization header or apikey**. Supabase rejects unauthenticated requests. Session `logout_time` is never actually set.
- **Fix**: Include apikey as a query parameter or use `headers` via `fetch` with `keepalive: true` instead of sendBeacon (sendBeacon doesn't support custom headers).

### C2: `handle_new_user` Trigger Still Trusts Client Role
The database trigger `handle_new_user()` reads `raw_user_meta_data->>'role'` and casts it to `app_role`. While `signUp()` now hardcodes `'intern'`, the trigger itself doesn't enforce this — any direct Supabase auth API call bypassing the frontend can set `role: 'super_admin'` in metadata.
- **Fix**: Hardcode `'intern'::app_role` in the trigger, ignoring the metadata role entirely.

### C3: Google OAuth Signup Bypasses Organization Creation
`Signup.tsx:430` — Google OAuth redirects to `/dashboard` but never calls the `signup-organization` edge function. The company name entered in Step 1 is lost. The user gets created via `handle_new_user` with no proper org, defaulting to "SLT Finance" fallback.
- **Fix**: Store `companyName` in `localStorage` before OAuth redirect, then process it on the `/dashboard` callback, or pass it via OAuth state parameter.

### C4: `/feedback` Route is Unprotected
`App.tsx:244` — `<Route path="/feedback" element={<FeedbackPage />} />` has no `ProtectedRoute` wrapper. Any anonymous visitor can access feedback internals.

### C5: `/help` Route is Unprotected  
`App.tsx:263` — `<HelpCenterPage />` rendered without `ProtectedRoute`. Exposes internal help content to unauthenticated users.

---

## 🟠 High Priority Issues

### H1: Massive Typography Inconsistency Across All Public Pages
Every landing section and public page uses bloated font scales that violate the compact HireFlow-style standard:

| Component | Current | Target |
|-----------|---------|--------|
| **HeroSection h1** | `text-4xl sm:text-5xl md:text-6xl lg:text-7xl` | `text-3xl md:text-4xl` |
| **All section h2s** (FeaturesGrid, HowItWorks, Stats, Testimonials, Integrations, ProblemSolution, CTA) | `text-3xl sm:text-4xl lg:text-5xl` | `text-2xl md:text-3xl` |
| **CTA h2** | `text-3xl sm:text-4xl lg:text-5xl xl:text-6xl` | `text-2xl md:text-3xl` |
| **Hero subtext** | `text-lg sm:text-xl lg:text-2xl` | `text-sm md:text-base` |
| **Section subtext** | `text-lg` | `text-sm md:text-base` |
| **About h1** | `text-4xl sm:text-5xl lg:text-6xl` | `text-3xl md:text-4xl` |
| **Pricing h1** | `text-4xl sm:text-5xl lg:text-6xl` | `text-3xl md:text-4xl` |
| **Features h1** | `text-4xl sm:text-5xl lg:text-6xl` | `text-3xl md:text-4xl` |
| **Contact h1** | `text-3xl sm:text-5xl lg:text-6xl` | `text-3xl md:text-4xl` |
| **Resources h1** | `text-4xl sm:text-5xl lg:text-6xl` | `text-3xl md:text-4xl` |
| **FeaturesGrid card h3** | `text-lg` | `text-base` |
| **FeaturesGrid card description** | `text-sm` | `text-xs md:text-sm` |
| **StatsSection stat values** | `text-4xl lg:text-5xl` | `text-3xl` |
| **StatsSection stat labels** | `text-lg` | `text-sm` |
| **HowItWorks step h3** | `text-2xl lg:text-3xl` | `text-xl` |
| **HowItWorks step number** | `text-5xl lg:text-6xl` | `text-3xl` |
| **CTA buttons** | `size="lg"` with `h-14 px-8/px-10 text-lg` | `size="default"` |
| **Hero CTA buttons** | `size="lg"` with `h-14 px-8 text-lg` | `size="default"` |

### H2: Excessive Section Padding Across All Landing Sections
Every section uses `py-24 lg:py-32` (96px/128px). Per compact design standard, should be `py-14` (56px).

**Affected files**: All 8 files in `src/components/landing/` plus `src/pages/About.tsx`, `Pricing.tsx`, `Features.tsx`, `Contact.tsx`, `Resources.tsx`.

### H3: Feature Card Minimum Heights Are Oversized
`FeaturesGrid.tsx:68-69` — Large cards have `min-h-[280px]`, regular cards `min-h-[200px]`. These force excessive whitespace on mobile. Remove or reduce to `min-h-[140px]` / `min-h-[120px]`.

### H4: Integration Icon Containers Oversized
`IntegrationsSection.tsx:28` — Center hub icon is `w-24 h-24` with `h-12 w-12` inner icon. Integration icons are `w-14 h-14` with `h-7 w-7` inner. Reduce to `w-16 h-16` / `h-8 w-8` and `w-10 h-10` / `h-5 w-5` respectively.

### H5: 1048 Console Statements in Production
Across 44 files — exposes internal state, user IDs, and role data in DevTools. Critical information leakage.
- **Fix**: Add `vite-plugin-strip` or `esbuild.drop: ['console']` in `vite.config.ts` for production builds.

### H6: Mobile Navigation Still Incomplete
`BottomNavigation.tsx` shows only 4 primary items + 5 "more" items. 80+ dashboard modules remain inaccessible on mobile without knowing URLs. The sidebar is `hidden md:flex`.

### H7: `isPublicRoute` Uses window.location Instead of React Router
`App.tsx:186-187` — Directly checks `window.location.pathname` instead of `useLocation()`. Fragile and won't work correctly with base paths or future routing changes.

---

## 🟡 Medium Issues

### M1: Canonical URLs Still Wrong on Multiple Pages
- `About.tsx:68`: `canonical="https://tenexa.lovable.app/about"` — should be `sltwork.lovable.app`
- `Pricing.tsx:168`: `canonical="https://tenexa.lovable.app/pricing"` — same
- `Landing.tsx`: Fixed to `sltwork.lovable.app` but other pages weren't updated

### M2: StatsSection Uses Hardcoded Fake Numbers
Claims "500+ Organizations", "50,000+ Employees", "99.9% Uptime" — actual DB has 10 orgs, 29 users. Misleading for a production site.

### M3: Testimonials Are Fabricated
All 6 testimonials cite fictional companies (TechVision Solutions, GlobalServe BPO, etc.) and people. For a production site this is deceptive.

### M4: About Page Timeline Claims Are Inaccurate
Claims "Founded 2021", "First 100 Customers in 2022", "Series A Funding in 2023", "500+ Organizations in 2024" — none verified. Potential legal/trust issue.

### M5: Hero Section Uses min-h-[90vh]
`HeroSection.tsx:18` — Forces the hero to take 90% of viewport, pushing all content below the fold. Reduce to `min-h-[60vh]` or remove entirely for compact layout.

### M6: FeaturesGrid Link Cards All Go to `/features`
All 12 feature cards link to `/features` — none go to actual feature-specific deep links. This is a dead-end UX pattern.

### M7: Framer Motion Adds ~40KB Bundle Weight
Used across all 8 landing sections + 6 public pages for simple animations (fade, slide). Could be replaced with CSS `@keyframes` or Tailwind `animate-*` classes.

### M8: QueryClient staleTime + refetchOnWindowFocus
`staleTime: 2min` + `refetchOnWindowFocus: true` causes unnecessary API calls when users alt-tab. Consider `refetchOnWindowFocus: false` or increasing staleTime.

### M9: ContentProtection Wraps Public Pages
`App.tsx:199` — `ContentProtection` wraps everything including landing, pricing, and auth pages. Adds unnecessary DOM elements and event listeners for unauthenticated visitors.

---

## 🟢 Minor Issues

### L1: Splash Screen Still 1s Minimum
`App.tsx:176` — Even 1s is noticeable for returning users with cached sessions.

### L2: NotFound Page Uses text-[120px]/text-[150px]
Arbitrary font sizes outside the design system.

### L3: TestimonialCard Fixed Width of 400px
`TestimonialsSection.tsx:49` — `w-[400px]` may overflow on small viewports in certain edge cases.

### L4: Trust Badges Marquee Has No Pause on Hover
`TrustBadges` auto-scrolls infinitely. Users can't pause to read content.

### L5: Step Number in HowItWorks Uses text-5xl/text-6xl
Decorative numbers are oversized at `text-5xl lg:text-6xl`. Should be `text-3xl`.

---

## 📈 Performance Metrics

| Metric | Estimate | Target | Status |
|--------|----------|--------|--------|
| FCP | ~1.5-2.0s | <1.8s | ⚠️ Borderline |
| TTI | ~3.0-4.0s | <3.5s | ⚠️ Slow (splash + auth chain) |
| LCP | ~2.5-3.5s | <2.5s | ❌ Slow (dashboard-preview.jpg) |
| Initial Bundle | ~350-450KB | <300KB | ⚠️ Large (framer-motion) |
| Login API calls | 5+ sequential | 2-3 | ❌ Too many |
| Console statements | 1048 | 0 | ❌ Critical |

---

## 🔐 Security Risks

| # | Risk | Severity | Fix |
|---|------|----------|-----|
| 1 | `handle_new_user` trusts client role metadata | CRITICAL | Hardcode 'intern' in trigger |
| 2 | sendBeacon has no auth headers | HIGH | Use fetch with keepalive |
| 3 | `/feedback` unprotected route | HIGH | Add ProtectedRoute |
| 4 | `/help` unprotected route | MEDIUM | Add ProtectedRoute |
| 5 | 1048 console statements leak state | MEDIUM | Strip in production |
| 6 | Google OAuth loses org context | MEDIUM | Persist via state param |
| 7 | OTP expiry still too long | MEDIUM | Manual Supabase Dashboard fix |
| 8 | Leaked password protection disabled | MEDIUM | Manual Supabase Dashboard fix |

---

## 📱 Responsiveness Report

| Device | Issue | Severity |
|--------|-------|----------|
| Mobile (<768px) | Sidebar hidden, 80+ modules inaccessible | HIGH |
| Mobile (<768px) | Hero text-7xl is massive even with clamp overrides | HIGH |
| Mobile (<768px) | Feature cards min-h-[200px] creates excess whitespace | MEDIUM |
| Mobile (<768px) | CTA buttons h-14 text-lg are oversized | MEDIUM |
| Mobile (<768px) | TestimonialCard w-[400px] may clip | LOW |
| Tablet | Section py-24 creates excessive scrolling | MEDIUM |
| Desktop | Generally OK but typography scale is bloated | MEDIUM |

---

## 🧭 UX/Navigation Issues

| # | Issue | Severity |
|---|-------|----------|
| 1 | All 12 feature cards link to same /features page | MEDIUM |
| 2 | "Watch Demo" button has no action (no href/onClick) | MEDIUM |
| 3 | Mobile users can't access 80+ modules via nav | HIGH |
| 4 | Stats section shows fabricated numbers | MEDIUM |
| 5 | Hero min-h-[90vh] pushes content below fold unnecessarily | MEDIUM |
| 6 | Google signup loses company name on OAuth redirect | HIGH |

---

## 🛠 Recommended Fixes (Priority Order)

### Week 1 — Critical Security

| # | Fix | Impact |
|---|-----|--------|
| 1 | **Hardcode role in `handle_new_user` trigger** — ignore `raw_user_meta_data.role` | Prevents privilege escalation |
| 2 | **Fix sendBeacon auth** — replace with `fetch(url, { keepalive: true, headers: { apikey, Authorization } })` | Fixes session logging |
| 3 | **Wrap `/feedback` and `/help` in ProtectedRoute** | Closes access gaps |
| 4 | **Strip console statements** — add `esbuild: { drop: ['console'] }` to `vite.config.ts` build options | Stops data leakage |

### Week 2 — Typography & UI Compaction

| # | Fix | Files Affected |
|---|-----|---------------|
| 5 | **Compact all landing typography** per the table in H1 | All 8 `src/components/landing/*.tsx` |
| 6 | **Compact all public page typography** (About, Pricing, Features, Contact, Resources) | 5 page files |
| 7 | **Reduce section padding** from `py-24 lg:py-32` to `py-14` across all sections | 13+ files |
| 8 | **Reduce CTA/hero buttons** from `size="lg" h-14 text-lg` to `size="default"` | HeroSection, CTASection |
| 9 | **Reduce hero min-height** from `min-h-[90vh]` to `min-h-[60vh]` or remove | HeroSection |
| 10 | **Fix feature card min-heights** — reduce or remove `min-h-[280px]`/`min-h-[200px]` | FeaturesGrid |

### Week 3 — Functional & UX

| # | Fix | Files |
|---|-----|-------|
| 11 | **Fix Google OAuth org creation** — persist companyName via state | Signup.tsx |
| 12 | **Fix canonical URLs** on About, Pricing, Features, Resources | 4 files |
| 13 | **Fix `isPublicRoute`** — use `useLocation()` instead of `window.location` | App.tsx |
| 14 | **Remove or replace fake stats/testimonials** | StatsSection, TestimonialsSection, About |
| 15 | **Add "Watch Demo" action** or remove the button | HeroSection |
| 16 | **Improve mobile navigation** — full module drawer | BottomNavigation |

### Week 4 — Performance

| # | Fix |
|---|-----|
| 17 | **Replace framer-motion with CSS animations** on landing page |
| 18 | **Lazy load dashboard-preview.jpg** (currently `loading="eager"`) |
| 19 | **Reduce login API round-trips** — batch profile + roles into single RPC |
| 20 | **Remove/reduce splash screen delay** |

---

## 🚀 Final Verdict

### Production Readiness Score: 4/10

| Category | Score | Weight | Weighted |
|----------|-------|--------|----------|
| Architecture | 8/10 | 15% | 1.20 |
| Security | 3/10 | 25% | 0.75 |
| Functionality | 5/10 | 15% | 0.75 |
| Performance | 5/10 | 10% | 0.50 |
| UI/Typography Consistency | 2/10 | 15% | 0.30 |
| UX/Navigation | 4/10 | 10% | 0.40 |
| Responsiveness | 4/10 | 5% | 0.20 |
| Code Quality | 4/10 | 5% | 0.20 |
| **Total** | | **100%** | **4.30** |

### Explanation

The platform has excellent architectural bones (React + Supabase + 10-tier RBAC + 180+ tables + lazy loading + error boundaries). However:

1. **Security**: The `handle_new_user` trigger still trusts client-supplied role metadata — this is a privilege escalation vector that must be patched at the database level. The sendBeacon call silently fails due to missing auth headers. Two routes are unprotected.

2. **Typography/UI**: Every public page uses a bloated font scale (up to `text-7xl`) with oversized section padding (`py-24/py-32`), oversized buttons (`h-14 text-lg`), and excessive card heights. This violates the compact, mobile-first HireFlow standard across 15+ files.

3. **Content Integrity**: Fabricated stats (500+ orgs vs actual 10), fake testimonials, and unverified timeline milestones undermine trust for a production launch.

4. **Information Leakage**: 1048 console statements ship to production, exposing user IDs, role data, and internal state.

Fixing the 4 critical security issues (Week 1) and compacting the typography (Week 2) would raise the score to approximately **6.5/10**. Completing all 20 recommended fixes would bring it to **8/10**.

