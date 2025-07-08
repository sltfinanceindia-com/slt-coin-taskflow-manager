import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { VideoUpload } from '@/components/VideoUpload';
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

  // Video mutations
  const createVideo = useMutation({
    mutationFn: async (data: {
      section_id: string;
      title: string;
      description: string;
      video_url: string;
      thumbnail_url?: string;
      duration_minutes?: number;
      order_index: number;
      is_published: boolean;
    }) => {
      const { error } = await supabase
        .from('training_videos')
        .insert([{
          ...data,
          created_by: profile?.id
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-sections'] });
      toast({ title: "Video added successfully!" });
    }
  });

  const updateVideo = useMutation({
    mutationFn: async ({ id, ...data }: Partial<TrainingVideo> & { id: string }) => {
      const { error } = await supabase
        .from('training_videos')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-sections'] });
      toast({ title: "Video updated successfully!" });
    }
  });

  const deleteVideo = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('training_videos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-sections'] });
      toast({ title: "Video deleted successfully!" });
    }
  });

  // Assignment mutations
  const createAssignment = useMutation({
    mutationFn: async (data: {
      section_id: string;
      title: string;
      description: string;
      instructions?: string;
      due_days: number;
      max_points: number;
      order_index: number;
      is_published: boolean;
    }) => {
      const { error } = await supabase
        .from('training_assignments')
        .insert([{
          ...data,
          created_by: profile?.id
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-sections'] });
      toast({ title: "Assignment created successfully!" });
    }
  });

  const updateAssignment = useMutation({
    mutationFn: async ({ id, ...data }: Partial<TrainingAssignment> & { id: string }) => {
      const { error } = await supabase
        .from('training_assignments')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-sections'] });
      toast({ title: "Assignment updated successfully!" });
    }
  });

  const deleteAssignment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('training_assignments')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-sections'] });
      toast({ title: "Assignment deleted successfully!" });
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

  const VideoDialog = ({ video, trigger }: { video?: TrainingVideo; trigger: React.ReactNode }) => {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
      section_id: video?.section_id || selectedSection || '',
      title: video?.title || '',
      description: video?.description || '',
      video_url: video?.video_url || '',
      thumbnail_url: video?.thumbnail_url || '',
      duration_minutes: video?.duration_minutes || 0,
      order_index: video?.order_index || 0,
      is_published: video?.is_published || false
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (video) {
        updateVideo.mutate({ id: video.id, ...formData });
      } else {
        createVideo.mutate(formData);
      }
      setOpen(false);
    };

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{video ? 'Edit' : 'Add'} Training Video</DialogTitle>
            <DialogDescription>
              {video ? 'Update the video details.' : 'Add a new video to your training content.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="section">Section *</Label>
              <Select value={formData.section_id} onValueChange={(value) => setFormData({ ...formData, section_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((section) => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="video-title">Title *</Label>
              <Input
                id="video-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Introduction to Risk Management"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="video-description">Description</Label>
              <Textarea
                id="video-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the video content..."
                rows={3}
              />
            </div>
            <VideoUpload
              onVideoUploaded={(videoUrl, duration) => {
                setFormData({ 
                  ...formData, 
                  video_url: videoUrl,
                  duration_minutes: duration || formData.duration_minutes
                });
              }}
              currentVideoUrl={formData.video_url}
            />
            <div className="space-y-2">
              <Label htmlFor="thumbnail-url">Thumbnail URL (Optional)</Label>
              <Input
                id="thumbnail-url"
                value={formData.thumbnail_url}
                onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                placeholder="https://example.com/thumbnail.jpg"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="video-order">Order Index</Label>
                <Input
                  id="video-order"
                  type="number"
                  value={formData.order_index}
                  onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                  min="0"
                />
              </div>
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
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createVideo.isPending || updateVideo.isPending}>
                {video ? 'Update' : 'Add'} Video
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  const AssignmentDialog = ({ assignment, trigger }: { assignment?: TrainingAssignment; trigger: React.ReactNode }) => {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
      section_id: assignment?.section_id || selectedSection || '',
      title: assignment?.title || '',
      description: assignment?.description || '',
      instructions: assignment?.instructions || '',
      due_days: assignment?.due_days || 7,
      max_points: assignment?.max_points || 100,
      order_index: assignment?.order_index || 0,
      is_published: assignment?.is_published || false
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (assignment) {
        updateAssignment.mutate({ id: assignment.id, ...formData });
      } else {
        createAssignment.mutate(formData);
      }
      setOpen(false);
    };

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{assignment ? 'Edit' : 'Create'} Assignment</DialogTitle>
            <DialogDescription>
              {assignment ? 'Update the assignment details.' : 'Create a new assignment for skill assessment.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="assignment-section">Section *</Label>
              <Select value={formData.section_id} onValueChange={(value) => setFormData({ ...formData, section_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((section) => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignment-title">Title *</Label>
              <Input
                id="assignment-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Financial Analysis Exercise"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignment-description">Description *</Label>
              <Textarea
                id="assignment-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the assignment..."
                rows={3}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignment-instructions">Instructions</Label>
              <Textarea
                id="assignment-instructions"
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                placeholder="Detailed instructions for completing the assignment..."
                rows={4}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="due-days">Due Days</Label>
                <Input
                  id="due-days"
                  type="number"
                  value={formData.due_days}
                  onChange={(e) => setFormData({ ...formData, due_days: parseInt(e.target.value) || 7 })}
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-points">Max Points</Label>
                <Input
                  id="max-points"
                  type="number"
                  value={formData.max_points}
                  onChange={(e) => setFormData({ ...formData, max_points: parseInt(e.target.value) || 100 })}
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignment-order">Order Index</Label>
                <Input
                  id="assignment-order"
                  type="number"
                  value={formData.order_index}
                  onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                  min="0"
                />
              </div>
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
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createAssignment.isPending || updateAssignment.isPending}>
                {assignment ? 'Update' : 'Create'} Assignment
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
            <VideoDialog
              trigger={
                <Button className="btn-secondary" disabled={sections.length === 0}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Video
                </Button>
              }
            />
          </div>
          
          {sections.length === 0 ? (
            <Card className="card-gradient">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Create sections first</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  You need to create training sections before adding videos. Go to the Sections tab to get started.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {sections.map((section) => (
                <Card key={section.id} className="card-gradient">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{section.title}</CardTitle>
                        <CardDescription>{section.videos?.length || 0} videos</CardDescription>
                      </div>
                      <VideoDialog
                        trigger={
                          <Button variant="outline" size="sm" onClick={() => setSelectedSection(section.id)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Video
                          </Button>
                        }
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {section.videos && section.videos.length > 0 ? (
                      <div className="space-y-3">
                        {section.videos.map((video) => (
                          <div key={video.id} className="flex items-center justify-between p-3 border rounded-lg hover-scale">
                            <div className="flex items-center space-x-3">
                              <Play className="h-5 w-5 text-primary" />
                              <div>
                                <h4 className="font-medium">{video.title}</h4>
                                <p className="text-sm text-muted-foreground">{video.description}</p>
                                <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                                  <span>{video.duration_minutes}min</span>
                                  <Badge variant={video.is_published ? 'default' : 'secondary'} className="text-xs">
                                    {video.is_published ? 'Published' : 'Draft'}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <VideoDialog
                                video={video}
                                trigger={
                                  <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                }
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteVideo.mutate(video.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <Video className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No videos added yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">Training Assignments</h3>
              <p className="text-muted-foreground">Create and manage assignments for skill assessment</p>
            </div>
            <AssignmentDialog
              trigger={
                <Button className="btn-secondary" disabled={sections.length === 0}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Assignment
                </Button>
              }
            />
          </div>
          
          {sections.length === 0 ? (
            <Card className="card-gradient">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Create sections first</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  You need to create training sections before adding assignments. Go to the Sections tab to get started.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {sections.map((section) => (
                <Card key={section.id} className="card-gradient">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{section.title}</CardTitle>
                        <CardDescription>{section.assignments?.length || 0} assignments</CardDescription>
                      </div>
                      <AssignmentDialog
                        trigger={
                          <Button variant="outline" size="sm" onClick={() => setSelectedSection(section.id)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Assignment
                          </Button>
                        }
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {section.assignments && section.assignments.length > 0 ? (
                      <div className="space-y-3">
                        {section.assignments.map((assignment) => (
                          <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg hover-scale">
                            <div className="flex items-center space-x-3">
                              <Award className="h-5 w-5 text-accent" />
                              <div>
                                <h4 className="font-medium">{assignment.title}</h4>
                                <p className="text-sm text-muted-foreground">{assignment.description}</p>
                                <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                                  <span>Due: {assignment.due_days} days</span>
                                  <span>Max: {assignment.max_points} points</span>
                                  <Badge variant={assignment.is_published ? 'default' : 'secondary'} className="text-xs">
                                    {assignment.is_published ? 'Published' : 'Draft'}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <AssignmentDialog
                                assignment={assignment}
                                trigger={
                                  <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                }
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteAssignment.mutate(assignment.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <Award className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No assignments created yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}