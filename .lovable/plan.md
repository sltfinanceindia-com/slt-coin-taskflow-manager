

# TeneXA Platform — Complete Production Audit Report
**Audit Date: April 6, 2026**

---

## 🔴 Critical Issues (Production-Breaking)

### C1: Google OAuth Signup — No Post-Callback Org Creation Handler
`Signup.tsx:431-432` now persists `companyName`/`fullName` to localStorage before OAuth redirect. However, **no code in `ModernDashboard.tsx` or anywhere else reads these values and calls `signup-organization`** after the OAuth callback. The localStorage data is set but never consumed. Google signup users still end up with orphaned accounts.
- **Fix**: Add a `useEffect` in `ModernDashboard.tsx` (or a dedicated callback component) that checks for `pending_org_company_name` in localStorage on mount, calls the `signup-organization` edge function, then clears the localStorage keys.

### C2: `isPublicRoute` Check Runs Outside BrowserRouter
`App.tsx:186-188` — `window.location.pathname` is used in `AppContent` which renders **above** `<BrowserRouter>` (line 209). This means `useLocation()` cannot be used here. More critically, this check only runs once on initial render — client-side navigations (e.g., clicking from `/pricing` to `/dashboard`) do NOT re-evaluate `isPublicRoute`, meaning `ContentProtection`, splash screen logic, and the `UnifiedAssistant` visibility may behave incorrectly during SPA navigation.
- **Fix**: Move `BrowserRouter` to wrap the entire `AppContent` return, or extract the route-dependent logic into a child component inside `BrowserRouter` that uses `useLocation()`.

### C3: CTASection Still Claims "500+ Organizations"
`CTASection.tsx:38` — "Join 500+ organizations using TeneXA" is hardcoded. DB has ~10. This was flagged in previous audits and fixed in `StatsSection.tsx` but **not** in `CTASection`, `TrustBadges`, or `About.tsx`.
- **Files still claiming 500+**: `CTASection.tsx:38`, `TrustBadges.tsx:13`, `About.tsx:58,127`

---

## 🟠 High Priority Issues

### H1: Canonical URLs Still Wrong on 3 Files
| File | Current | Should Be |
|------|---------|-----------|
| `Privacy.tsx:16` | `tenexa.lovable.app/privacy` | `sltwork.lovable.app/privacy` |
| `Terms.tsx:16` | `tenexa.lovable.app/terms` | `sltwork.lovable.app/terms` |
| `ShareModal.tsx:13,21,26` | `tenexa.lovable.app` | `sltwork.lovable.app` |

### H2: Resources Page — "Load More" Button is size="lg" and Non-Functional
`Resources.tsx:420` — `<Button variant="outline" size="lg">Load More Articles</Button>` has no `onClick` handler. It's a dead button. Also violates compact sizing standard (`size="lg"` → `size="default"`).

### H3: Resources Page — Card Title Still `text-lg`
`Resources.tsx:398` — Resource card title uses `text-lg` instead of `text-base` per HireFlow compact standard.

### H4: Testimonials Are Still Fabricated
All 6 testimonials in `TestimonialsSection.tsx` cite fictional companies and people. No change since last audit.

### H5: About Page Timeline Still Has Unverified Claims
`About.tsx:55-59` — "Founded 2021", "First 100 Customers 2022", "Series A 2023", "500+ Orgs 2024" — none verified.

### H6: `refetchOnWindowFocus: true` Still Active
`App.tsx:99` — Causes unnecessary API calls on every tab switch. Should be `false` for a production app.

---

## 🟡 Medium Issues

### M1: Framer Motion Still Used Across All Landing Sections (~40KB)
All 8 landing sections + 6 public pages import `framer-motion` for simple fade/slide animations. CSS `@keyframes` or Tailwind `animate-*` classes would achieve the same effect at near-zero cost.

### M2: Splash Screen 1s Minimum Delay
`App.tsx:176` — `setTimeout(() => setMinTimeElapsed(true), 1000)` adds 1s latency for returning users.

### M3: `ContentProtection` Wraps Public Pages
`App.tsx:200` — Wraps everything including landing/pricing/auth. Adds unnecessary DOM overhead and event listeners for anonymous visitors.

### M4: PWA Icons Use Same File for All Sizes
`vite.config.ts:30+` — All PWA icon entries reference the same `/slt-hub-icon.png` regardless of the declared size.

### M5: `navigate()` Called During Render
`ModernDashboard.tsx:189,194,199` — `navigate('/training')` etc. called directly inside `renderTabContent()` during render phase. This is a React anti-pattern that can cause "Cannot update state during render" warnings. Should use `useEffect` or redirect components.

---

## 🟢 Minor Issues

### L1: NotFound Page `console.error` Still in Source
`NotFound.tsx:10-13` — `console.error` call. Stripped in prod builds by esbuild.drop, but pollutes dev logs.

### L2: TestimonialCard Width `w-[340px]`
Fixed from previous `w-[400px]` but may still clip on very small viewports (<360px).

### L3: `Dashboard.tsx` Still Exists Alongside `ModernDashboard.tsx`
The old `Dashboard.tsx` file is still in the codebase but no route points to it. Dead code.

---

## 📈 Performance Metrics

| Metric | Estimate | Target | Status |
|--------|----------|--------|--------|
| FCP | ~1.5-2.0s | <1.8s | ⚠️ Borderline |
| TTI | ~2.5-3.5s | <3.5s | ⚠️ Splash adds 1s |
| LCP | ~2.0-3.0s | <2.5s | ⚠️ dashboard-preview.jpg |
| Bundle | ~350-400KB | <300KB | ⚠️ framer-motion |
| Console drops | ✅ Active | N/A | ✅ Fixed |

---

## 🔐 Security Risks

| # | Risk | Severity | Status |
|---|------|----------|--------|
| 1 | `handle_new_user` hardcoded to intern | ✅ Fixed | Resolved |
| 2 | Session log uses cached JWT | ✅ Fixed | Resolved |
| 3 | `/feedback` + `/help` protected | ✅ Fixed | Resolved |
| 4 | Console stripped in prod | ✅ Fixed | Resolved |
| 5 | Google OAuth still orphans users | HIGH | **Open** |
| 6 | `isPublicRoute` outside BrowserRouter | LOW | Fragile |
| 7 | `tenexa.lovable.app` URLs in ShareModal | LOW | Data leakage |

---

## 📱 Responsiveness Report

| Device | Issue | Severity |
|--------|-------|----------|
| Mobile (<360px) | TestimonialCard w-[340px] may clip | LOW |
| Mobile (<768px) | BottomNavigation drawer now covers 80+ modules | ✅ Fixed |
| All | Typography now compact on most pages | ✅ Improved |
| All | Section padding standardized to py-14 | ✅ Improved |

---

## 🧭 UX/Navigation Issues

| # | Issue | Severity |
|---|-------|----------|
| 1 | "Load More" button on Resources page does nothing | MEDIUM |
| 2 | Google OAuth signup completes but user has no org | HIGH |
| 3 | `navigate()` during render can cause warnings | LOW |
| 4 | Fabricated testimonials/stats undermine trust | MEDIUM |

---

## 🛠 Recommended Fixes (Priority Order)

### Immediate (This Sprint)

| # | Fix | Files |
|---|-----|-------|
| 1 | **Add OAuth callback handler** — read `pending_org_*` from localStorage in ModernDashboard, call signup-organization edge function, clear keys | `ModernDashboard.tsx` |
| 2 | **Fix "500+" claims** — update to "10+" or use `get_public_stats()` RPC | `CTASection.tsx`, `TrustBadges.tsx`, `About.tsx` |
| 3 | **Fix canonical URLs** | `Privacy.tsx`, `Terms.tsx`, `ShareModal.tsx` |
| 4 | **Fix Resources "Load More"** — either implement pagination or remove the button; change to `size="default"` | `Resources.tsx` |
| 5 | **Fix resource card title** — `text-lg` → `text-base` | `Resources.tsx:398` |

### Short-Term

| # | Fix |
|---|-----|
| 6 | Move `BrowserRouter` higher in component tree or extract route-dependent logic |
| 7 | Fix `navigate()` during render in ModernDashboard (use `<Navigate>` component) |
| 8 | Set `refetchOnWindowFocus: false` |
| 9 | Remove dead `Dashboard.tsx` file |
| 10 | Replace framer-motion with CSS on landing page |

---

## 🚀 Final Verdict

### Production Readiness Score: 6.0 / 10

| Category | Score | Weight | Weighted |
|----------|-------|--------|----------|
| Architecture | 8/10 | 15% | 1.20 |
| Security | 6/10 | 25% | 1.50 |
| Functionality | 5/10 | 15% | 0.75 |
| Performance | 5/10 | 10% | 0.50 |
| UI/Typography | 7/10 | 15% | 1.05 |
| UX/Navigation | 5/10 | 10% | 0.50 |
| Responsiveness | 6/10 | 5% | 0.30 |
| Code Quality | 5/10 | 5% | 0.25 |
| **Total** | | **100%** | **6.05** |

### Progress Since Last Audit
- **Improved from 5.5 to 6.0** — Session logging auth fixed, typography mostly compacted, routes protected
- **Remaining blockers**: Google OAuth callback handler is the #1 functional gap. Fabricated content (500+ orgs, fake testimonials) is the #1 trust gap. 3 canonical URLs still wrong.
- **To reach 7.5+**: Fix OAuth callback + remove fake content + fix canonical URLs + remove framer-motion

