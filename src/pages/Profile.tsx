
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, User, Calendar, Mail, Briefcase } from 'lucide-react';
import { UserAssessmentResults } from '@/components/assessment/UserAssessmentResults';

export default function Profile() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-background">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
            Profile
          </h1>
          <p className="text-muted-foreground">
            Manage your account information and view your progress.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-1">
            <Card className="card-gradient">
              <CardHeader className="text-center">
                <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl">{profile?.full_name}</CardTitle>
                <CardDescription className="text-lg">
                  <Badge variant={profile?.role === 'admin' ? 'default' : 'secondary'}>
                    {profile?.role === 'admin' ? 'Administrator' : 'Intern'}
                  </Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Coins className="h-5 w-5 text-coin-gold" />
                    <span className="text-sm text-muted-foreground">Total SLT Coins</span>
                  </div>
                  <div className="text-3xl font-bold text-coin-gold">
                    {profile?.total_coins || 0}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{profile?.email}</span>
                  </div>
                  
                  {profile?.department && (
                    <div className="flex items-center space-x-3 text-sm">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span>{profile.department}</span>
                    </div>
                  )}
                  
                  {profile?.employee_id && (
                    <div className="flex items-center space-x-3 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>ID: {profile.employee_id}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-3 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Joined: {new Date(profile?.created_at || '').toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Assessment Results */}
          <div className="lg:col-span-2">
            <UserAssessmentResults />
          </div>
        </div>
      </div>
    </div>
  );
}
