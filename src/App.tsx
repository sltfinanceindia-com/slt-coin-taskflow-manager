import { useState, useEffect, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UnifiedAssistant } from "@/components/ai/UnifiedAssistant";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { OrganizationProvider } from "@/hooks/useOrganization";
import { SidebarProvider as AppSidebarProvider } from "@/contexts/SidebarContext";
import { useAuthEmailNotifications } from "@/hooks/useAuthEmailNotifications";
import { useUserRole } from "@/hooks/useUserRole";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeApplier } from "@/components/ThemeApplier";
import { SkipLink } from "@/components/SkipLink";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { ContentProtection } from "@/components/ContentProtection";
import SplashScreen from "@/components/SplashScreen";
import { useVisibilityHandler } from '@/hooks/useVisibilityHandler';

// Eagerly loaded public pages (small, critical path)
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Signup from "./pages/Signup";

// Lazy-loaded pages
const Features = lazy(() => import("@/pages/Features"));
const Terms = lazy(() => import("@/pages/Terms"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const Contact = lazy(() => import("@/pages/Contact"));
const About = lazy(() => import("@/pages/About"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Resources = lazy(() => import("./pages/Resources"));
const StartTrial = lazy(() => import("./pages/StartTrial"));
const FeedbackPage = lazy(() => import('./pages/Feedback'));
const NotFound = lazy(() => import("./pages/NotFound"));
const HelpCenterPage = lazy(() => import("./pages/HelpCenterPage"));

// Protected pages - lazy loaded
const ModernDashboard = lazy(() => import("./pages/ModernDashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const Training = lazy(() => import("./pages/Training"));
const Assessment = lazy(() => import("./pages/Assessment"));
const CalendarPage = lazy(() => import("./pages/CalendarPage"));
const KudosWallPage = lazy(() => import("./pages/KudosWall"));
const PulseSurveysPage = lazy(() => import("./pages/PulseSurveys"));
const MyGoalsPage = lazy(() => import("./pages/MyGoals"));
const TutorialPage = lazy(() => import("./pages/Tutorial"));

// Detail pages
const TaskDetailPage = lazy(() => import("./pages/TaskDetailPage"));
const PortfolioDetailPage = lazy(() => import("./pages/PortfolioDetailPage"));
const ProgramDetailPage = lazy(() => import("./pages/ProgramDetailPage"));
const EmployeeDetailPage = lazy(() => import("./pages/EmployeeDetailPage"));
const ProjectDetailPage = lazy(() => import("./pages/ProjectDetailPage"));

// Module pages
const EmployeesPage = lazy(() => import("./pages/modules/EmployeesPage"));
const ProjectsPage = lazy(() => import("./pages/modules/ProjectsPage"));
const AttendancePage = lazy(() => import("./pages/modules/AttendancePage"));
const LeavesPage = lazy(() => import("./pages/modules/LeavesPage"));
const PayrollPage = lazy(() => import("./pages/modules/PayrollPage"));
const PerformancePage = lazy(() => import("./pages/modules/PerformancePage"));
const ApprovalsPage = lazy(() => import("./pages/modules/ApprovalsPage"));
const ReportsPage = lazy(() => import("./pages/modules/ReportsPage"));
const TasksPage = lazy(() => import("./pages/modules/TasksPage"));

// Super Admin pages
const SuperAdminDashboard = lazy(() => import("./pages/super-admin/SuperAdminDashboard"));
const OrganizationsList = lazy(() => import("./pages/super-admin/OrganizationsList"));
const CreateOrganization = lazy(() => import("./pages/super-admin/CreateOrganization"));
const OrganizationDetail = lazy(() => import("./pages/super-admin/OrganizationDetail"));
const SuperAdminUsers = lazy(() => import("./pages/super-admin/SuperAdminUsers"));
const SuperAdminSettings = lazy(() => import("./pages/super-admin/SuperAdminSettings"));
const BillingDashboard = lazy(() => import("./pages/super-admin/BillingDashboard"));
const SubscriptionAnalytics = lazy(() => import("./pages/super-admin/SubscriptionAnalytics"));
const PlansManagement = lazy(() => import("./pages/super-admin/PlansManagement"));
const SystemHealth = lazy(() => import("./pages/super-admin/SystemHealth"));
const AuditTrail = lazy(() => import("./pages/super-admin/AuditTrail"));
const PlatformAnnouncements = lazy(() => import("./pages/super-admin/PlatformAnnouncements"));
const FeedbackRewards = lazy(() => import('./pages/super-admin/FeedbackRewards'));

// Admin pages
const OrganizationSettings = lazy(() => import("./pages/admin/OrganizationSettings"));
const RolesPermissions = lazy(() => import("./pages/settings/RolesPermissions"));
const OrgChartPage = lazy(() => import("./pages/organization/OrgChart"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      gcTime: 1000 * 60 * 10,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
  },
});

// Suspense fallback
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function SuperAdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { isSuperAdmin, isLoading: roleLoading } = useUserRole();

  if (loading || roleLoading) {
    return <PageLoader />;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function AppContent() {
  useAuthEmailNotifications();
  useVisibilityHandler();
  const { user, loading } = useAuth();
  const { isSuperAdmin } = useUserRole();
  const [showSplash, setShowSplash] = useState(true);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [initialAuthChecked, setInitialAuthChecked] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading) {
      setInitialAuthChecked(true);
    }
  }, [loading]);

  const isPublicRoute = typeof window !== 'undefined' && 
    ['/', '/auth', '/signup', '/pricing', '/features', '/terms', '/privacy', '/contact', '/about', '/resources', '/start-trial', '/feedback'].includes(window.location.pathname);

  const shouldShowSplash = showSplash && 
    (!minTimeElapsed || loading) && 
    !isPublicRoute && 
    (user || !initialAuthChecked);

  if (shouldShowSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} minDuration={2500} />;
  }

  return (
    <ContentProtection>
      <TooltipProvider>
        <ThemeApplier />
        <SkipLink />
        <Toaster />
        <Sonner />
        <PWAInstallPrompt />
        {user && <UnifiedAssistant />}
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Landing />} />
          <Route path="/auth" element={user ? <Navigate to="/dashboard" replace /> : <Auth />} />
          <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <Signup />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/features" element={<Features />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/start-trial" element={<StartTrial />} />
          
          {/* Super Admin Routes */}
          <Route path="/super-admin" element={<SuperAdminRoute><SuperAdminDashboard /></SuperAdminRoute>} />
          <Route path="/super-admin/organizations" element={<SuperAdminRoute><OrganizationsList /></SuperAdminRoute>} />
          <Route path="/super-admin/organizations/new" element={<SuperAdminRoute><CreateOrganization /></SuperAdminRoute>} />
          <Route path="/super-admin/organizations/:id" element={<SuperAdminRoute><OrganizationDetail /></SuperAdminRoute>} />
          <Route path="/super-admin/users" element={<SuperAdminRoute><SuperAdminUsers /></SuperAdminRoute>} />
          <Route path="/super-admin/billing" element={<SuperAdminRoute><BillingDashboard /></SuperAdminRoute>} />
          <Route path="/super-admin/analytics" element={<SuperAdminRoute><SubscriptionAnalytics /></SuperAdminRoute>} />
          <Route path="/super-admin/plans" element={<SuperAdminRoute><PlansManagement /></SuperAdminRoute>} />
          <Route path="/super-admin/settings" element={<SuperAdminRoute><SuperAdminSettings /></SuperAdminRoute>} />
          <Route path="/super-admin/feedback-rewards" element={<SuperAdminRoute><FeedbackRewards /></SuperAdminRoute>} />
          <Route path="/super-admin/health" element={<SuperAdminRoute><SystemHealth /></SuperAdminRoute>} />
          <Route path="/super-admin/audit" element={<SuperAdminRoute><AuditTrail /></SuperAdminRoute>} />
          <Route path="/super-admin/announcements" element={<SuperAdminRoute><PlatformAnnouncements /></SuperAdminRoute>} />
          
          {/* Public Routes */}
          <Route path="/feedback" element={<FeedbackPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin/settings" element={<ProtectedRoute><OrganizationSettings /></ProtectedRoute>} />
          <Route path="/admin/organization-settings" element={<ProtectedRoute><OrganizationSettings /></ProtectedRoute>} />
          <Route path="/settings" element={<Navigate to="/admin/organization-settings" replace />} />
          <Route path="/admin/roles-permissions" element={<ProtectedRoute><RolesPermissions /></ProtectedRoute>} />
          <Route path="/organization/chart" element={<ProtectedRoute><OrgChartPage /></ProtectedRoute>} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><ModernDashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/training" element={<ProtectedRoute><Training /></ProtectedRoute>} />
          <Route path="/assessment/:id" element={<ProtectedRoute><Assessment /></ProtectedRoute>} />
          <Route path="/kudos" element={<ProtectedRoute><KudosWallPage /></ProtectedRoute>} />
          <Route path="/pulse-surveys" element={<ProtectedRoute><PulseSurveysPage /></ProtectedRoute>} />
          <Route path="/my-goals" element={<ProtectedRoute><MyGoalsPage /></ProtectedRoute>} />
          <Route path="/tutorial" element={<ProtectedRoute><TutorialPage /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
          <Route path="/help" element={<HelpCenterPage />} />
          
          {/* Module Landing Pages */}
          <Route path="/employees" element={<ProtectedRoute><EmployeesPage /></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
          <Route path="/tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute><AttendancePage /></ProtectedRoute>} />
          <Route path="/leaves" element={<ProtectedRoute><LeavesPage /></ProtectedRoute>} />
          <Route path="/payroll" element={<ProtectedRoute><PayrollPage /></ProtectedRoute>} />
          <Route path="/performance" element={<ProtectedRoute><PerformancePage /></ProtectedRoute>} />
          <Route path="/approvals" element={<ProtectedRoute><ApprovalsPage /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
          
          {/* Detail Pages */}
          <Route path="/tasks/:id" element={<ProtectedRoute><TaskDetailPage /></ProtectedRoute>} />
          <Route path="/portfolios/:id" element={<ProtectedRoute><PortfolioDetailPage /></ProtectedRoute>} />
          <Route path="/programs/:id" element={<ProtectedRoute><ProgramDetailPage /></ProtectedRoute>} />
          <Route path="/employees/:id" element={<ProtectedRoute><EmployeeDetailPage /></ProtectedRoute>} />
          <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetailPage /></ProtectedRoute>} />
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
    </ContentProtection>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="tenexa-ui-theme">
      <AuthProvider>
        <OrganizationProvider>
          <AppSidebarProvider>
            <AppContent />
          </AppSidebarProvider>
        </OrganizationProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
