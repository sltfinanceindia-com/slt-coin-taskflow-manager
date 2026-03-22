import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen, Plus, Calendar, ThumbsUp, ThumbsDown, Lightbulb, Search, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useLessonsLearned } from '@/hooks/useLessonsLearned';

export function LessonsLearnedManagement() {
  const { lessons, isLoading, createLesson, deleteLesson, isCreating } = useLessonsLearned();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    project_name: '',
    category: 'process',
    what_went_well: '',
    what_went_wrong: '',
    recommendations: '',
    impact: 'medium' as 'low' | 'medium' | 'high'
  });

  const handleSubmit = async () => {
    if (!formData.title) return;
    
    await createLesson({
      title: formData.title,
      project_id: null,
      project_name: formData.project_name || null,
      category: formData.category,
      what_went_well: formData.what_went_well ? formData.what_went_well.split('\n').filter(Boolean) : null,
      what_went_wrong: formData.what_went_wrong ? formData.what_went_wrong.split('\n').filter(Boolean) : null,
      recommendations: formData.recommendations ? formData.recommendations.split('\n').filter(Boolean) : null,
      impact: formData.impact,
      created_by: null,
    });
    
    setIsDialogOpen(false);
    setFormData({
      title: '',
      project_name: '',
      category: 'process',
      what_went_well: '',
      what_went_wrong: '',
      recommendations: '',
      impact: 'medium'
    });
  };

  const handleDelete = async (id: string) => {
    await deleteLesson(id);
  };

  const getCategoryBadge = (category: string | null) => {
    const colors: Record<string, string> = {
      process: 'bg-blue-100 text-blue-800',
      technical: 'bg-purple-100 text-purple-800',
      communication: 'bg-green-100 text-green-800',
      planning: 'bg-orange-100 text-orange-800'
    };
    return <Badge className={colors[category || 'process'] || 'bg-gray-100 text-gray-800'}>{category || 'general'}</Badge>;
  };

  const filteredLessons = lessons?.filter(l => 
    l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (l.project_name?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const categories = ['process', 'technical', 'communication', 'planning', 'other'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Lessons Learned
          </h2>
          <p className="text-muted-foreground">Capture and share knowledge from projects</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Lesson
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Record Lesson Learned</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh]">
              <div className="space-y-4 py-4 pr-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Q4 Launch Retrospective"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Project Name</Label>
                    <Input
                      value={formData.project_name}
                      onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                      placeholder="e.g., Product Launch 2024"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Impact Level</Label>
                    <Select value={formData.impact} onValueChange={(v: 'low' | 'medium' | 'high') => setFormData({ ...formData, impact: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <ThumbsUp className="h-4 w-4 text-green-500" />
                    What Went Well (one per line)
                  </Label>
                  <Textarea
                    value={formData.what_went_well}
                    onChange={(e) => setFormData({ ...formData, what_went_well: e.target.value })}
                    placeholder="Clear communication&#10;Good test coverage"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <ThumbsDown className="h-4 w-4 text-red-500" />
                    What Could Be Improved (one per line)
                  </Label>
                  <Textarea
                    value={formData.what_went_wrong}
                    onChange={(e) => setFormData({ ...formData, what_went_wrong: e.target.value })}
                    placeholder="Scope creep&#10;Late testing"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    Recommendations (one per line)
                  </Label>
                  <Textarea
                    value={formData.recommendations}
                    onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                    placeholder="Lock scope early&#10;Create templates"
                    rows={3}
                  />
                </div>
                <Button onClick={handleSubmit} className="w-full" disabled={isCreating}>
                  {isCreating ? 'Saving...' : 'Save Lesson'}
                </Button>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search lessons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Lessons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{lessons?.length || 0}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold">
                {lessons?.reduce((acc, l) => acc + (l.recommendations?.length || 0), 0) || 0}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">High Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <ThumbsUp className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">
                {lessons?.filter(l => l.impact === 'high').length || 0}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="py-8 text-center">Loading lessons...</CardContent>
          </Card>
        ) : filteredLessons?.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No lessons found. Add your first lesson to get started.
            </CardContent>
          </Card>
        ) : (
          filteredLessons?.map((lesson) => (
            <Card key={lesson.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{lesson.title}</CardTitle>
                      {getCategoryBadge(lesson.category)}
                    </div>
                    <CardDescription className="flex items-center gap-4">
                      {lesson.project_name && <span>{lesson.project_name}</span>}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(lesson.created_at), 'MMM d, yyyy')}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleDelete(lesson.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lesson.what_went_well && lesson.what_went_well.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium flex items-center gap-2">
                        <ThumbsUp className="h-4 w-4 text-green-500" />
                        What Went Well
                      </p>
                      <ul className="space-y-1">
                        {lesson.what_went_well.map((item, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-green-500">✓</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {lesson.what_went_wrong && lesson.what_went_wrong.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium flex items-center gap-2">
                        <ThumbsDown className="h-4 w-4 text-red-500" />
                        Areas for Improvement
                      </p>
                      <ul className="space-y-1">
                        {lesson.what_went_wrong.map((item, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-red-500">✗</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                {lesson.recommendations && lesson.recommendations.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-500" />
                      Recommendations
                    </p>
                    <ul className="space-y-1">
                      {lesson.recommendations.map((rec, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-yellow-500">→</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
