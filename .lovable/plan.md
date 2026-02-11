

# Plan: Sidebar Header Hide Toggle + Mobile Content Size Fix

## Problem 1: Sidebar Header Hide Option

The highlighted section in the screenshot includes the **Logo**, **User Info**, and **Super Admin Panel** link at the top of the sidebar. On mobile, this takes up significant vertical space, pushing the actual navigation items down.

### Solution
Add a collapsible toggle to the sidebar header section. When collapsed, only the navigation items and Expand/Collapse All button will be visible. The toggle state will be persisted to localStorage so it remembers the user's preference.

**File: `src/components/AppSidebar.tsx`**
- Wrap the Logo, User Info, and Super Admin Panel sections (lines 206-289) inside a `Collapsible` component
- Add a small toggle button (chevron up/down) between the header and the navigation
- Persist the collapsed state in localStorage (`sidebar-header-collapsed`)
- Default to collapsed on mobile for better space usage

---

## Problem 2: Large Content / Oversized Text on Mobile

The root cause is that **60+ component files** use hardcoded Tailwind text sizes like `text-3xl`, `text-4xl`, `text-5xl`, `text-6xl` WITHOUT responsive breakpoint prefixes. The global `clamp()` typography system in `index.css` only applies to raw HTML tags (`h1`-`h6`), but most components use `<div>` or `<p>` with Tailwind classes, bypassing the fluid sizing entirely.

### Solution
Add **global mobile overrides** in `src/index.css` that cap text sizes on small screens. This approach fixes all 60+ files at once without touching each individual component.

**File: `src/index.css`** (inside the existing `@media (max-width: 768px)` block)

Add these rules:

```css
/* Cap oversized text classes on mobile */
.text-6xl { font-size: 2rem !important; }      /* 32px max on mobile */
.text-5xl { font-size: 1.75rem !important; }    /* 28px max */
.text-4xl { font-size: 1.5rem !important; }     /* 24px max */
.text-3xl { font-size: 1.25rem !important; }    /* 20px max */
.text-2xl { font-size: 1.125rem !important; }   /* 18px max */
```

Additionally, add mobile-specific constraints:
- Cap card padding (`p-6` to `p-4`, `p-8`/`p-12` to `p-4`) on mobile
- Ensure icon sizes don't exceed reasonable bounds (`h-12 w-12` capped to `h-8 w-8`)
- Tighten gap spacing on mobile for grid layouts

---

## Technical Summary

| File | Change |
|------|--------|
| `src/components/AppSidebar.tsx` | Add collapsible header section with toggle button and localStorage persistence |
| `src/index.css` | Add mobile text-size caps, padding caps, and spacing overrides in the 768px media query |

### What This Fixes
- Sidebar: Users can hide/show the logo + user info + admin link section with one tap
- All pages: Text that was `text-4xl` (36px) on a 390px phone will now be capped at 24px
- All pages: Cards with `p-8` or `p-12` padding will be reduced to `p-4` on mobile
- No individual component files need to be edited -- the CSS overrides apply globally

