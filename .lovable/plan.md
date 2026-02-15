

# Plan: Fix All Known Issues

Three concrete issues remain unfixed from previous rounds. Here is exactly what needs to change.

---

## Issue 1: Features Page Hash Navigation Not Scrolling

**Problem:** When navigating to `/features#hr` from the PublicHeader dropdown, the tab changes but the page doesn't scroll to the tabbed section -- the user stays at the top of the page staring at the hero.

**Fix in `src/pages/Features.tsx` (lines 201-207):**
- After setting `activeTab` from the hash, add a `setTimeout` that scrolls the Tabs section into view using `document.getElementById` and `scrollIntoView({ behavior: 'smooth', block: 'start' })`
- Add an `id="features-tabs"` to the Tabs section container (line 263) so it can be targeted

**Fix in `src/components/public/PublicHeader.tsx` (lines 112-126):**
- When clicking a feature link like `/features#hr`, if user is already ON `/features`, the React Router `Link` won't trigger a re-mount. Add an `onClick` handler that manually parses the hash and calls `scrollIntoView` + sets the hash for the existing `useEffect` to pick up.

---

## Issue 2: Sidebar Active Item Not Scrolling Into View

**Problem:** When navigating between tabs, the sidebar doesn't scroll to keep the active item visible. Users with many nav groups have to manually scroll to find the active item.

**Fix in `src/components/AppSidebar.tsx`:**
- Add `data-tab-url` attribute to each sidebar button (lines 385 and 435) so we can query them
- Add a `useEffect` that runs when `activeTab` changes, finds the matching `[data-tab-url="..."]` element, and calls `scrollIntoView({ block: 'nearest', behavior: 'smooth' })`

---

## Issue 3: Remaining `teal` Color References

**Problem:** 3 instances of `teal-500` in `src/pages/Tutorial.tsx` that were missed.

**Fix:**
- Line 376: `bg-teal-500` -> `bg-cyan-500` (keeping it distinct from other feature colors in the tutorial grid)
- Line 775: `text-teal-500` -> `text-primary`  
- Line 1041/1043: `from-teal-500/10` and `text-teal-500` -> `from-primary/10` and `text-primary`

---

## Issue 4: Dropdown Backgrounds in Dark Mode

**Problem:** The useful-context warns that dropdowns can become see-through. The PublicHeader features dropdown and all Radix UI overlay components use `bg-popover` which resolves correctly via CSS variables, but in dark mode the glassmorphism effect on the header can cause visual issues.

**Fix in `src/components/public/PublicHeader.tsx` (line 108):**
- Add explicit dark mode background to the features dropdown: change from `bg-background` to include `dark:bg-[#1A1A1A]` to ensure it's never transparent
- Add `backdrop-blur-xl` for the glassmorphism effect

---

## Technical Summary

| File | Changes |
|------|---------|
| `src/pages/Features.tsx` | Add `id="features-tabs"` to tabs section; enhance hash `useEffect` to scroll into view after tab change |
| `src/components/public/PublicHeader.tsx` | Add onClick scroll logic for feature links when already on /features; fix dropdown dark bg |
| `src/components/AppSidebar.tsx` | Add `data-tab-url` attributes; add `useEffect` for active item scroll-into-view |
| `src/pages/Tutorial.tsx` | Replace 3 `teal-500` references with `primary` or `cyan-500` |

Total: 4 files, all surgical edits with no structural changes.

