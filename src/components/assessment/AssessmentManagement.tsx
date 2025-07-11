
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useAssessments } from '@/hooks/useAssessments';
import { useAssessmentAttempts } from '@/hooks/useAssessmentAttempts';
import { FileText, Users, Clock, CheckCircle, XCircle, Search } from 'lucide-react';

export function AssessmentManagement() {
  const { assessments, isLoading } = useAssessments();
  const { attempts } = useAssessmentAttempts();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAttempts = attempts.filter(attempt =>
    attempt.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attempt.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attempt.assessments?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAttempts = attempts.length;
  const passedAttempts = attempts.filter(a => a.is_passed).length;
  const failedAttempts = attempts.filter(a => a.is_passed === false).length;
  const averageScore = attempts.length > 0 
    ? Math.round(attempts.reduce((sum, a) => sum + (a.score || 0), 0) / attempts.length)
    : 0;

  if (isLoading) {
    return (
      <Card className="card-gradient">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading assessments...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Assessment Management</h1>
        <p className="text-muted-foreground">
          Manage assessments and view user performance analytics.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-gradient">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assessments.length}</div>
            <p className="text-xs text-muted-foreground">
              Published assessments
            </p>
          </CardContent>
        </Card>

        <Card className="card-gradient">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attempts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAttempts}</div>
            <p className="text-xs text-muted-foreground">
              All user attempts
            </p>
          </CardContent>
        </Card>

        <Card className="card-gradient">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {passedAttempts} passed, {failedAttempts} failed
            </p>
          </CardContent>
        </Card>

        <Card className="card-gradient">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore}%</div>
            <p className="text-xs text-muted-foreground">
              Across all attempts
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="attempts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="attempts">User Attempts</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
        </TabsList>

        <TabsContent value="attempts" className="space-y-4">
          <Card className="card-gradient">
            <CardHeader>
              <CardTitle>Assessment Attempts</CardTitle>
              <CardDescription>
                View and analyze user assessment attempts and results.
              </CardDescription>
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by user name, email, or assessment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredAttempts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No assessment attempts found.
                  </div>
                ) : (
                  filteredAttempts.map((attempt) => (
                    <div key={attempt.id} className="border rounded-lg p-4 hover-scale">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">{attempt.profiles?.full_name || 'Unknown User'}</h3>
                            <Badge variant="secondary" className="text-xs">
                              {attempt.profiles?.email || 'No email'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {attempt.assessments?.title || 'Unknown Assessment'}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span>
                              Completed: {attempt.submitted_at ? new Date(attempt.submitted_at).toLocaleDateString() : 'In Progress'}
                            </span>
                            <span>
                              Questions: {attempt.correct_answers || 0}/{attempt.total_questions || 0}
                            </span>
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <div className="text-2xl font-bold">
                            {attempt.score || 0}%
                          </div>
                          <Badge variant={attempt.is_passed ? "default" : "destructive"}>
                            {attempt.is_passed ? (
                              <><CheckCircle className="h-3 w-3 mr-1" /> Passed</>
                            ) : (
                              <><XCircle className="h-3 w-3 mr-1" /> Failed</>
                            )}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessments" className="space-y-4">
          <Card className="card-gradient">
            <CardHeader>
              <CardTitle>Available Assessments</CardTitle>
              <CardDescription>
                Manage and configure assessments for training modules.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assessments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No assessments found.
                  </div>
                ) : (
                  assessments.map((assessment) => (
                    <div key={assessment.id} className="border rounded-lg p-4 hover-scale">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">{assessment.title}</h3>
                            <Badge variant={assessment.is_published ? "default" : "secondary"}>
                              {assessment.is_published ? "Published" : "Draft"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {assessment.description}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span>
                              <Clock className="h-3 w-3 inline mr-1" />
                              {assessment.time_limit_minutes} minutes
                            </span>
                            <span>
                              <FileText className="h-3 w-3 inline mr-1" />
                              {assessment.total_questions} questions
                            </span>
                            <span>
                              Passing: {assessment.passing_score}%
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">
                            {attempts.filter(a => a.assessment_id === assessment.id).length} attempts
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
