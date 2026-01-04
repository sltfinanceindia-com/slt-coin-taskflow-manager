import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, parseISO } from 'date-fns';
import { 
  Lightbulb, TrendingUp, AlertTriangle, CheckCircle, 
  Sparkles, RefreshCw, ChevronRight
} from 'lucide-react';

interface AIInsight {
  id: string;
  insight_type: string;
  title: string;
  content: Record<string, any>;
  confidence_score: number;
  severity: 'info' | 'warning' | 'critical';
  is_actionable: boolean;
  action_taken: boolean;
  created_at: string;
}

export function AIInsightsPanel() {
  const { profile } = useAuth();

  const { data: insights, isLoading, refetch } = useQuery({
    queryKey: ['ai-insights', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('organization_id', profile?.organization_id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as AIInsight[];
    },
    enabled: !!profile?.organization_id,
  });

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <TrendingUp className="h-4 w-4 text-amber-500" />;
      default: return <Lightbulb className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return <Badge variant="destructive">Critical</Badge>;
      case 'warning': return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30">Warning</Badge>;
      default: return <Badge variant="secondary">Info</Badge>;
    }
  };

  const getInsightTypeLabel = (type: string) => {
    switch (type) {
      case 'sentiment': return 'Sentiment Analysis';
      case 'attrition_risk': return 'Attrition Risk';
      case 'workforce_insights': return 'Workforce Insights';
      case 'report_insights': return 'Report Analysis';
      default: return type.replace('_', ' ');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Insights
          </CardTitle>
          <CardDescription>
            AI-powered analysis and recommendations
          </CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {insights && insights.length > 0 ? (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {insights.map((insight) => (
                <Card key={insight.id} className="border-dashed">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getSeverityIcon(insight.severity)}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-medium text-sm">{insight.title}</h4>
                          {getSeverityBadge(insight.severity)}
                        </div>
                        
                        <Badge variant="outline" className="text-xs">
                          {getInsightTypeLabel(insight.insight_type)}
                        </Badge>

                        {insight.content?.summary && (
                          <p className="text-sm text-muted-foreground">
                            {insight.content.summary}
                          </p>
                        )}

                        {insight.content?.recommendations && (
                          <div className="mt-2">
                            <p className="text-xs font-medium mb-1">Recommendations:</p>
                            <ul className="text-xs text-muted-foreground list-disc list-inside space-y-0.5">
                              {(insight.content.recommendations as string[]).slice(0, 3).map((rec, i) => (
                                <li key={i}>{rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {insight.confidence_score && (
                              <span>Confidence: {Math.round(insight.confidence_score * 100)}%</span>
                            )}
                            <span>•</span>
                            <span>{format(parseISO(insight.created_at), 'MMM d, h:mm a')}</span>
                          </div>
                          {insight.is_actionable && !insight.action_taken && (
                            <Button variant="ghost" size="sm" className="h-7 text-xs">
                              Take Action <ChevronRight className="h-3 w-3 ml-1" />
                            </Button>
                          )}
                          {insight.action_taken && (
                            <Badge variant="outline" className="text-xs text-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Resolved
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">No insights yet</p>
            <p className="text-sm">AI insights will appear here as you use the platform</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
