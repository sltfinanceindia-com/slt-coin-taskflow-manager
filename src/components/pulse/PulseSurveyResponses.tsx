import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  ArrowLeft, Download, Smile, Meh, Frown, ThumbsUp, ThumbsDown, 
  Calendar, User, Filter, Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface PulseSurveyResponsesProps {
  surveyId: string;
  surveyTitle: string;
  onBack: () => void;
}

export function PulseSurveyResponses({ surveyId, surveyTitle, onBack }: PulseSurveyResponsesProps) {
  const { profile } = useAuth();
  const [selectedResponse, setSelectedResponse] = useState<any>(null);
  const [filterSentiment, setFilterSentiment] = useState<string>('all');

  // Fetch responses for this survey
  const { data: responses, isLoading } = useQuery({
    queryKey: ['pulse-survey-responses', surveyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pulse_responses')
        .select(`
          *,
          respondent:profiles!pulse_responses_user_id_fkey(
            id, full_name, email, avatar_url, department_id,
            departments:department_id(name)
          )
        `)
        .eq('survey_id', surveyId)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id && !!surveyId,
  });

  const getSentimentIcon = (score: number | null) => {
    if (score === null) return <Meh className="h-4 w-4 text-muted-foreground" />;
    if (score >= 4) return <Smile className="h-4 w-4 text-green-500" />;
    if (score >= 2.5) return <Meh className="h-4 w-4 text-yellow-500" />;
    return <Frown className="h-4 w-4 text-red-500" />;
  };

  const getSentimentBadge = (score: number | null) => {
    if (score === null) return <Badge variant="outline">N/A</Badge>;
    if (score >= 4) return <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Positive</Badge>;
    if (score >= 2.5) return <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">Neutral</Badge>;
    return <Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">Negative</Badge>;
  };

  const filteredResponses = responses?.filter(r => {
    if (filterSentiment === 'all') return true;
    const score = r.sentiment_score;
    if (filterSentiment === 'positive') return score >= 4;
    if (filterSentiment === 'neutral') return score >= 2.5 && score < 4;
    if (filterSentiment === 'negative') return score < 2.5;
    return true;
  });

  const exportToCSV = () => {
    if (!filteredResponses?.length) {
      toast.error('No responses to export');
      return;
    }

    const headers = ['Submitted At', 'Respondent', 'Department', 'Sentiment Score', 'Responses'];
    const rows = filteredResponses.map(r => [
      format(new Date(r.submitted_at), 'yyyy-MM-dd HH:mm'),
      r.respondent?.full_name || 'Anonymous',
      r.respondent?.departments?.name || 'N/A',
      r.sentiment_score?.toFixed(2) || 'N/A',
      JSON.stringify(r.responses),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pulse_survey_responses_${surveyId.slice(0, 8)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Responses exported successfully');
  };

  // Calculate stats
  const totalResponses = responses?.length || 0;
  const avgSentiment = responses?.length 
    ? responses.reduce((acc, r) => acc + (r.sentiment_score || 0), 0) / responses.length
    : 0;
  const positiveCount = responses?.filter(r => (r.sentiment_score || 0) >= 4).length || 0;
  const negativeCount = responses?.filter(r => (r.sentiment_score || 0) < 2.5).length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{surveyTitle}</h2>
            <p className="text-muted-foreground">Survey Responses</p>
          </div>
        </div>
        <Button variant="outline" onClick={exportToCSV}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{totalResponses}</p>
                <p className="text-sm text-muted-foreground">Total Responses</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              {getSentimentIcon(avgSentiment)}
              <div>
                <p className="text-2xl font-bold">{avgSentiment.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">Avg Sentiment</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <ThumbsUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{positiveCount}</p>
                <p className="text-sm text-muted-foreground">Positive</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <ThumbsDown className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{negativeCount}</p>
                <p className="text-sm text-muted-foreground">Negative</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">Filter by sentiment:</span>
        </div>
        <Select value={filterSentiment} onValueChange={setFilterSentiment}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Responses</SelectItem>
            <SelectItem value="positive">Positive</SelectItem>
            <SelectItem value="neutral">Neutral</SelectItem>
            <SelectItem value="negative">Negative</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Responses Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Responses ({filteredResponses?.length || 0})</CardTitle>
          <CardDescription>Click on a response to view details</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : filteredResponses?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No responses found
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Respondent</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Sentiment</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResponses?.map((response) => (
                    <TableRow key={response.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {format(new Date(response.submitted_at), 'MMM d, yyyy h:mm a')}
                        </div>
                      </TableCell>
                      <TableCell>
                        {response.respondent?.full_name || 'Anonymous'}
                      </TableCell>
                      <TableCell>
                        {response.respondent?.departments?.name || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getSentimentIcon(response.sentiment_score)}
                          {getSentimentBadge(response.sentiment_score)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedResponse(response)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Response Detail Dialog */}
      <Dialog open={!!selectedResponse} onOpenChange={() => setSelectedResponse(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Response Details</DialogTitle>
          </DialogHeader>
          {selectedResponse && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">{selectedResponse.respondent?.full_name || 'Anonymous'}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedResponse.respondent?.departments?.name || 'No department'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(selectedResponse.submitted_at), 'PPpp')}
                  </p>
                  {getSentimentBadge(selectedResponse.sentiment_score)}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Responses</h4>
                {selectedResponse.responses && typeof selectedResponse.responses === 'object' ? (
                  <div className="space-y-3">
                    {Object.entries(selectedResponse.responses).map(([question, answer], idx) => (
                      <div key={idx} className="p-3 border rounded-lg">
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          {question}
                        </p>
                        <p>{String(answer)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No answers recorded</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
