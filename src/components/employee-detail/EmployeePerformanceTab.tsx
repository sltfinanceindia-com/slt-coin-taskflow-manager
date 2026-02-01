/**
 * Employee Performance Tab
 * OKRs, reviews, feedback, skills matrix
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, Star, TrendingUp, Award } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface EmployeePerformanceTabProps {
  employeeId: string;
}

export function EmployeePerformanceTab({ employeeId }: EmployeePerformanceTabProps) {
  // OKRs would be fetched here when properly connected
  const okrs: any[] = [];

  return (
    <div className="space-y-6">
      {/* Current OKRs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            Current OKRs
          </CardTitle>
          <CardDescription>Objectives and key results for this quarter</CardDescription>
        </CardHeader>
        <CardContent>
          {okrs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No OKRs assigned</p>
            </div>
          ) : (
            <div className="space-y-4">
              {okrs.map((okr: any) => (
                <div key={okr.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{okr.title}</h4>
                    <Badge variant="outline">{okr.progress || 0}%</Badge>
                  </div>
                  <Progress value={okr.progress || 0} className="h-2" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Reviews */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Star className="h-5 w-5" />
            Recent Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No performance reviews recorded</p>
          </div>
        </CardContent>
      </Card>

      {/* 360 Feedback Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            360° Feedback Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No feedback received yet</p>
          </div>
        </CardContent>
      </Card>

      {/* Skills & Competencies */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="h-5 w-5" />
            Skills & Competencies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No skills recorded</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
