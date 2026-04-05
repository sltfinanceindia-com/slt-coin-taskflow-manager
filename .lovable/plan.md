

# TeneXA Platform — Complete Production Audit Report
**Audit Date: April 5, 2026**

---

## 🔴 Critical Issues (Production-Breaking)

### C1: sendBeacon Replacement Uses Anon Key as Bearer Token
`useAuth.tsx:357` — The `fetch` with `keepalive` sends `Authorization: Bearer ${VITE_SUPABASE_PUBLISHABLE_KEY}` (the anon key). This authenticates as an anonymous user, NOT the actual logged-in user. The session JWT should be used, but by the time `beforeunload` fires, the session may already be cleared. Session logs `logout_time` is still never reliably set.
- **Impact**: Attendance/session tracking is broken — logout times are missing
- **Fix**: Cache the session access token in a ref alongside `profileRef`, and use that token in the `Authorization` header. Update the ref on every session change.

### C2: Google OAuth Signup Still Loses Organization Context
`Signup.tsx:430-439` — Google OAuth calls `signInWithOAuth` with `redirectTo: /dashboard` but the `companyName` from Step 1 is never persisted. After OAuth redirect, the `signup-organization` edge function is never called. The user ends up with no organization.
- **Impact**: Google signup is fundamentally broken — users get orphaned accounts
- **Fix**: Store `companyName` in `localStorage` before OAuth redirect. On `/dashboard` mount, check for pending org creation and call `signup-organization`.

### C3: `window.location.pathname` Used Outside React Router
`App.tsx:186-188` — `isPublicRoute` check uses `window.location.pathname` directly instead of React Router's `useLocation()`. This is fragile and doesn't react to client-side navigation changes.
- **Fix**: Use `useLocation()` hook (already available since `AppContent` is inside `BrowserRouter`... wait, actually `BrowserRouter` is rendered INSIDE `AppContent` at line 209, so `useLocation` is NOT available at line 186). This is a structural problem — the public route check happens before `BrowserRouter` mounts.

---

## 🟠 High Priority Issues

### H1: Typography Still Oversized on Pricing, Features, Resources Pages
Despite previous fixes to landing components, several pages still violate the compact HireFlow scale:

| File | Element | Current | Target |
|------|---------|---------|--------|
| `Pricing.tsx:426` | FAQ h2 | `text-3xl sm:text-4xl` | `text-2xl md:text-3xl` |
| `Pricing.tsx:428` | FAQ subtitle | `text-lg` | `text-sm md:text-base` |
| `Pricing.tsx:464` | CTA icon | `h-12 w-12` | `h-6 w-6` |
| `Pricing.tsx:465` | CTA h2 | `text-3xl sm:text-4xl` | `text-2xl md:text-3xl` |
| `Pricing.tsx:468` | CTA body | `text-lg` | `text-sm md:text-base` |
| `Pricing.tsx:472,478` | CTA buttons | `size="lg" h-12 px-8` | `size="default"` |
| `Pricing.tsx:288` | Price amount | `text-4xl` | `text-3xl` |
| `Features.tsx:476` | Section h2 | `text-3xl sm:text-4xl` | `text-2xl md:text-3xl` |
| `Features.tsx:477` | Section body | `text-lg` | `text-sm md:text-base` |
| `Features.tsx:495` | Card h3 | `text-lg` | `text-base` |
| `Features.tsx:519` | CTA h2 | `text-3xl sm:text-4xl` | `text-2xl md:text-3xl` |
| `Features.tsx:522` | CTA body | `text-lg` | `text-sm md:text-base` |
| `Features.tsx:526,532` | CTA buttons | `size="lg" h-12 px-8 text-base` | `size="default"` |
| `Features.tsx:492` | Icon container | `w-12 h-12` | `w-10 h-10` |
| `NotFound.tsx:22` | 404 heading | `text-7xl sm:text-8xl` | `text-6xl sm:text-7xl` |

### H2: Oversized Section Padding Remains
| File | Current | Target |
|------|---------|--------|
| `Pricing.tsx:225` | `py-12 sm:py-20` | `py-14` |
| `Pricing.tsx:417` | `py-16 lg:py-24` | `py-14` |
| `Pricing.tsx:457` | `py-16 lg:py-24` | `py-14` |
| `Features.tsx:469` | `py-16 lg:py-24` | `py-14` |
| `Features.tsx:505` | `py-16 lg:py-24` | `py-14` |
| `Resources.tsx:430` | `py-16 lg:py-24` | `py-14` |
| `Contact.tsx:124` | `py-12 sm:py-20` | `py-14` |
| `StartTrial.tsx:201` | `py-12 lg:py-20` | `py-14` |
| `PublicFooter.tsx:46` | `py-16 lg:py-20` | `py-14` |
| `HeroSection.tsx:17` | `py-14 lg:py-20` | `py-14` |

### H3: 909 console.log Statements Still in Source
Despite `esbuild.drop: ['console']` in vite.config.ts (which strips them from production builds), the source code still contains 909 `console.log` calls across 39 files. While they won't appear in production, they:
- Clutter the development experience
- Make genuine debug logs hard to find
- Add noise to code reviews

### H4: StatsSection Still Shows Fabricated Numbers
`StatsSection.tsx:7-10` — "500+ Organizations", "50,000+ Employees", "99.9% Uptime" are hardcoded lies. DB has ~10 orgs and ~30 users.
- **Fix**: Use the `get_public_stats()` RPC function that already exists, or replace with honest messaging like "Growing platform" or remove specific numbers.

### H5: "Watch Demo" Button Has No Action
`HeroSection.tsx:81` — The "Watch Demo" button has no `onClick` handler or link. Clicking it does nothing.
- **Fix**: Either link to a demo video URL, or remove the button entirely.

---

## 🟡 Medium Issues

### M1: Canonical URLs Still Wrong on Multiple Pages
- `About.tsx`, `Pricing.tsx`, `Features.tsx`, `Resources.tsx` may still reference `tenexa.lovable.app` instead of `sltwork.lovable.app`

### M2: BrowserRouter Positioned Inside AppContent
`App.tsx:209` — `BrowserRouter` is rendered deep inside `AppContent`, AFTER `ContentProtection`, `TourStateProvider`, and `TooltipProvider`. This means:
- `isPublicRoute` check at line 186 can't use `useLocation()`
- `WelcomeDialog` and `GuidedTour` are inside BrowserRouter (correct now), but `ContentProtection` wraps public pages unnecessarily

### M3: QueryClient refetchOnWindowFocus Creates Unnecessary Traffic
`staleTime: 2min` + `refetchOnWindowFocus: true` causes API calls every time a user alt-tabs back to the app, even if data was fetched 30 seconds ago.

### M4: Framer Motion Bundle Weight (~40KB)
All 8 landing sections + 6 public pages import `framer-motion` for simple fade/slide animations that CSS can handle.

### M5: PWA Icon Uses Same Image for All Sizes
`vite.config.ts:32-48` — All three PWA icon entries reference the same `/slt-hub-icon.png` file for 192x192 and 512x512. Should have properly sized icons.

### M6: Splash Screen 1s Delay
`App.tsx:176` — Still has `setTimeout(() => setMinTimeElapsed(true), 1000)` which adds latency for returning users.

---

## 🟢 Minor Issues

### L1: Testimonials Still Fabricated
Fictional companies and people in `TestimonialsSection.tsx`.

### L2: About Page Timeline Claims Unverified
"Founded 2021", "First 100 Customers", "Series A Funding" — none verified.

### L3: StickyCtaBar Conflicts with BottomNavigation on Mobile
`StickyCtaBar.tsx:27` — renders `fixed bottom-0` on `md:hidden`. If user is logged in and on a public page, both `StickyCtaBar` and `BottomNavigation` could overlap.

### L4: Feature Card Icon Containers Still `w-12 h-12`
`Features.tsx:492` — should be `w-10 h-10` per compact standard.

---

## 📈 Performance Metrics

| Metric | Estimate | Target | Status |
|--------|----------|--------|--------|
| FCP | ~1.5-2.0s | <1.8s | ⚠️ Borderline |
| TTI | ~2.5-3.5s | <3.5s | ⚠️ Improved (splash reduced to 1s) |
| LCP | ~2.5-3.5s | <2.5s | ❌ Slow (dashboard-preview.jpg) |
| Initial Bundle | ~350-400KB | <300KB | ⚠️ Large (framer-motion) |
| Console drops in prod | Active | N/A | ✅ Fixed |
| Login API calls | 5+ sequential | 2-3 | ❌ Still too many |

---

## 🔐 Security Risks

| # | Risk | Severity | Status |
|---|------|----------|--------|
| 1 | Session log auth uses anon key instead of user JWT | HIGH | Broken |
| 2 | Google OAuth signup orphans users without org | HIGH | Broken |
| 3 | `handle_new_user` trigger hardcoded to intern | ✅ Fixed | Resolved |
| 4 | Admin routes use `AdminRoute` wrapper | ✅ Fixed | Resolved |
| 5 | `/feedback` and `/help` now protected | ✅ Fixed | Resolved |
| 6 | Console statements stripped in prod builds | ✅ Fixed | Resolved |
| 7 | OTP magic link origin validated | ✅ Fixed | Resolved |
| 8 | signOut uses local scope | ✅ Fixed | Resolved |
| 9 | `isPublicRoute` uses `window.location` not router | LOW | Fragile but works |

---

## 📱 Responsiveness Report

| Device | Issue | Severity |
|--------|-------|----------|
| Mobile (<768px) | Sidebar hidden, 80+ modules in bottom drawer | ✅ Improved |
| Mobile (<768px) | StickyCtaBar may overlap BottomNavigation | LOW |
| Mobile (<768px) | Pricing `text-4xl` price amounts still large | MEDIUM |
| Mobile (<768px) | Features icon containers `w-12 h-12` oversized | LOW |
| Tablet | Section padding `py-16 lg:py-24` still bloated | MEDIUM |
| Desktop | Typography mostly aligned | ✅ Improved |

---

## 🧭 UX/Navigation Issues

| # | Issue | Severity |
|---|-------|----------|
| 1 | "Watch Demo" button is a dead click | MEDIUM |
| 2 | Google OAuth signup loses org data | HIGH |
| 3 | Stats section misleads with fake numbers | MEDIUM |
| 4 | Testimonials are fabricated | LOW |

---

## 🛠 Recommended Fixes (Priority Order)

### Immediate (This Sprint)

| # | Fix | Files |
|---|-----|-------|
| 1 | **Fix session log auth** — Cache session JWT in a ref, use it in `beforeunload` fetch | `useAuth.tsx` |
| 2 | **Fix Google OAuth org creation** — Persist companyName in localStorage, process on callback | `Signup.tsx` + `ModernDashboard.tsx` or new callback handler |
| 3 | **Compact Pricing page typography** — Fix h2s, body text, buttons, padding | `Pricing.tsx` |
| 4 | **Compact Features page typography** — Fix h2s, body text, buttons, padding, icon sizes | `Features.tsx` |
| 5 | **Fix remaining section padding** — All `py-16/20/24` to `py-14` | `Resources.tsx`, `Contact.tsx`, `StartTrial.tsx`, `PublicFooter.tsx`, `HeroSection.tsx` |
| 6 | **Fix or remove "Watch Demo"** | `HeroSection.tsx` |
| 7 | **Replace fake stats** — Use `get_public_stats()` RPC or honest copy | `StatsSection.tsx` |

### Short-Term (Next Sprint)

| # | Fix |
|---|-----|
| 8 | Fix canonical URLs on About, Features, Resources pages |
| 9 | Replace framer-motion with CSS animations on landing page |
| 10 | Batch login API calls into single RPC |
| 11 | Add proper PWA icons at correct sizes |

---

## 🚀 Final Verdict

### Production Readiness Score: 5.5 / 10

| Category | Score | Weight | Weighted |
|----------|-------|--------|----------|
| Architecture | 8/10 | 15% | 1.20 |
| Security | 5/10 | 25% | 1.25 |
| Functionality | 5/10 | 15% | 0.75 |
| Performance | 5/10 | 10% | 0.50 |
| UI/Typography | 4/10 | 15% | 0.60 |
| UX/Navigation | 5/10 | 10% | 0.50 |
| Responsiveness | 5/10 | 5% | 0.25 |
| Code Quality | 5/10 | 5% | 0.25 |
| **Total** | | **100%** | **5.30** |

### Progress Since Last Audit
- **Improved from 4.0 to 5.5** — Critical security fixes (admin route protection, role hardcoding, route protection) were implemented
- **Remaining blockers**: Session log auth is still broken (anon key vs user JWT), Google OAuth signup still orphans users, and Pricing/Features/Resources pages still have oversized typography
- **To reach 7.0+**: Fix the 2 remaining critical issues + compact remaining page typography + replace fake content

