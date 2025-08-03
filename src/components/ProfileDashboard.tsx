import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AvatarUpload } from '@/components/AvatarUpload';
import { InternDetailView } from '@/components/InternDetailView';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { Coins, Clock, Target, User, Calendar, Award, Eye } from 'lucide-react';

export function ProfileDashboard() {
  const { profile: currentProfile } = useAuth();
  const { profile, stats, updateProfile, isUpdating } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [showDetailView, setShowDetailView] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    email: profile?.email || '',
    bio: profile?.bio || '',
    department: profile?.department || '',
    employee_id: profile?.employee_id || '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = () => {
    updateProfile(formData);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setFormData({
      full_name: profile?.full_name || '',
      email: profile?.email || '',
      bio: profile?.bio || '',
      department: profile?.department || '',
      employee_id: profile?.employee_id || '',
    });
    setIsEditing(false);
  };

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-background">
      {/* Header with navigation */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src="/lovable-uploads/56d5dd03-2808-4b88-9f9c-cc8932c46fe8.png" 
                alt="SLT Finance India"
                className="h-8 sm:h-10 w-auto object-contain"
              />
              <div>
                <h1 className="font-bold text-lg text-primary">My Profile</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Personal Information & Settings</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetailView(true)}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Analytics
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.history.back()}
                className="text-xs sm:text-sm"
              >
                ← Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
        {/* Profile Header */}
        <Card className="card-gradient">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
              <div className="flex-shrink-0">
                <AvatarUpload
                  currentAvatarUrl={profile.avatar_url}
                  userName={profile.full_name}
                  size="lg"
                />
              </div>
              <div className="flex-1 min-w-0 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <CardTitle className="text-xl sm:text-2xl truncate">{profile.full_name}</CardTitle>
                    <CardDescription className="text-sm sm:text-base truncate">{profile.email}</CardDescription>
                    <Badge variant="secondary" className="mt-2 text-xs">
                      {profile.role === 'admin' ? 'Administrator' : 'Intern'}
                    </Badge>
                  </div>
                  <Button
                    variant={isEditing ? "destructive" : "outline"}
                    onClick={isEditing ? handleCancelEdit : () => setIsEditing(true)}
                    size="sm"
                    className="shrink-0"
                  >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </Button>
                </div>
                {profile.bio && (
                  <p className="text-muted-foreground text-sm leading-relaxed">{profile.bio}</p>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="hover-scale">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Total Tasks</p>
                  <p className="text-lg sm:text-2xl font-bold">{stats?.totalTasks || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover-scale">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Completed</p>
                  <p className="text-lg sm:text-2xl font-bold">{stats?.completedTasks || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover-scale">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 sm:h-5 sm:w-5 text-coin-gold flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Total Coins</p>
                  <p className="text-lg sm:text-2xl font-bold text-coin-gold">{stats?.totalCoins || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover-scale">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Weekly Hours</p>
                  <p className="text-lg sm:text-2xl font-bold">{stats?.weeklyHours || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Details */}
        <Tabs defaultValue="personal" className="space-y-4">
          <div className="w-full overflow-x-auto">
            <TabsList className="grid w-full grid-cols-3 min-w-max">
              <TabsTrigger value="personal" className="text-xs sm:text-sm px-2 sm:px-4">Personal Info</TabsTrigger>
              <TabsTrigger value="professional" className="text-xs sm:text-sm px-2 sm:px-4">Professional</TabsTrigger>
              <TabsTrigger value="performance" className="text-xs sm:text-sm px-2 sm:px-4">Performance</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="personal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Personal Information</CardTitle>
                <CardDescription className="text-sm">
                  Manage your personal details and contact information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="text-sm font-medium">Full Name</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      disabled={!isEditing}
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={!isEditing}
                      className="text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself..."
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    disabled={!isEditing}
                    rows={3}
                    className="text-sm resize-none"
                  />
                </div>
                {isEditing && (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button onClick={handleSaveProfile} disabled={isUpdating} size="sm">
                      {isUpdating ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button variant="outline" onClick={handleCancelEdit} size="sm">
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="professional" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Professional Details</CardTitle>
                <CardDescription className="text-sm">
                  Your work-related information and credentials.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employee_id" className="text-sm font-medium">Employee ID</Label>
                    <Input
                      id="employee_id"
                      value={formData.employee_id}
                      onChange={(e) => handleInputChange('employee_id', e.target.value)}
                      disabled={!isEditing}
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-sm font-medium">Department</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      disabled={!isEditing}
                      className="text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Start Date</Label>
                    <Input
                      type="date"
                      value={profile.start_date || ''}
                      disabled={!isEditing}
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">End Date</Label>
                    <Input
                      type="date"
                      value={profile.end_date || ''}
                      disabled={!isEditing}
                      className="text-sm"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Performance Overview</CardTitle>
                <CardDescription className="text-sm">
                  Your task completion and productivity metrics.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Task Completion Rate</span>
                        <span className="text-sm font-medium">
                          {stats?.totalTasks ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${stats?.totalTasks ? (stats.completedTasks / stats.totalTasks) * 100 : 0}%` 
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Monthly Hours Goal</span>
                        <span className="text-sm font-medium">{stats?.monthlyHours || 0}/160</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-secondary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((stats?.monthlyHours || 0) / 160 * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Detailed Analytics View */}
        {showDetailView && profile && (
          <InternDetailView
            internId={profile.id}
            onClose={() => setShowDetailView(false)}
          />
        )}
      </main>
    </div>
  );
}