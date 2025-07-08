import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { TrainingManagement } from '@/components/TrainingManagement';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { 
  BookOpen, 
  Play, 
  Award, 
  Clock, 
  CheckCircle, 
  Users,
  TrendingUp,
  Calendar,
  FileText
} from 'lucide-react';

interface TrainingSection {
  id: string;
  title: string;
  description: string;
  order_index: number;
  is_published: boolean;
  videos?: TrainingVideo[];
  assignments?: TrainingAssignment[];
}

interface TrainingVideo {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url?: string;
  duration_minutes?: number;
  is_published: boolean;
}

interface TrainingAssignment {
  id: string;
  title: string;
  description: string;
  instructions?: string;
  due_days: number;
  max_points: number;
  is_published: boolean;
}

export default function Training() {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch published training sections for interns
  const { data: sections = [], isLoading } = useQuery({
    queryKey: ['published-training-sections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('training_sections')
        .select(`
          *,
          training_videos(*),
          training_assignments(*)
        `)
        .eq('is_published', true)
        .order('order_index');
      
      if (error) throw error;
      return data as TrainingSection[];
    },
    enabled: !!user
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <BookOpen className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading training content...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Admin view - show training management
  if (profile?.role === 'admin') {
    return (
      <div className="min-h-screen bg-gradient-background">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
          <TrainingManagement />
        </div>
      </div>
    );
  }

  // Intern view - show training content
  const totalVideos = sections.reduce((acc, section) => acc + (section.videos?.length || 0), 0);
  const totalAssignments = sections.reduce((acc, section) => acc + (section.assignments?.length || 0), 0);
  const totalDuration = sections.reduce((acc, section) => 
    acc + (section.videos?.reduce((videoAcc, video) => videoAcc + (video.duration_minutes || 0), 0) || 0), 0
  );

  return (
    <div className="min-h-screen bg-gradient-background">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
            SLT Finance Training Hub
          </h1>
          <p className="text-muted-foreground text-sm sm:text-lg">
            Enhance your skills with comprehensive training programs designed for finance professionals.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Courses
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="card-gradient">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{sections.length}</p>
                      <p className="text-xs text-muted-foreground">Training Sections</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-gradient">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                      <Play className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{totalVideos}</p>
                      <p className="text-xs text-muted-foreground">Video Lessons</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-gradient">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Award className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{totalAssignments}</p>
                      <p className="text-xs text-muted-foreground">Assignments</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-gradient">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{Math.round(totalDuration / 60)}h</p>
                      <p className="text-xs text-muted-foreground">Total Duration</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Progress Overview */}
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Your Progress
                </CardTitle>
                <CardDescription>Track your learning journey across all training modules</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Overall Progress</span>
                    <span className="text-sm text-muted-foreground">0%</span>
                  </div>
                  <Progress value={0} className="h-2" />
                  <p className="text-sm text-muted-foreground">
                    Get started with your first training section to begin tracking your progress.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Your latest training activities and achievements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No activity yet</h3>
                  <p className="text-muted-foreground">
                    Start your first training course to see your activity here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <BookOpen className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : sections.length === 0 ? (
              <Card className="card-gradient">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No training content available</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    Training courses are being prepared for you. Check back soon for exciting learning opportunities!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {sections.map((section) => (
                  <Card key={section.id} className="card-gradient hover-scale">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                            <BookOpen className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-xl">{section.title}</CardTitle>
                            <CardDescription className="mt-1">{section.description}</CardDescription>
                          </div>
                        </div>
                        <Badge variant="default" className="bg-success text-success-foreground">
                          Available
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <Play className="h-4 w-4 text-primary" />
                          <span className="text-sm">
                            {section.videos?.length || 0} video{(section.videos?.length || 0) !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Award className="h-4 w-4 text-accent" />
                          <span className="text-sm">
                            {section.assignments?.length || 0} assignment{(section.assignments?.length || 0) !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-secondary" />
                          <span className="text-sm">
                            {section.videos?.reduce((acc, video) => acc + (video.duration_minutes || 0), 0) || 0} minutes
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Progress</span>
                          <span className="text-sm text-muted-foreground">0%</span>
                        </div>
                        <Progress value={0} className="h-1" />
                      </div>

                      <Button className="w-full btn-primary">
                        <Play className="h-4 w-4 mr-2" />
                        Start Learning
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}