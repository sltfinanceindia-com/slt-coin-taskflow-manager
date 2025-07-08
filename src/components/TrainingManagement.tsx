import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Play, FileText, Users, Plus, Edit, Trash2, BookOpen, Video, Award, Clock, Eye, EyeOff } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface TrainingSection {
  id: string;
  title: string;
  description: string;
  order_index: number;
  is_published: boolean;
  created_at: string;
  videos?: TrainingVideo[];
  assignments?: TrainingAssignment[];
}

interface TrainingVideo {
  id: string;
  section_id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url?: string;
  duration_minutes?: number;
  order_index: number;
  is_published: boolean;
}

interface TrainingAssignment {
  id: string;
  section_id: string;
  title: string;
  description: string;
  instructions?: string;
  due_days: number;
  max_points: number;
  order_index: number;
  is_published: boolean;
}

export function TrainingManagement() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('sections');
  const [selectedSection, setSelectedSection] = useState<string>('');

  // Fetch training sections
  const { data: sections = [], isLoading } = useQuery({
    queryKey: ['training-sections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('training_sections')
        .select(`
          *,
          training_videos(*),
          training_assignments(*)
        `)
        .order('order_index');
      
      if (error) throw error;
      return data as TrainingSection[];
    }
  });

  // Create section mutation
  const createSection = useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      order_index: number;
      is_published: boolean;
    }) => {
      const { error } = await supabase
        .from('training_sections')
        .insert([{
          ...data,
          created_by: profile?.id
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-sections'] });
      toast({ title: "Section created successfully!" });
    }
  });

  // Update section mutation
  const updateSection = useMutation({
    mutationFn: async ({ id, ...data }: Partial<TrainingSection> & { id: string }) => {
      const { error } = await supabase
        .from('training_sections')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-sections'] });
      toast({ title: "Section updated successfully!" });
    }
  });

  // Delete section mutation
  const deleteSection = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('training_sections')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-sections'] });
      toast({ title: "Section deleted successfully!" });
    }
  });

  const SectionDialog = ({ section, trigger }: { section?: TrainingSection; trigger: React.ReactNode }) => {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
      title: section?.title || '',
      description: section?.description || '',
      order_index: section?.order_index || sections.length,
      is_published: section?.is_published || false
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (section) {
        updateSection.mutate({ id: section.id, ...formData });
      } else {
        createSection.mutate(formData);
      }
      setOpen(false);
    };

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{section ? 'Edit' : 'Create'} Training Section</DialogTitle>
            <DialogDescription>
              {section ? 'Update the training section details.' : 'Create a new training section for your courses.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Introduction to Finance"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this training section..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="order">Order Index</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order_index}
                  onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Published</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.is_published}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                  />
                  <span className="text-sm text-muted-foreground">
                    {formData.is_published ? 'Visible to users' : 'Draft mode'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createSection.isPending || updateSection.isPending}>
                {section ? 'Update' : 'Create'} Section
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  if (profile?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
        <p className="text-muted-foreground">Only administrators can manage training content.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <BookOpen className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Training Management
          </h1>
          <p className="text-muted-foreground">
            Create and manage training content for SLT Finance India team
          </p>
        </div>
        <SectionDialog
          trigger={
            <Button className="btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Section
            </Button>
          }
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sections" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Sections
          </TabsTrigger>
          <TabsTrigger value="videos" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Videos
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Assignments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sections" className="space-y-4">
          {sections.length === 0 ? (
            <Card className="card-gradient">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No training sections yet</h3>
                <p className="text-muted-foreground text-center max-w-md mb-4">
                  Create your first training section to start building comprehensive courses for your team.
                </p>
                <SectionDialog
                  trigger={
                    <Button className="btn-primary">
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Section
                    </Button>
                  }
                />
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {sections.map((section) => (
                <Card key={section.id} className="card-gradient hover-scale">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{section.title}</CardTitle>
                          <CardDescription>{section.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={section.is_published ? 'default' : 'secondary'} className="flex items-center gap-1">
                          {section.is_published ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                          {section.is_published ? 'Published' : 'Draft'}
                        </Badge>
                        <SectionDialog
                          section={section}
                          trigger={
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteSection.mutate(section.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="space-y-1">
                        <div className="flex items-center justify-center">
                          <Video className="h-4 w-4 text-primary mr-1" />
                          <span className="font-semibold">{section.videos?.length || 0}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Videos</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-center">
                          <Award className="h-4 w-4 text-accent mr-1" />
                          <span className="font-semibold">{section.assignments?.length || 0}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Assignments</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-center">
                          <Clock className="h-4 w-4 text-secondary mr-1" />
                          <span className="font-semibold">
                            {section.videos?.reduce((acc, video) => acc + (video.duration_minutes || 0), 0) || 0}m
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">Duration</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="videos" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">Training Videos</h3>
              <p className="text-muted-foreground">Manage video content for your training sections</p>
            </div>
            <Button className="btn-secondary">
              <Plus className="h-4 w-4 mr-2" />
              Add Video
            </Button>
          </div>
          
          <Card className="card-gradient">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Video className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Video Management</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Video management interface will be available here. Create sections first to organize your videos.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">Training Assignments</h3>
              <p className="text-muted-foreground">Create and manage assignments for skill assessment</p>
            </div>
            <Button className="btn-secondary">
              <Plus className="h-4 w-4 mr-2" />
              Add Assignment
            </Button>
          </div>
          
          <Card className="card-gradient">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Award className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Assignment Management</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Assignment management interface will be available here. Create sections first to organize your assignments.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}