import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Calendar, FileText } from 'lucide-react';
import { TrainingSection } from '@/types/training';
import { TrainingStats } from './TrainingStats';

interface TrainingOverviewProps {
  sections: TrainingSection[];
}

export function TrainingOverview({ sections }: TrainingOverviewProps) {
  return (
    <div className="space-y-6">
      <TrainingStats sections={sections} />

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
    </div>
  );
}