import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useAuthEmailNotifications } from "@/hooks/useAuthEmailNotifications";
import { ThemeProvider } from "@/components/ThemeProvider";
import ModernDashboard from "./pages/ModernDashboard";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Training from "./pages/Training";
import Assessment from "./pages/Assessment";
import Calls from "./pages/Calls";
import NotFound from "./pages/NotFound";
import IncomingCallHandler from "@/components/communication/IncomingCallHandler";
import { useEffect } from "react";

const queryClient = new QueryClient();

function AppContent() {
  useAuthEmailNotifications();
  const { refreshSession, user, profile } = useAuth();

  // ✅ Auto-refresh session on mount
  useEffect(() => {
    const initSession = async () => {
      if (user && !profile) {
        console.log('🔄 Profile not loaded, refreshing session...');
        await refreshSession();
      }
    };

    initSession();
  }, [user, profile, refreshSession]);

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ModernDashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/training" element={<Training />} />
          <Route path="/calls" element={<Calls />} />
          <Route path="/assessment/:id" element={<Assessment />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        
        {/* ✅ Global incoming call handler */}
        <IncomingCallHandler />
      </BrowserRouter>
    </TooltipProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="slt-ui-theme">
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
