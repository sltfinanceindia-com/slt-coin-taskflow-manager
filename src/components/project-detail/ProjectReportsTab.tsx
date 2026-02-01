/**
 * Project Reports Tab
 * Report types, generation, exports
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, FileText, Download, Clock, Calendar } from 'lucide-react';

interface ProjectReportsTabProps {
  projectId: string;
}

const reportTypes = [
  { name: 'Status Report', description: 'Overview of project status and progress', icon: BarChart3 },
  { name: 'Time Tracking', description: 'Hours logged by team members', icon: Clock },
  { name: 'Budget Report', description: 'Budget vs actual spending', icon: FileText },
  { name: 'Sprint Report', description: 'Sprint velocity and burndown', icon: Calendar },
];

export function ProjectReportsTab({ projectId }: ProjectReportsTabProps) {
  return (
    <div className="space-y-6">
      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportTypes.map((report) => (
          <Card key={report.name} className="cursor-pointer hover:border-primary transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <report.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{report.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                </div>
                <Button variant="ghost" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Generated Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Generated Reports</CardTitle>
          <CardDescription>Previously generated reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No reports generated yet</p>
            <p className="text-sm mt-1">Select a report type above to generate</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
