import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Layers, Plus, GripVertical, Star, AlertTriangle, Tag, User } from 'lucide-react';

const PRIORITY_OPTIONS = [
  { value: 'urgent', label: 'Critical', color: 'bg-red-100 text-red-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
];

export function BacklogManagement() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [newItem, setNewItem] = useState({ title: '', description: '', story_points: '0', priority: 'medium' as const, project_id: '' });

  const { data: backlogItems, isLoading } = useQuery({
    queryKey: ['backlog-items', profile?.organization_id, filter],
    queryFn: async () => {
      let query = supabase.from('tasks').select('id, title, description, priority, status, created_at, assigned_to, project_id').eq('organization_id', profile?.organization_id).is('parent_task_id', null).order('created_at', { ascending: false });
      if (filter !== 'all') query = query.eq('priority', filter as 'high' | 'low' | 'medium' | 'urgent');
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  const { data: projects } = useQuery({
    queryKey: ['backlog-projects', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase.from('projects').select('id, name').eq('organization_id', profile?.organization_id).order('name');
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });

  const createItemMutation = useMutation({
    mutationFn: async (item: typeof newItem) => {
      const { data, error } = await supabase.from('tasks').insert({
        organization_id: profile?.organization_id,
        title: item.title,
        description: item.description,
        priority: item.priority,
        status: 'pending',
        project_id: item.project_id || null,
        created_by: profile?.id || '',
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backlog-items'] });
      setIsCreateOpen(false);
      setNewItem({ title: '', description: '', story_points: '0', priority: 'medium', project_id: '' });
      toast({ title: 'Backlog item created' });
    },
    onError: (error) => toast({ title: 'Error', description: error.message, variant: 'destructive' }),
  });

  const updatePriorityMutation = useMutation({
    mutationFn: async ({ id, priority }: { id: string; priority: 'high' | 'low' | 'medium' | 'urgent' }) => {
      const { error } = await supabase.from('tasks').update({ priority }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['backlog-items'] }); toast({ title: 'Priority updated' }); },
  });

  const handleDragEnd = (result: DropResult) => { if (!result.destination) return; };
  const getPriorityBadge = (priority: string) => { const p = PRIORITY_OPTIONS.find(o => o.value === priority); return <Badge className={p?.color || 'bg-gray-100'}>{p?.label || priority}</Badge>; };
  const filteredItems = backlogItems?.filter(item => searchTerm ? item.title.toLowerCase().includes(searchTerm.toLowerCase()) : true) || [];
  const totalItems = backlogItems?.length || 0;
  const criticalItems = backlogItems?.filter(i => i.priority === 'urgent').length || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold flex items-center gap-2"><Layers className="h-6 w-6 text-primary" />Backlog Management</h1><p className="text-muted-foreground">Prioritize and groom your product backlog</p></div>
        <div className="flex gap-2">
          <Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-48" />
          <Select value={filter} onValueChange={setFilter}><SelectTrigger className="w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="urgent">Critical</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="low">Low</SelectItem></SelectContent></Select>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}><DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Add Item</Button></DialogTrigger>
            <DialogContent><DialogHeader><DialogTitle>Add Backlog Item</DialogTitle><DialogDescription>Create a new user story</DialogDescription></DialogHeader>
              <div className="space-y-4 pt-4">
                <div><Label>Title</Label><Input placeholder="As a user..." value={newItem.title} onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))} /></div>
                <div><Label>Description</Label><Textarea placeholder="Acceptance criteria..." value={newItem.description} onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))} rows={3} /></div>
                <div><Label>Priority</Label><Select value={newItem.priority} onValueChange={(v: 'high' | 'low' | 'medium' | 'urgent') => setNewItem(prev => ({ ...prev, priority: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{PRIORITY_OPTIONS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Project</Label><Select value={newItem.project_id} onValueChange={(v) => setNewItem(prev => ({ ...prev, project_id: v }))}><SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger><SelectContent>{projects?.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></div>
                <Button className="w-full" onClick={() => createItemMutation.mutate(newItem)} disabled={!newItem.title || createItemMutation.isPending}>{createItemMutation.isPending ? 'Creating...' : 'Add to Backlog'}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Items</CardTitle><Layers className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{totalItems}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Story Points</CardTitle><Star className="h-4 w-4 text-yellow-500" /></CardHeader><CardContent><div className="text-2xl font-bold">0</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Critical</CardTitle><AlertTriangle className="h-4 w-4 text-red-500" /></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">{criticalItems}</div></CardContent></Card>
      </div>

      <Card><CardHeader><CardTitle>Product Backlog</CardTitle><CardDescription>Drag to reorder items</CardDescription></CardHeader>
        <CardContent>
          {isLoading ? <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div> : filteredItems.length > 0 ? (
            <DragDropContext onDragEnd={handleDragEnd}><Droppable droppableId="backlog">{(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                {filteredItems.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>{(provided, snapshot) => (
                    <div ref={provided.innerRef} {...provided.draggableProps} className={`flex items-center gap-4 p-4 rounded-lg border ${snapshot.isDragging ? 'bg-accent shadow-lg' : 'bg-card hover:bg-accent/50'}`}>
                      <div {...provided.dragHandleProps}><GripVertical className="h-4 w-4 text-muted-foreground" /></div>
                      <div className="flex-1 min-w-0"><div className="flex items-center gap-2 mb-1"><span className="font-medium truncate">{item.title}</span>{getPriorityBadge(item.priority)}</div>{item.description && <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>}</div>
                      <Select value={item.priority} onValueChange={(v: 'high' | 'low' | 'medium' | 'urgent') => updatePriorityMutation.mutate({ id: item.id, priority: v })}><SelectTrigger className="w-28 h-8"><SelectValue /></SelectTrigger><SelectContent>{PRIORITY_OPTIONS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent></Select>
                    </div>
                  )}</Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}</Droppable></DragDropContext>
          ) : <div className="text-center py-8 text-muted-foreground"><Layers className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>No backlog items found</p></div>}
        </CardContent>
      </Card>
    </div>
  );
}
