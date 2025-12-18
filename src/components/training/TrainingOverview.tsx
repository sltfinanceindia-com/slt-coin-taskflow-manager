import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Calendar, FileText, Download } from 'lucide-react';
import { TrainingSection } from '@/types/training';
import { TrainingStats } from './TrainingStats';
import { exportToCSV } from '@/lib/export';

interface TrainingOverviewProps {
  sections: TrainingSection[];
}

export function TrainingOverview({ sections }: TrainingOverviewProps) {
  // Export training progress to CSV
  const handleExportTraining = () => {
    const exportData = sections.map(section => ({
      title: section.title,
      description: section.description || '',
      videos_count: section.training_videos?.length || 0,
      assignments_count: section.training_assignments?.length || 0,
      is_published: section.is_published ? 'Yes' : 'No',
      order: section.order_index,
    }));

    exportToCSV(exportData, 'training_sections', [
      { key: 'title', label: 'Section Title' },
      { key: 'description', label: 'Description' },
      { key: 'videos_count', label: 'Videos' },
      { key: 'assignments_count', label: 'Assignments' },
      { key: 'is_published', label: 'Published' },
      { key: 'order', label: 'Order' },
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <TrainingStats sections={sections} />
        <Button variant="outline" onClick={handleExportTraining} disabled={sections.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
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
    </div>
  );
}