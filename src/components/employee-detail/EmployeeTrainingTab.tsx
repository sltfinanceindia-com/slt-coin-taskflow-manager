/**
 * Employee Training Tab
 * Enrolled courses, completed certifications, recommended courses
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { GraduationCap, Award, BookOpen, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface EmployeeTrainingTabProps {
  employeeId: string;
}

export function EmployeeTrainingTab({ employeeId }: EmployeeTrainingTabProps) {
  // Enrollments would be fetched here when properly connected
  const enrollments: any[] = [];

  const inProgressCourses = enrollments.filter((e: any) => e.status === 'in_progress');
  const completedCourses = enrollments.filter((e: any) => e.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Enrolled Courses */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Enrolled Courses
              </CardTitle>
              <CardDescription>Currently active training programs</CardDescription>
            </div>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Enroll
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {inProgressCourses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No active courses</p>
            </div>
          ) : (
            <div className="space-y-4">
              {inProgressCourses.map((enrollment: any) => (
                <div key={enrollment.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{enrollment.courses?.title || 'Course'}</h4>
                    <Badge variant="outline">{enrollment.progress || 0}%</Badge>
                  </div>
                  <Progress value={enrollment.progress || 0} className="h-2" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed Certifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="h-5 w-5" />
            Completed Certifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {completedCourses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No certifications earned yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedCourses.map((enrollment: any) => (
                <div key={enrollment.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Award className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{enrollment.courses?.title || 'Course'}</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommended Courses */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Recommended Courses
          </CardTitle>
          <CardDescription>Based on role and career path</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recommendations available</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
