import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useProjectUpdates } from '@/hooks/useProjectUpdates';
import { useAuth } from '@/hooks/useAuth';
import { 
  Activity, 
  MessageCircle, 
  FileText, 
  CheckCircle, 
  Clock, 
  User, 
  AlertTriangle,
  Filter,
  Search,
  Send,
  Star,
  Download,
  RefreshCw
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

const UPDATE_TYPE_CONFIG: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  comment: { icon: MessageCircle, label: 'Comment', color: 'text-blue-500' },
  status_change: { icon: CheckCircle, label: 'Status Change', color: 'text-green-500' },
  task_update: { icon: FileText, label: 'Task Update', color: 'text-purple-500' },
  time_log: { icon: Clock, label: 'Time Log', color: 'text-orange-500' },
  assignment: { icon: User, label: 'Assignment', color: 'text-cyan-500' },
  alert: { icon: AlertTriangle, label: 'Alert', color: 'text-red-500' },
  milestone: { icon: Star, label: 'Milestone', color: 'text-yellow-500' },
};

export default function UpdatesTab() {
  const { profile } = useAuth();
  const { updates, isLoading, createUpdate, refetch } = useProjectUpdates();
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [newUpdateContent, setNewUpdateContent] = useState('');
  const [newUpdateType, setNewUpdateType] = useState('comment');
  const [isImportant, setIsImportant] = useState(false);

  // Filter updates
  const filteredUpdates = updates.filter(update => {
    const matchesType = filterType === 'all' || update.update_type === filterType;
    const matchesSearch = !searchQuery || 
      update.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      update.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handlePostUpdate = async () => {
    if (!newUpdateContent.trim()) {
      toast.error('Please enter some content');
      return;
    }

    try {
      await createUpdate.mutateAsync({
        update_type: newUpdateType,
        content: newUpdateContent,
        is_important: isImportant,
      });
      setNewUpdateContent('');
      setIsImportant(false);
      toast.success('Update posted successfully');
    } catch (error) {
      toast.error('Failed to post update');
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Date', 'User', 'Type', 'Content', 'Important'].join(','),
      ...filteredUpdates.map(u => [
        new Date(u.created_at).toISOString(),
        u.user?.full_name || 'Unknown',
        u.update_type,
        `"${(u.content || '').replace(/"/g, '""')}"`,
        u.is_important ? 'Yes' : 'No'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `updates-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Updates exported to CSV');
  };

  const groupUpdatesByDate = (updates: typeof filteredUpdates) => {
    const groups: Record<string, typeof updates> = {};
    updates.forEach(update => {
      const date = new Date(update.created_at).toDateString();
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      
      let groupKey = date;
      if (date === today) groupKey = 'Today';
      else if (date === yesterday) groupKey = 'Yesterday';
      
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(update);
    });
    return groups;
  };

  const groupedUpdates = groupUpdatesByDate(filteredUpdates);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6" />
            Activity Feed
          </h2>
          <p className="text-muted-foreground">
            Stay updated with all project and team activities
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Post New Update */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Post an Update</CardTitle>
          <CardDescription>Share updates, comments, or status changes with your team</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={profile?.avatar_url || ''} />
              <AvatarFallback>{profile?.full_name?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <Textarea
                placeholder="What's happening? Share an update..."
                value={newUpdateContent}
                onChange={(e) => setNewUpdateContent(e.target.value)}
                rows={3}
              />
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Select value={newUpdateType} onValueChange={setNewUpdateType}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(UPDATE_TYPE_CONFIG).map(([type, config]) => (
                        <SelectItem key={type} value={type}>
                          <div className="flex items-center gap-2">
                            <config.icon className={`h-4 w-4 ${config.color}`} />
                            {config.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant={isImportant ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsImportant(!isImportant)}
                  >
                    <Star className={`h-4 w-4 ${isImportant ? 'fill-current' : ''}`} />
                  </Button>
                </div>
                <Button onClick={handlePostUpdate} disabled={createUpdate.isPending}>
                  <Send className="h-4 w-4 mr-2" />
                  Post Update
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search updates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Updates</SelectItem>
            {Object.entries(UPDATE_TYPE_CONFIG).map(([type, config]) => (
              <SelectItem key={type} value={type}>
                <div className="flex items-center gap-2">
                  <config.icon className={`h-4 w-4 ${config.color}`} />
                  {config.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Updates Feed */}
      <Card>
        <ScrollArea className="h-[600px]">
          <CardContent className="p-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : filteredUpdates.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">No updates found</p>
                <p className="text-sm text-muted-foreground">
                  Be the first to post an update!
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedUpdates).map(([date, updates]) => (
                  <div key={date}>
                    <div className="sticky top-0 bg-background py-2 z-10">
                      <Badge variant="secondary" className="text-xs">
                        {date}
                      </Badge>
                    </div>
                    <div className="space-y-4 mt-2">
                      {updates.map((update) => {
                        const config = UPDATE_TYPE_CONFIG[update.update_type] || UPDATE_TYPE_CONFIG.comment;
                        const Icon = config.icon;
                        
                        return (
                          <div
                            key={update.id}
                            className={`flex gap-3 p-3 rounded-lg border ${update.is_important ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800' : 'bg-muted/30'}`}
                          >
                            <Avatar className="h-9 w-9 shrink-0">
                              <AvatarImage src={update.user?.avatar_url || ''} />
                              <AvatarFallback>
                                {update.user?.full_name?.charAt(0).toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-sm">
                                  {update.user?.full_name || 'Unknown User'}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  <Icon className={`h-3 w-3 mr-1 ${config.color}`} />
                                  {config.label}
                                </Badge>
                                {update.is_important && (
                                  <Badge variant="default" className="text-xs bg-yellow-500">
                                    <Star className="h-3 w-3 mr-1 fill-current" />
                                    Important
                                  </Badge>
                                )}
                                {update.project && (
                                  <Badge variant="secondary" className="text-xs">
                                    {update.project.name}
                                  </Badge>
                                )}
                                {update.task && (
                                  <Badge variant="secondary" className="text-xs">
                                    {update.task.title}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm mt-1 whitespace-pre-wrap">
                                {update.content}
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {formatDistanceToNow(new Date(update.created_at), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </ScrollArea>
      </Card>
    </div>
  );
}