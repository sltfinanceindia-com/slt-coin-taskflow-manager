import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import Features from "@/pages/Features";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import Contact from "@/pages/Contact";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { OrganizationProvider } from "@/hooks/useOrganization";
import { useAuthEmailNotifications } from "@/hooks/useAuthEmailNotifications";
import { useUserRole } from "@/hooks/useUserRole";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeApplier } from "@/components/ThemeApplier";
import { SkipLink } from "@/components/SkipLink";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { ContentProtection } from "@/components/ContentProtection";
import SplashScreen from "@/components/SplashScreen";
import Landing from "./pages/Landing";
import ModernDashboard from "./pages/ModernDashboard";
import Auth from "./pages/Auth";
import Signup from "./pages/Signup";
import Pricing from "./pages/Pricing";
import Profile from "./pages/Profile";
import Training from "./pages/Training";
import Assessment from "./pages/Assessment";
import NotFound from "./pages/NotFound";
import SuperAdminDashboard from "./pages/super-admin/SuperAdminDashboard";
import OrganizationsList from "./pages/super-admin/OrganizationsList";
import CreateOrganization from "./pages/super-admin/CreateOrganization";
import OrganizationDetail from "./pages/super-admin/OrganizationDetail";
import SuperAdminUsers from "./pages/super-admin/SuperAdminUsers";
import SuperAdminSettings from "./pages/super-admin/SuperAdminSettings";
import BillingDashboard from "./pages/super-admin/BillingDashboard";
import SubscriptionAnalytics from "./pages/super-admin/SubscriptionAnalytics";
import PlansManagement from "./pages/super-admin/PlansManagement";
import SystemHealth from "./pages/super-admin/SystemHealth";
import AuditTrail from "./pages/super-admin/AuditTrail";
import PlatformAnnouncements from "./pages/super-admin/PlatformAnnouncements";
import OrganizationSettings from "./pages/admin/OrganizationSettings";
import RolesPermissions from "./pages/settings/RolesPermissions";
import OrgChartPage from "./pages/organization/OrgChart";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      refetchOnWindowFocus: true, // Refetch when tab becomes active
      refetchOnReconnect: true, // Refetch when network reconnects
    },
  },
});

import FeedbackPage from './pages/Feedback';
import FeedbackRewards from './pages/super-admin/FeedbackRewards';


// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-12 w-12 border-4 border-emerald-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppContent() {
  useAuthEmailNotifications();
  const { user, loading } = useAuth();
  const { isSuperAdmin } = useUserRole();
  const [showSplash, setShowSplash] = useState(true);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [initialAuthChecked, setInitialAuthChecked] = useState(false);

  // Show splash for minimum 2.5 seconds AND until auth is loaded
  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  // Track when initial auth check completes
  useEffect(() => {
    if (!loading) {
      setInitialAuthChecked(true);
    }
  }, [loading]);

  // Only show splash for authenticated users navigating to protected routes
  // Public pages load instantly without splash
  const isPublicRoute = typeof window !== 'undefined' && 
    ['/', '/auth', '/signup', '/pricing', '/features', '/terms', '/privacy', '/contact', '/feedback'].includes(window.location.pathname);

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
      <BrowserRouter>
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
          
          {/* Super Admin Routes */}
          <Route path="/super-admin" element={<ProtectedRoute><SuperAdminDashboard /></ProtectedRoute>} />
          <Route path="/super-admin/organizations" element={<ProtectedRoute><OrganizationsList /></ProtectedRoute>} />
          <Route path="/super-admin/organizations/new" element={<ProtectedRoute><CreateOrganization /></ProtectedRoute>} />
          <Route path="/super-admin/organizations/:id" element={<ProtectedRoute><OrganizationDetail /></ProtectedRoute>} />
          <Route path="/super-admin/users" element={<ProtectedRoute><SuperAdminUsers /></ProtectedRoute>} />
          <Route path="/super-admin/billing" element={<ProtectedRoute><BillingDashboard /></ProtectedRoute>} />
          <Route path="/super-admin/analytics" element={<ProtectedRoute><SubscriptionAnalytics /></ProtectedRoute>} />
          <Route path="/super-admin/plans" element={<ProtectedRoute><PlansManagement /></ProtectedRoute>} />
          <Route path="/super-admin/settings" element={<ProtectedRoute><SuperAdminSettings /></ProtectedRoute>} />
          <Route path="/super-admin/feedback-rewards" element={<ProtectedRoute><FeedbackRewards /></ProtectedRoute>} />
          <Route path="/super-admin/health" element={<ProtectedRoute><SystemHealth /></ProtectedRoute>} />
          <Route path="/super-admin/audit" element={<ProtectedRoute><AuditTrail /></ProtectedRoute>} />
          <Route path="/super-admin/announcements" element={<ProtectedRoute><PlatformAnnouncements /></ProtectedRoute>} />
          
          {/* Public Routes */}
          <Route path="/feedback" element={<FeedbackPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin/settings" element={<ProtectedRoute><OrganizationSettings /></ProtectedRoute>} />
          <Route path="/admin/roles-permissions" element={<ProtectedRoute><RolesPermissions /></ProtectedRoute>} />
          <Route path="/organization/chart" element={<ProtectedRoute><OrgChartPage /></ProtectedRoute>} />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <ModernDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/training" 
            element={
              <ProtectedRoute>
                <Training />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/assessment/:id" 
            element={
              <ProtectedRoute>
                <Assessment />
              </ProtectedRoute>
            } 
          />
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
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
          <AppContent />
        </OrganizationProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
