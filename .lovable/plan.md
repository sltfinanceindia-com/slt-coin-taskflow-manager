

# Professional Public-Facing Pages Redesign for TeneXA

## Overview

This plan redesigns all public-facing pages for TeneXA with modern 2026 SaaS design trends, leveraging Framer Motion for smooth animations, bold typography, interactive elements, and conversion-focused layouts.

---

## Current State Analysis

**Existing Public Pages:**
- Landing (/) - Basic hero, features grid, pricing preview
- Features (/features) - Simple alternating feature cards
- Pricing (/pricing) - 4-column card layout with DB-driven plans
- Contact (/contact) - Split-screen form + contact info
- Signup (/signup) - Multi-step form

**Technology Stack:**
- React + TypeScript + Tailwind CSS
- Framer Motion already installed (v12.23.26)
- Existing animation keyframes in tailwind.config.ts
- PublicHeader and PublicFooter components
- SEOHead component for meta tags

---

## Implementation Architecture

### New File Structure

```
src/
├── components/
│   └── landing/
│       ├── HeroSection.tsx         # Animated hero with gradient background
│       ├── ProblemSolutionSection.tsx  # Split-screen pain points/solutions
│       ├── FeaturesGrid.tsx        # Bento grid with animated cards
│       ├── HowItWorksSection.tsx   # Vertical timeline with scroll animations
│       ├── TestimonialsSection.tsx # Auto-scrolling marquee carousel
│       ├── StatsSection.tsx        # Count-up animations
│       ├── IntegrationsSection.tsx # Floating logos with parallax
│       ├── CTASection.tsx          # Final conversion section
│       ├── AnimatedBackground.tsx  # Reusable gradient mesh animation
│       ├── TrustBadges.tsx         # Client logos marquee
│       ├── StickyCtaBar.tsx        # Floating bottom CTA
│       └── FeatureCard.tsx         # Reusable animated card
│   └── public/
│       ├── PublicHeader.tsx        # Enhanced with mega menu
│       ├── PublicFooter.tsx        # Enhanced 5-column layout
│       └── CookieBanner.tsx        # GDPR compliance
├── pages/
│   ├── Landing.tsx                 # Complete redesign
│   ├── Features.tsx                # Tabbed interface redesign
│   ├── Pricing.tsx                 # Enhanced with comparison table
│   ├── Contact.tsx                 # Add map integration
│   ├── About.tsx                   # NEW - About Us page
│   ├── StartTrial.tsx              # NEW - Dedicated trial signup
│   └── Resources.tsx               # NEW - Blog/Resources page
├── lib/
│   └── animations.ts               # Framer Motion animation variants
└── hooks/
    └── useScrollAnimation.ts       # Intersection Observer hook
```

---

## Phase 1: Animation Foundation & Utilities

### 1.1 Create Animation Library (`src/lib/animations.ts`)

```typescript
// Reusable Framer Motion variants
export const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
};

export const staggerContainer = {
  initial: {},
  whileInView: {
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

export const cardHover = {
  rest: { scale: 1, boxShadow: "0 4px 6px rgba(0,0,0,0.1)" },
  hover: { 
    scale: 1.03, 
    boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
    transition: { duration: 0.3, ease: "easeOut" }
  }
};

export const buttonMagnetic = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 }
};

export const slideInLeft = {
  initial: { opacity: 0, x: -100 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

export const slideInRight = {
  initial: { opacity: 0, x: 100 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};
```

### 1.2 Create Scroll Animation Hook (`src/hooks/useScrollAnimation.ts`)

```typescript
// Custom hook for triggering animations on scroll
export function useScrollAnimation(threshold = 0.1) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  
  return { ref, isVisible };
}
```

### 1.3 Update Tailwind Config

Add new animations and gradients:
- Animated gradient mesh background
- Marquee scroll animation
- Glow pulse effects
- Parallax keyframes

---

## Phase 2: Landing Page Complete Redesign

### 2.1 AnimatedBackground Component

Features:
- CSS animated gradient mesh (indigo → purple → pink)
- Floating orb decorations with blur
- Optimized with `will-change` for performance
- Reduced motion support via `prefers-reduced-motion`

### 2.2 HeroSection Component

Elements:
- Full-viewport hero with animated gradient
- **Headline**: "Transform Your Workforce Management with TeneXA"
  - Word-by-word stagger animation
  - Gradient text on key words
- **Subheadline**: Fade-in with delay
- **CTAs**: 
  - Primary: "Start Free Trial" with pulse glow
  - Secondary: "Watch Demo" with play icon and hover morph
- **Product mockup**: Floating animation with parallax on scroll
- **Trust badges**: Logo marquee carousel

### 2.3 ProblemSolutionSection Component

Layout: Dark background split-screen

| Pain Points (Left) | Solutions (Right) |
|-------------------|-------------------|
| Disconnected HR systems | Unified platform |
| Manual attendance | GPS-based tracking |
| Spreadsheet chaos | Project management |
| Delayed payroll | Automated processing |
| No visibility | AI forecasting |

Interaction: Hover on problem highlights matching solution

### 2.4 FeaturesGrid Component

Bento grid layout with 12 feature cards:

| Large Card | Medium Card | Medium Card |
|------------|-------------|-------------|
| HR Mgmt (animated preview) | Attendance | Projects |
| **Analytics** (chart animation) | Payroll | Leave |
| Small: OKRs | Small: Recruitment | Small: Training |

Each card features:
- Animated icon (Lottie or SVG)
- Glassmorphic background
- Hover: lift + glow + scale
- "Learn more" arrow that slides

### 2.5 HowItWorksSection Component

Vertical timeline with 3 steps:
1. **Setup** - Animated wizard mockup
2. **Customize** - Drag-drop configuration demo
3. **Launch** - Success dashboard with confetti

Center line: Animated progress fill on scroll
Step content: Alternates left/right

### 2.6 TestimonialsSection Component

Auto-scrolling marquee carousel:
- Testimonial cards with company logos
- 5-star rating animations
- Pause on hover
- Gradient fade on edges
- Duplicate items for seamless loop

### 2.7 StatsSection Component

4 metrics with count-up animations:
- 500+ Companies (animated counter)
- 50,000+ Employees
- 99.9% Uptime
- 24/7 Support

Animation: Triggered when section enters viewport

### 2.8 IntegrationsSection Component

Floating logo grid:
- Razorpay, Slack, Teams, Google, Zoom, Tally logos
- 3D floating effect with parallax
- Connecting lines animation
- Hover: Logo scales with glow

### 2.9 CTASection Component

Full-width gradient with mesh animation:
- "Ready to Transform?" headline
- Primary + Secondary CTAs
- Trust badges below
- Magnetic button hover effect

---

## Phase 3: PublicHeader Enhancement

### 3.1 Desktop Navigation

Features:
- Transparent header → solid on scroll (backdrop-blur)
- Shrink animation on scroll (height: 72px → 64px)
- Mega menu dropdowns for Features and Resources

```
[Logo] ─── [Features ▾] [Pricing] [Resources ▾] [About] ─── [Login] [Start Free Trial]
```

### 3.2 Features Mega Menu

4-column layout showing all modules:
- HR Management (icon + description)
- Attendance & Time
- Projects & Tasks
- Payroll & Finance
- Performance & OKRs
- And more...

### 3.3 Mobile Navigation

- Hamburger → full-screen overlay
- Staggered item animations
- Accordion for nested menus
- Prominent CTA at bottom

---

## Phase 4: PublicFooter Enhancement

### 4.1 5-Column Layout

```
[Logo + Tagline]   [Product]     [Company]    [Resources]   [Legal]
Social icons       Features      About Us     Blog          Privacy
Made in India      Pricing       Careers      Help Center   Terms
                   Integrations  Contact      API Docs      Security
                   Updates       Press Kit    Status        GDPR
```

### 4.2 Bottom Bar

```
© 2026 TeneXA. All rights reserved.  |  Made with ❤️ in भारत 🇮🇳
```

---

## Phase 5: Features Page Redesign

### 5.1 Tabbed Interface

Replace alternating cards with interactive tabs:

| Tab | Content |
|-----|---------|
| HR Management | Screenshots + feature checklist |
| Attendance | Mobile app demo video |
| Projects | Interactive kanban preview |
| Payroll | Dashboard animation |
| Performance | OKR tracking demo |
| Analytics | Interactive chart |

### 5.2 Comparison Table

TeneXA vs competitors:
- Sticky header columns
- Row highlight on hover
- Checkmarks animated on scroll
- TeneXA column highlighted

---

## Phase 6: Pricing Page Enhancement

### 6.1 Plan Cards

4 plans with enhanced styling:
- **Starter**: Basic card
- **Professional**: Elevated with glow border, "Most Popular" badge
- **Enterprise**: Premium gradient border
- **Custom**: Contact sales

### 6.2 Monthly/Annual Toggle

- Smooth price transition animation
- "Save 20%" badge animation
- Toggle switch with spring physics

### 6.3 Feature Comparison Table

Expandable categories:
- HR Management (5 features)
- Attendance (4 features)
- Projects (6 features)
- And more...

---

## Phase 7: New Pages

### 7.1 About Page (`/about`)

Sections:
- Hero with mission statement
- Our Story timeline
- Values grid (4 cards)
- Team section with hover cards
- Stats reused from landing
- CTA section

### 7.2 Start Trial Page (`/start-trial`)

Multi-step wizard:
1. Your Info (name, email, phone)
2. Company Details (size, industry)
3. Preferences (modules, start date)

Features:
- Progress bar animation
- Step transition animations
- Inline validation
- Success confetti on completion

### 7.3 Resources/Blog Page (`/resources`)

Layout:
- Search with autocomplete
- Category filter pills
- Grid/list toggle
- Featured post hero
- Blog card grid with hover effects
- Pagination

---

## Phase 8: Additional Components

### 8.1 StickyCtaBar Component

- Appears after 50% scroll
- Slide-up animation
- Gradient background
- "Start Free Trial" CTA
- Close button

### 8.2 CookieBanner Component

- GDPR-compliant consent
- Slide-up from bottom
- Accept/Customize buttons
- Stores preference in localStorage

---

## Technical Implementation Details

### Design Tokens

```css
/* Colors */
--color-primary: #4f46e5 (Indigo-600)
--color-secondary: #9333ea (Purple-600)
--color-accent: #ec4899 (Pink-500)

/* Gradients */
--gradient-hero: linear-gradient(-45deg, #4f46e5, #9333ea, #ec4899)
--gradient-mesh: Animated mesh using CSS houdini or SVG

/* Typography */
--font-heading: Inter (700, -0.02em tracking)
--font-body: Inter (400)
```

### Performance Optimizations

1. **Images**: Lazy loading, WebP format, responsive sizes
2. **Animations**: CSS transforms only, `will-change` hints
3. **Code splitting**: Dynamic imports for heavy components
4. **Fonts**: Self-hosted, font-display: swap

### Accessibility

- Semantic HTML throughout
- ARIA labels on interactive elements
- Focus-visible outlines
- Skip links maintained
- Reduced motion media query support:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Implementation Order

| Priority | Task | Files |
|----------|------|-------|
| 1 | Animation utilities | animations.ts, useScrollAnimation.ts |
| 2 | Landing page sections | All landing/ components |
| 3 | Landing page assembly | Landing.tsx |
| 4 | Header/Footer updates | PublicHeader.tsx, PublicFooter.tsx |
| 5 | Features page redesign | Features.tsx |
| 6 | Pricing enhancements | Pricing.tsx |
| 7 | About page | About.tsx |
| 8 | Trial signup page | StartTrial.tsx |
| 9 | Resources page | Resources.tsx |
| 10 | Sticky CTA + Cookie banner | StickyCtaBar.tsx, CookieBanner.tsx |
| 11 | Tailwind config updates | tailwind.config.ts |
| 12 | App routing | App.tsx |

---

## Files to Create/Modify

### New Files (18)

| File | Purpose |
|------|---------|
| `src/lib/animations.ts` | Framer Motion animation presets |
| `src/hooks/useScrollAnimation.ts` | Intersection Observer hook |
| `src/components/landing/HeroSection.tsx` | Animated hero |
| `src/components/landing/ProblemSolutionSection.tsx` | Split-screen |
| `src/components/landing/FeaturesGrid.tsx` | Bento grid |
| `src/components/landing/HowItWorksSection.tsx` | Timeline |
| `src/components/landing/TestimonialsSection.tsx` | Carousel |
| `src/components/landing/StatsSection.tsx` | Count-up stats |
| `src/components/landing/IntegrationsSection.tsx` | Logo grid |
| `src/components/landing/CTASection.tsx` | Final CTA |
| `src/components/landing/AnimatedBackground.tsx` | Gradient mesh |
| `src/components/landing/TrustBadges.tsx` | Logo marquee |
| `src/components/landing/StickyCtaBar.tsx` | Floating CTA |
| `src/components/public/CookieBanner.tsx` | GDPR consent |
| `src/pages/About.tsx` | About Us page |
| `src/pages/StartTrial.tsx` | Dedicated trial page |
| `src/pages/Resources.tsx` | Blog/resources page |

### Modified Files (7)

| File | Changes |
|------|---------|
| `src/pages/Landing.tsx` | Complete redesign with new sections |
| `src/pages/Features.tsx` | Tabbed interface + comparison |
| `src/pages/Pricing.tsx` | Enhanced cards + comparison table |
| `src/pages/Contact.tsx` | Add map integration |
| `src/components/public/PublicHeader.tsx` | Mega menus + scroll effects |
| `src/components/public/PublicFooter.tsx` | 5-column layout |
| `src/App.tsx` | Add new routes |
| `tailwind.config.ts` | New animations + utilities |

---

## Expected Outcomes

1. **Conversion-focused design** with prominent CTAs throughout
2. **Modern 2026 aesthetics** with gradients, glassmorphism, animations
3. **Improved engagement** via interactive elements and micro-interactions
4. **Better storytelling** through problem-solution and timeline sections
5. **Enhanced credibility** with testimonials, stats, and trust badges
6. **Mobile-first responsiveness** across all breakpoints
7. **Accessibility compliance** (WCAG 2.1 AA)
8. **Performance optimized** (target: LCP < 2.5s, FID < 100ms)

