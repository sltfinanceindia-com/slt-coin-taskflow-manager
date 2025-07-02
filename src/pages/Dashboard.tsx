import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, LogOut, User, Clock, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Dashboard() {
  const { user, profile, signOut, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Coins className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Sign Out Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Coins className="h-6 w-6 text-coin-gold mr-2" />
                <h1 className="text-xl font-bold text-primary">SLT Finance India</h1>
              </div>
              <Badge variant={profile?.role === 'admin' ? 'default' : 'secondary'}>
                {profile?.role === 'admin' ? 'Admin' : 'Intern'}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Coins className="h-4 w-4 text-coin-gold" />
                <span className="font-semibold text-coin-gold">
                  {profile?.total_coins || 0} SLT Coins
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{profile?.full_name}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, {profile?.full_name}!
          </h2>
          <p className="text-muted-foreground">
            {profile?.role === 'admin' 
              ? 'Manage tasks, track progress, and assign SLT Coins to your team.'
              : 'View your assigned tasks, log your hours, and earn SLT Coins.'
            }
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total SLT Coins</CardTitle>
              <Coins className="h-4 w-4 text-coin-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-coin-gold">
                {profile?.total_coins || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Earned through completed tasks
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {profile?.role === 'admin' ? 'Active Tasks' : 'My Tasks'}
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                {profile?.role === 'admin' ? 'Total active tasks' : 'Currently assigned'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hours This Week</CardTitle>
              <Clock className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Time logged this week
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Role-specific Content */}
        {profile?.role === 'admin' ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Admin Dashboard</CardTitle>
                <CardDescription>
                  Manage tasks, track team performance, and assign SLT Coins
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button className="h-20 text-left flex-col items-start justify-center">
                    <span className="font-semibold mb-1">Create New Task</span>
                    <span className="text-sm opacity-80">Assign tasks with SLT Coin rewards</span>
                  </Button>
                  <Button variant="outline" className="h-20 text-left flex-col items-start justify-center">
                    <span className="font-semibold mb-1">Manage Team</span>
                    <span className="text-sm opacity-80">Add or remove team members</span>
                  </Button>
                  <Button variant="outline" className="h-20 text-left flex-col items-start justify-center">
                    <span className="font-semibold mb-1">Reports & Analytics</span>
                    <span className="text-sm opacity-80">View performance metrics</span>
                  </Button>
                  <Button variant="outline" className="h-20 text-left flex-col items-start justify-center">
                    <span className="font-semibold mb-1">Coin Management</span>
                    <span className="text-sm opacity-80">Approve and manage SLT Coins</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Intern Dashboard</CardTitle>
                <CardDescription>
                  View your tasks, log hours, and track your SLT Coin earnings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button className="h-20 text-left flex-col items-start justify-center">
                    <span className="font-semibold mb-1">My Tasks</span>
                    <span className="text-sm opacity-80">View and update assigned tasks</span>
                  </Button>
                  <Button variant="outline" className="h-20 text-left flex-col items-start justify-center">
                    <span className="font-semibold mb-1">Log Hours</span>
                    <span className="text-sm opacity-80">Track your working time</span>
                  </Button>
                  <Button variant="outline" className="h-20 text-left flex-col items-start justify-center">
                    <span className="font-semibold mb-1">My Coins</span>
                    <span className="text-sm opacity-80">View earnings and history</span>
                  </Button>
                  <Button variant="outline" className="h-20 text-left flex-col items-start justify-center">
                    <span className="font-semibold mb-1">Profile</span>
                    <span className="text-sm opacity-80">Update your information</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}