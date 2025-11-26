import { InternDashboard } from "@/components/InternDashboard";
import { AdminDashboard } from "@/components/AdminDashboard";
import { LandingPage } from "@/components/LandingPage";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show landing page if not logged in
  if (!profile) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen bg-background">
      {profile.role === 'admin' ? <AdminDashboard /> : <InternDashboard />}
    </div>
  );
};

export default Index;
