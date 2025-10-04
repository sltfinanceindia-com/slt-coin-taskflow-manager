import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { useAuthEmailNotifications } from "@/hooks/useAuthEmailNotifications";
import { ThemeProvider } from "@/components/ThemeProvider";
import ModernDashboard from "./pages/ModernDashboard";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Training from "./pages/Training";
import Assessment from "./pages/Assessment";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  useAuthEmailNotifications();

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ModernDashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/training" element={<Training />} />
          <Route path="/assessment/:id" element={<Assessment />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
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
