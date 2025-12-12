import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useBaselines, ProjectBaseline } from '@/hooks/useBaselines';
import { useEnhancedProjects } from '@/hooks/useEnhancedProjects';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { Camera, Trash2, Star, Calendar, Clock, CheckCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function BaselineManager() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newBaselineName, setNewBaselineName] = useState('');
  const [newBaselineDescription, setNewBaselineDescription] = useState('');

  const { projects, isLoading: projectsLoading } = useEnhancedProjects();
  const { 
    baselines, 
    isLoading, 
    createBaseline, 
    isCreating,
    setCurrentBaseline,
    deleteBaseline 
  } = useBaselines(selectedProjectId);

  const handleCreateBaseline = async () => {
    if (!selectedProjectId || !newBaselineName.trim()) return;
    
    await createBaseline(selectedProjectId, newBaselineName.trim(), newBaselineDescription.trim());
    setIsCreateOpen(false);
    setNewBaselineName('');
    setNewBaselineDescription('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Baseline Manager</h2>
          <p className="text-muted-foreground">
            Create and manage project baseline snapshots for variance tracking
          </p>
        </div>
      </div>

      {/* Project Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Select Project</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger className="w-full sm:w-[300px]">
                <SelectValue placeholder="Choose a project" />
              </SelectTrigger>
              <SelectContent>
                {projects?.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedProjectId && (
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Camera className="mr-2 h-4 w-4" />
                    Create Baseline
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Baseline</DialogTitle>
                    <DialogDescription>
                      Capture a snapshot of the current project plan for future comparison.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="baseline-name">Baseline Name</Label>
                      <Input
                        id="baseline-name"
                        placeholder="e.g., Initial Plan, Re-baseline v2"
                        value={newBaselineName}
                        onChange={(e) => setNewBaselineName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="baseline-desc">Description (Optional)</Label>
                      <Textarea
                        id="baseline-desc"
                        placeholder="Notes about this baseline..."
                        value={newBaselineDescription}
                        onChange={(e) => setNewBaselineDescription(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreateBaseline} 
                      disabled={!newBaselineName.trim() || isCreating}
                    >
                      {isCreating ? 'Creating...' : 'Create Baseline'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Baselines List */}
      {selectedProjectId && (
        <Card>
          <CardHeader>
            <CardTitle>Project Baselines</CardTitle>
            <CardDescription>
              {baselines.length} baseline{baselines.length !== 1 ? 's' : ''} saved
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : baselines.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Camera className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No baselines created yet.</p>
                <p className="text-sm">Create a baseline to start tracking variance.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {baselines.map((baseline) => (
                  <BaselineCard
                    key={baseline.id}
                    baseline={baseline}
                    onSetCurrent={() => setCurrentBaseline(baseline.id, selectedProjectId)}
                    onDelete={() => deleteBaseline(baseline.id)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function BaselineCard({ 
  baseline, 
  onSetCurrent, 
  onDelete 
}: { 
  baseline: ProjectBaseline;
  onSetCurrent: () => void;
  onDelete: () => void;
}) {
  const scheduleSnapshot = baseline.schedule_snapshot || {};
  
  return (
    <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{baseline.name}</h3>
            {baseline.is_current && (
              <Badge variant="default" className="bg-primary">
                <Star className="h-3 w-3 mr-1" />
                Current
              </Badge>
            )}
          </div>
          
          {baseline.description && (
            <p className="text-sm text-muted-foreground">{baseline.description}</p>
          )}
          
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(baseline.baseline_date), 'MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{baseline.budget_snapshot}h budgeted</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              <span>{scheduleSnapshot.task_count || 0} tasks</span>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Created by {baseline.creator_profile?.full_name || 'Unknown'}
          </p>
        </div>

        <div className="flex gap-2">
          {!baseline.is_current && (
            <Button variant="outline" size="sm" onClick={onSetCurrent}>
              <Star className="h-4 w-4 mr-1" />
              Set Current
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onDelete}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
    </div>
  );
}
