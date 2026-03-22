# TeneXA - Enterprise Workforce Management Platform

## Overview
TeneXA (formerly SLT Work Hub) is a comprehensive multi-tenant HRMS/ERP SaaS platform built with React + TypeScript and Supabase. It includes modules for HR management, payroll, attendance, projects, tasks, communication, finance, OKRs, and AI features.

## Architecture
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router v6
- **UI**: Radix UI primitives + shadcn/ui components

## Running the App
- **Dev server**: `npm run dev` (runs on port 5000)
- **Build**: `npm run build`

## Environment Variables
The following are stored as Replit environment variables:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Supabase anon/public key
- `VITE_SUPABASE_PROJECT_ID` - Supabase project ID
- `DATABASE_URL` - Neon PostgreSQL connection string (provisioned, available for future server-side use)

## Key Directories
- `src/pages/` - All page components (Landing, Auth, Dashboard, modules, etc.)
- `src/hooks/` - Custom React hooks (useAuth, useOrganization, data hooks)
- `src/components/` - Reusable UI components
- `src/integrations/supabase/` - Supabase client and TypeScript types
- `supabase/migrations/` - 204 SQL migration files defining the full schema

## Auth & Multi-tenancy
- Auth handled entirely by Supabase Auth
- Multi-tenant: Each organization has its own `organization_id`
- Roles: super_admin, org_admin, admin, hr_admin, project_manager, finance_manager, manager, team_lead, employee, intern
- Main org: SLT Finance India (org_id: 81ce98aa-c524-4872-ab4c-95e66fe49a08)

## Migration from Lovable
- Removed `lovable-tagger` dependency (Lovable-specific)
- Updated `vite.config.ts` to run on port 5000 with `host: "0.0.0.0"` for Replit
- Removed `componentTagger()` plugin (Lovable-specific)
- Supabase credentials moved from hardcoded `.env` to Replit environment variables
- `.env` added to `.gitignore`

## Guided Product Tour
- **Package**: react-joyride for interactive step-by-step tooltips
- **Tour config**: `src/config/tourSteps.ts` — role-based step definitions using actual navigation `data-tab-url` selectors
- **Tour state**: `src/hooks/useTour.tsx` — TourStateProvider with localStorage persistence per user ID
- **Components**: `src/components/tour/WelcomeDialog.tsx` (first-login welcome modal), `src/components/tour/GuidedTour.tsx` (Joyride wrapper)
- **Integration**: Mounted inside BrowserRouter in `src/App.tsx`, gated to `/dashboard` route only
- **Restart**: "Restart Tour" button in `src/components/ProfileDashboard.tsx`
