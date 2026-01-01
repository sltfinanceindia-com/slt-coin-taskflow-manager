import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  MessageCircle, 
  Plus, 
  BarChart3, 
  Users, 
  TrendingUp, 
  Smile, 
  Meh, 
  Frown,
  Trash2,
  Edit,
} from 'lucide-react';
import { format } from 'date-fns';

interface Question {
  id: string;
  text: string;
  type: 'scale' | 'emoji';
}

interface PulseSurvey {
  id: string;
  title: string;
  description: string | null;
  questions: Question[];
  is_active: boolean;
  frequency: string;
  created_at: string;
  response_count?: number;
  avg_sentiment?: number;
}

export function PulseSurveyAdmin() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    questions: [
      { id: '1', text: 'How are you feeling about work today?', type: 'emoji' as const },
      { id: '2', text: 'I have the resources I need to do my job well.', type: 'scale' as const },
      { id: '3', text: 'I feel valued by my team.', type: 'scale' as const },
    ],
  });

  // Fetch surveys with response stats
  const { data: surveys = [], isLoading } = useQuery({
    queryKey: ['pulse-surveys-admin'],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      const { data: surveysData, error } = await supabase
        .from('pulse_surveys')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get response counts for each survey
      const surveysWithStats = await Promise.all(
        (surveysData || []).map(async (survey) => {
          const { count } = await supabase
            .from('pulse_responses')
            .select('*', { count: 'exact', head: true })
            .eq('survey_id', survey.id);

          const { data: responses } = await supabase
            .from('pulse_responses')
            .select('sentiment_score')
            .eq('survey_id', survey.id);

          const avgSentiment = responses && responses.length > 0
            ? responses.reduce((sum, r) => sum + (r.sentiment_score || 0), 0) / responses.length
            : 0;

          return {
            ...survey,
            questions: survey.questions as unknown as Question[],
            response_count: count || 0,
            avg_sentiment: avgSentiment,
          } as PulseSurvey;
        })
      );

      return surveysWithStats;
    },
  });

  // Create survey mutation
  const createSurvey = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('pulse_surveys').insert({
        title: formData.title,
        description: formData.description || null,
        questions: formData.questions,
        is_active: true,
        frequency: 'weekly',
        created_by: profile?.id,
        organization_id: profile?.organization_id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pulse-surveys-admin'] });
      toast.success('Survey created successfully!');
      setIsDialogOpen(false);
      setFormData({
        title: '',
        description: '',
        questions: [
          { id: '1', text: 'How are you feeling about work today?', type: 'emoji' },
          { id: '2', text: 'I have the resources I need to do my job well.', type: 'scale' },
          { id: '3', text: 'I feel valued by my team.', type: 'scale' },
        ],
      });
    },
    onError: () => {
      toast.error('Failed to create survey');
    },
  });

  // Toggle survey active status
  const toggleSurvey = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('pulse_surveys')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pulse-surveys-admin'] });
    },
  });

  const getSentimentIcon = (score: number) => {
    if (score >= 0.7) return <Smile className="h-5 w-5 text-green-500" />;
    if (score >= 0.4) return <Meh className="h-5 w-5 text-yellow-500" />;
    return <Frown className="h-5 w-5 text-red-500" />;
  };

  const activeSurveys = surveys.filter(s => s.is_active);
  const totalResponses = surveys.reduce((sum, s) => sum + (s.response_count || 0), 0);
  const avgSentiment = surveys.length > 0
    ? surveys.reduce((sum, s) => sum + (s.avg_sentiment || 0), 0) / surveys.length
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Pulse Surveys</h2>
          <p className="text-muted-foreground">Gather employee feedback with quick surveys</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Survey
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Pulse Survey</DialogTitle>
              <DialogDescription>
                Create a quick survey to gather employee feedback
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Survey Title</label>
                <Input
                  placeholder="e.g., Weekly Pulse Check"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description (optional)</label>
                <Textarea
                  placeholder="Brief description of the survey purpose"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Questions</label>
                <div className="space-y-2">
                  {formData.questions.map((q, index) => (
                    <div key={q.id} className="flex items-center gap-2">
                      <Badge variant="outline">{q.type}</Badge>
                      <Input
                        value={q.text}
                        onChange={(e) => {
                          const newQuestions = [...formData.questions];
                          newQuestions[index].text = e.target.value;
                          setFormData(prev => ({ ...prev, questions: newQuestions }));
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <Button
                className="w-full"
                onClick={() => createSurvey.mutate()}
                disabled={!formData.title || createSurvey.isPending}
              >
                {createSurvey.isPending ? 'Creating...' : 'Create Survey'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Surveys</p>
                <p className="text-2xl font-bold">{activeSurveys.length}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Responses</p>
                <p className="text-2xl font-bold">{totalResponses}</p>
              </div>
              <Users className="h-8 w-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Sentiment</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{(avgSentiment * 100).toFixed(0)}%</p>
                  {getSentimentIcon(avgSentiment)}
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Surveys List */}
      <Card>
        <CardHeader>
          <CardTitle>All Surveys</CardTitle>
          <CardDescription>Manage your pulse surveys</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : surveys.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No surveys yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first pulse survey to start gathering feedback
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>Create Survey</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {surveys.map((survey) => (
                <div
                  key={survey.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{survey.title}</h4>
                      <Badge variant={survey.is_active ? 'default' : 'secondary'}>
                        {survey.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {survey.questions?.length || 0} questions • {survey.response_count} responses
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Created {format(new Date(survey.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getSentimentIcon(survey.avg_sentiment || 0)}
                      <span className="text-sm font-medium">
                        {((survey.avg_sentiment || 0) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <Switch
                      checked={survey.is_active}
                      onCheckedChange={(checked) => 
                        toggleSurvey.mutate({ id: survey.id, is_active: checked })
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
