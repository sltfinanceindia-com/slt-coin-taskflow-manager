import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MessageSquare, 
  FileText, 
  UserPlus, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Send,
  Filter,
  Star,
  Trash2,
  RefreshCw,
  Download
} from 'lucide-react';
import { useProjectUpdates, ProjectUpdate } from '@/hooks/useProjectUpdates';
import { formatDistanceToNow, format } from 'date-fns';
import { exportToCSV } from '@/lib/export';

const UPDATE_TYPE_CONFIG: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  comment: { icon: MessageSquare, label: 'Comment', color: 'bg-blue-500/10 text-blue-500' },
  status_change: { icon: CheckCircle, label: 'Status Change', color: 'bg-green-500/10 text-green-500' },
  file_upload: { icon: FileText, label: 'File Upload', color: 'bg-purple-500/10 text-purple-500' },
  assignment: { icon: UserPlus, label: 'Assignment', color: 'bg-orange-500/10 text-orange-500' },
  milestone: { icon: Star, label: 'Milestone', color: 'bg-yellow-500/10 text-yellow-500' },
  alert: { icon: AlertCircle, label: 'Alert', color: 'bg-red-500/10 text-red-500' },
  deadline: { icon: Clock, label: 'Deadline', color: 'bg-muted text-muted-foreground' },
};

interface ProjectUpdatesFeedProps {
  projectId?: string;
  taskId?: string;
  compact?: boolean;
}

export const ProjectUpdatesFeed = ({ projectId, taskId, compact = false }: ProjectUpdatesFeedProps) => {
  const { updates, isLoading, createUpdate, deleteUpdate, refetch } = useProjectUpdates(projectId, taskId);
  const [newContent, setNewContent] = useState('');
  const [updateType, setUpdateType] = useState('comment');
  const [filterType, setFilterType] = useState<string>('all');
  const [isImportant, setIsImportant] = useState(false);

  const handleSubmit = () => {
    if (!newContent.trim()) return;

    createUpdate.mutate({
      project_id: projectId,
      task_id: taskId,
      update_type: updateType,
      content: newContent.trim(),
      is_important: isImportant,
    });

    setNewContent('');
    setIsImportant(false);
  };

  const filteredUpdates = filterType === 'all' 
    ? updates 
    : updates.filter(u => u.update_type === filterType);

  const handleExportUpdates = () => {
    const exportData = filteredUpdates.map(update => ({
      type: UPDATE_TYPE_CONFIG[update.update_type]?.label || update.update_type,
      content: update.content || '',
      user: update.user?.full_name || 'Unknown',
      project: update.project?.name || '',
      task: update.task?.title || '',
      is_important: update.is_important ? 'Yes' : 'No',
      created_at: format(new Date(update.created_at), 'yyyy-MM-dd HH:mm'),
    }));

    exportToCSV(exportData, 'updates_export', [
      { key: 'type', label: 'Type' },
      { key: 'content', label: 'Content' },
      { key: 'user', label: 'User' },
      { key: 'project', label: 'Project' },
      { key: 'task', label: 'Task' },
      { key: 'is_important', label: 'Important' },
      { key: 'created_at', label: 'Date' },
    ]);
  };

  const renderUpdate = (update: ProjectUpdate) => {
    const config = UPDATE_TYPE_CONFIG[update.update_type] || UPDATE_TYPE_CONFIG.comment;
    const Icon = config.icon;

    return (
      <div
        key={update.id}
        className={`flex gap-3 p-3 rounded-lg border transition-colors hover:bg-muted/50 ${
          update.is_important ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-border'
        }`}
      >
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={update.user?.avatar_url || undefined} />
          <AvatarFallback className="text-xs">
            {update.user?.full_name?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm truncate">
              {update.user?.full_name || 'Unknown'}
            </span>
            <Badge variant="outline" className={`text-xs ${config.color}`}>
              <Icon className="h-3 w-3 mr-1" />
              {config.label}
            </Badge>
            {update.is_important && (
              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
            )}
          </div>

          {update.project && !projectId && (
            <p className="text-xs text-muted-foreground mb-1">
              in {update.project.name}
            </p>
          )}

          <p className="text-sm text-foreground whitespace-pre-wrap break-words">
            {update.content}
          </p>

          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(update.created_at), { addSuffix: true })}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100"
              onClick={() => deleteUpdate.mutate(update.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  if (compact) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Recent Updates</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : filteredUpdates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No updates yet</div>
              ) : (
                filteredUpdates.slice(0, 10).map(renderUpdate)
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* New Update Form */}
      <Card>
        <CardContent className="pt-4">
          <div className="space-y-3">
            <div className="flex gap-2">
              <Select value={updateType} onValueChange={setUpdateType}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(UPDATE_TYPE_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <config.icon className="h-4 w-4" />
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant={isImportant ? 'default' : 'outline'}
                size="icon"
                onClick={() => setIsImportant(!isImportant)}
                title="Mark as important"
              >
                <Star className={`h-4 w-4 ${isImportant ? 'fill-current' : ''}`} />
              </Button>
            </div>

            <Textarea
              placeholder="Share an update..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={3}
            />

            <div className="flex justify-end">
              <Button 
                onClick={handleSubmit} 
                disabled={!newContent.trim() || createUpdate.isPending}
              >
                <Send className="h-4 w-4 mr-2" />
                Post Update
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter & Updates List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Activity Feed</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Updates</SelectItem>
                  {Object.entries(UPDATE_TYPE_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={handleExportUpdates} title="Export">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-2">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading updates...</div>
              ) : filteredUpdates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No updates yet. Be the first to share something!
                </div>
              ) : (
                filteredUpdates.map(renderUpdate)
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
