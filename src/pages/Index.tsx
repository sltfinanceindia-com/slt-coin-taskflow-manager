
import { InternDashboard } from "@/components/InternDashboard";
import { AdminDashboard } from "@/components/AdminDashboard";
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

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to access the system</h1>
          <p className="text-muted-foreground">You need to authenticate to use this application.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {profile.role === 'admin' ? <AdminDashboard /> : <InternDashboard />}
    </div>
  );
};

export default Index;
