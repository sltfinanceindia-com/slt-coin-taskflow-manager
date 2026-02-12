

# Plan: Dark Modern Theme + Public Pages Fix + Sidebar Scroll Fix

This is a large-scope change touching the theme system, public pages, navigation, and sidebar behavior. Due to the scale, I recommend implementing in **2-3 phases** to avoid breaking things.

---

## Phase 1: Dark Theme Overhaul (Core CSS Variables)

Update the `.dark` theme in `src/index.css` to match the banner-inspired dark modern blue accent palette.

**File: `src/index.css`** -- Update the `.dark` block (lines 99-166):

| CSS Variable | Current Value | New Value | Purpose |
|---|---|---|---|
| `--background` | `220 25% 8%` | `0 0% 4%` | #0A0A0A deep black |
| `--foreground` | `220 8% 90%` | `0 0% 100%` | White text |
| `--card` | `220 20% 10%` | `0 0% 10%` | #1A1A1A surface |
| `--card-foreground` | `220 8% 90%` | `0 0% 100%` | White text |
| `--popover` | `220 15% 12%` | `0 0% 10%` | #1A1A1A |
| `--primary` | `220 15% 85%` | `213 63% 58%` | #4A90E2 blue accent |
| `--primary-foreground` | `220 20% 8%` | `0 0% 100%` | White |
| `--secondary` | `140 65% 55%` | `0 0% 16%` | #2A2A2A surface medium |
| `--secondary-foreground` | `220 20% 8%` | `0 0% 88%` | #E0E0E0 |
| `--muted` | `220 20% 15%` | `0 0% 13%` | #212121 |
| `--muted-foreground` | `220 8% 65%` | `0 0% 63%` | #A0A0A0 |
| `--accent` | `140 60% 50%` | `213 63% 58%` | Blue accent |
| `--border` | `220 20% 20%` | `0 0% 23%` | #3A3A3A |
| `--input` | `220 15% 18%` | `0 0% 16%` | #2A2A2A |
| `--ring` | `140 60% 50%` | `213 63% 58%` | Blue ring |
| `--destructive` | `0 75% 60%` | `4 90% 58%` | #F44336 |
| `--success` | `140 70% 50%` | `122 39% 49%` | #4CAF50 |
| `--warning` | (inherited) | `36 100% 50%` | #FF9800 |
| `--info` | (inherited) | `207 90% 54%` | #2196F3 |
| `--sidebar-background` | `240 5.9% 10%` | `0 0% 4%` | #0A0A0A |
| `--sidebar-border` | `240 3.7% 15.9%` | `0 0% 16%` | #2A2A2A |
| `--sidebar-primary` | `224.3 76.3% 48%` | `213 63% 58%` | Blue |
| `--sidebar-accent` | `240 3.7% 15.9%` | `213 63% 58% / 0.13` | Blue glow |

Also update dark-mode gradients to use blue instead of green:
- `--gradient-primary`: `linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 100%)`
- `--gradient-secondary`: `linear-gradient(135deg, #4A90E2 0%, #2E5F99 100%)`
- `--shadow-glow`: blue-based glow instead of green

---

## Phase 2: Public Pages Visual Refresh

### 2a. Fix Navigation Links

**File: `src/components/public/PublicHeader.tsx`**
- The "Features" dropdown links use hash fragments (e.g., `/features#hr`) -- ensure these scroll to the correct section using `scrollIntoView` after navigation.
- Add `useEffect` in `Features.tsx` to scroll to the hash target element on mount.

### 2b. Update Public Page Styling for Dark Theme

Update the following components to replace hardcoded emerald/green colors with theme-aware CSS variables and blue accents:

**Files to update:**
- `src/components/landing/HeroSection.tsx` -- Replace `emerald-600`, `teal-500`, `cyan-500` gradients with `#4A90E2` blue accent palette. Update badge colors from green to blue.
- `src/components/landing/FeaturesGrid.tsx` -- Replace emerald hover effects with blue accent.
- `src/components/landing/AnimatedBackground.tsx` -- Replace emerald/indigo orbs with blue (#4A90E2) dots pattern inspired by the banner. Add subtle scattered blue dots with varying opacity (0.1-0.3) and sizes.
- `src/components/landing/CTASection.tsx` -- Blue gradient buttons instead of emerald.
- `src/components/landing/StatsSection.tsx` -- Blue accents.
- `src/components/landing/ProblemSolutionSection.tsx` -- Theme-aware colors.
- `src/components/landing/HowItWorksSection.tsx` -- Blue accents.
- `src/components/landing/IntegrationsSection.tsx` -- Blue accents.
- `src/components/landing/TestimonialsSection.tsx` -- Blue accents.
- `src/components/landing/StickyCtaBar.tsx` -- Blue gradient CTA.
- `src/components/public/PublicHeader.tsx` -- Replace emerald button colors with blue gradient. Update feature dropdown icon backgrounds.
- `src/components/public/PublicFooter.tsx` -- Update to use dark theme consistent colors.
- `src/pages/Features.tsx` -- Replace emerald/purple gradients with blue accent. Fix hash-based scrolling.
- `src/pages/Pricing.tsx` -- Blue accent for popular plan highlight.
- `src/pages/About.tsx` -- Blue accents.
- `src/pages/Contact.tsx` -- Blue accents.
- `src/pages/Resources.tsx` -- Blue accents.
- `src/pages/StartTrial.tsx` -- Blue gradient buttons.

### 2c. Banner Image Integration

Copy the uploaded banner image to `src/assets/` and use it as a reference-inspired background pattern (blue dots on dark). The actual image will NOT be embedded; instead, the AnimatedBackground component will be updated to create a similar blue dots pattern effect using CSS/SVG.

---

## Phase 3: Sidebar Scroll Position Fix

**Problem:** When navigating between tabs, the sidebar scrolls back to the top position instead of keeping the active item visible.

**File: `src/components/AppSidebar.tsx`**
- Add a `useEffect` that scrolls the active sidebar item into view when `activeTab` changes.
- Use `scrollIntoView({ block: 'nearest', behavior: 'smooth' })` on the active button element.
- Add `data-tab` attributes to sidebar items for easy DOM querying.

---

## Phase 4: Component-Level Dark Theme Updates

Update UI components that have hardcoded emerald/green colors:

| File | Change |
|---|---|
| `src/components/ui/input.tsx` | Replace `emerald-500` focus ring with `ring-primary` (uses CSS var) |
| `src/components/ui/textarea.tsx` | Same as input |
| `src/components/ui/progress.tsx` | Replace `emerald-500` bar with `bg-primary` |
| `src/components/ThemeToggle.tsx` | No change needed (already theme-aware) |
| `src/components/AppSidebar.tsx` | Replace `emerald-*` avatar fallback colors with `primary` blue tones |

---

## Summary of Files Changed

| File | Type of Change |
|---|---|
| `src/index.css` | Dark theme CSS variables overhaul (blue palette) |
| `src/components/landing/HeroSection.tsx` | Blue accent colors |
| `src/components/landing/FeaturesGrid.tsx` | Blue accent colors |
| `src/components/landing/AnimatedBackground.tsx` | Blue dots pattern |
| `src/components/landing/CTASection.tsx` | Blue gradient |
| `src/components/landing/StatsSection.tsx` | Blue accents |
| `src/components/landing/ProblemSolutionSection.tsx` | Blue accents |
| `src/components/landing/HowItWorksSection.tsx` | Blue accents |
| `src/components/landing/IntegrationsSection.tsx` | Blue accents |
| `src/components/landing/TestimonialsSection.tsx` | Blue accents |
| `src/components/landing/StickyCtaBar.tsx` | Blue CTA |
| `src/components/public/PublicHeader.tsx` | Blue buttons, fix nav |
| `src/components/public/PublicFooter.tsx` | Dark theme colors |
| `src/pages/Features.tsx` | Blue accents, hash scroll fix |
| `src/pages/Pricing.tsx` | Blue accents |
| `src/pages/About.tsx` | Blue accents |
| `src/pages/Contact.tsx` | Blue accents |
| `src/pages/Resources.tsx` | Blue accents |
| `src/pages/StartTrial.tsx` | Blue gradient |
| `src/components/AppSidebar.tsx` | Scroll position fix, blue colors |
| `src/components/ui/input.tsx` | Theme-aware focus ring |
| `src/components/ui/textarea.tsx` | Theme-aware focus ring |
| `src/components/ui/progress.tsx` | Theme-aware bar color |

---

## Important Notes

- The dark theme with blue accents applies ONLY to dark mode. Light mode remains unchanged.
- All hardcoded `emerald-*` / `teal-*` colors in public pages will be replaced with `primary` (CSS variable) or explicit `#4A90E2` blue tones so they respond to the theme.
- The glassmorphism effects (backdrop-blur, transparent borders) will be applied to modals, the nav bar, and dropdown menus via updated CSS utility classes.
- This is a large change spanning 20+ files. It will be implemented methodically, starting with the CSS variables (instant global impact) then updating individual components.

