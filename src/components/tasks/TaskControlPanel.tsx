import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  Clock, 
  FileText, 
  Users,
  Activity,
  TrendingUp
} from 'lucide-react';

interface TaskControlPanelProps {
  task: {
    slt_coin_value: number;
    estimated_hours?: number | null;
    actual_hours?: number | null;
    progress_percentage?: number;
    is_critical?: boolean;
    is_milestone?: boolean;
  };
}

export function TaskControlPanel({ task }: TaskControlPanelProps) {
  return (
    <Tabs defaultValue="finance" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="finance" className="gap-2">
          <DollarSign className="h-4 w-4" />
          <span className="hidden sm:inline">Finance</span>
        </TabsTrigger>
        <TabsTrigger value="time" className="gap-2">
          <Clock className="h-4 w-4" />
          <span className="hidden sm:inline">Time & Resources</span>
        </TabsTrigger>
        <TabsTrigger value="documents" className="gap-2">
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Documents</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="finance" className="mt-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Finance Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Coin Value</p>
                <p className="text-lg font-bold text-primary">{task.slt_coin_value}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Estimated Hours</p>
                <p className="text-lg font-bold">{task.estimated_hours || 0}h</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Actual Hours</p>
                <p className="text-lg font-bold">{task.actual_hours || 0}h</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Cost Efficiency</p>
                <p className="text-lg font-bold">
                  {task.estimated_hours && task.actual_hours 
                    ? Math.round((task.estimated_hours / task.actual_hours) * 100) 
                    : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="time" className="mt-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Time & Resource Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Overall Progress</span>
                <span className="font-medium">{task.progress_percentage || 0}%</span>
              </div>
              <Progress value={task.progress_percentage || 0} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">Critical Path</span>
                <Badge variant={task.is_critical ? 'destructive' : 'secondary'}>
                  {task.is_critical ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">Milestone</span>
                <Badge variant={task.is_milestone ? 'default' : 'secondary'}>
                  {task.is_milestone ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="documents" className="mt-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documents & Attachments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No documents attached to this task yet.</p>
              <p className="text-xs mt-1">Drag and drop files here or click to upload</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

export default TaskControlPanel;
