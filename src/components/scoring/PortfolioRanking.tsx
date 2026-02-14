import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useScoringModels, useProjectScores, PortfolioRanking as PortfolioRankingType } from '@/hooks/useScoringModels';
import { Trophy, Download, Medal, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function PortfolioRanking() {
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [ranking, setRanking] = useState<PortfolioRankingType[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);

  const { models } = useScoringModels();
  const { getPortfolioRanking } = useProjectScores(selectedModelId);

  const selectedModel = models.find(m => m.id === selectedModelId);

  // Set default model
  useEffect(() => {
    const defaultModel = models.find(m => m.is_default);
    if (defaultModel && !selectedModelId) {
      setSelectedModelId(defaultModel.id);
    }
  }, [models]);

  // Load ranking when model changes
  useEffect(() => {
    if (selectedModelId) {
      loadRanking();
    }
  }, [selectedModelId]);

  const loadRanking = async () => {
    setIsLoading(true);
    const data = await getPortfolioRanking(selectedModelId);
    setRanking(data);
    setIsLoading(false);
  };

  const exportRanking = () => {
    const csv = [
      ['Rank', 'Project', 'Status', 'Score', 'Priority'].join(','),
      ...ranking.map(r => [
        r.rank,
        `"${r.project_name}"`,
        r.project_status,
        r.total_score,
        r.total_score >= 70 ? 'High' : r.total_score >= 40 ? 'Medium' : 'Low'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-ranking-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
    return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">{rank}</span>;
  };

  const getScoreBadge = (score: number) => {
    if (score >= 70) return <Badge className="bg-primary">High</Badge>;
    if (score >= 40) return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Medium</Badge>;
    return <Badge variant="secondary">Low</Badge>;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'on_hold':
        return <Badge variant="outline">On Hold</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Portfolio Ranking</h2>
          <p className="text-muted-foreground">
            Prioritized list of all projects by score
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={selectedModelId} onValueChange={setSelectedModelId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              {models.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  {model.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={exportRanking} disabled={ranking.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      {ranking.length > 0 && (
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            title="Total Projects"
            value={ranking.length}
            icon={Trophy}
          />
          <StatCard
            title="High Priority"
            value={ranking.filter(r => r.total_score >= 70).length}
            color="text-primary"
          />
          <StatCard
            title="Medium Priority"
            value={ranking.filter(r => r.total_score >= 40 && r.total_score < 70).length}
            color="text-yellow-600"
          />
          <StatCard
            title="Avg Score"
            value={Math.round(ranking.reduce((sum, r) => sum + r.total_score, 0) / ranking.length)}
          />
        </div>
      )}

      {/* Ranking List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Project Rankings
          </CardTitle>
          <CardDescription>
            {selectedModel ? `Using "${selectedModel.name}" scoring model` : 'Select a model to view rankings'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : ranking.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Trophy className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No scored projects found.</p>
              <p className="text-sm">Score projects to see them in the ranking.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {ranking.map((project, index) => (
                <div
                  key={project.project_id}
                  className={`flex items-center gap-4 p-4 rounded-lg border transition-colors hover:bg-muted/50 ${
                    index === 0 ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900' : ''
                  }`}
                >
                  {/* Rank */}
                  <div className="flex-shrink-0 w-10 flex justify-center">
                    {getRankIcon(project.rank)}
                  </div>

                  {/* Project Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">{project.project_name}</h4>
                      {getStatusBadge(project.project_status)}
                    </div>
                    <Progress value={project.total_score} className="h-2" />
                  </div>

                  {/* Score */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-2xl font-bold">{project.total_score}</p>
                      <p className="text-xs text-muted-foreground">score</p>
                    </div>
                    {getScoreBadge(project.total_score)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Funding Recommendation */}
      {ranking.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Funding Recommendation</CardTitle>
            <CardDescription>
              Based on scoring, these projects should be prioritized
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-primary/5 dark:bg-primary/10 rounded-lg border border-primary/20 dark:border-primary/30">
                <h4 className="font-medium text-primary mb-2 flex items-center gap-2">
                  <ArrowUp className="h-4 w-4" />
                  Fund These ({ranking.filter(r => r.total_score >= 70).length})
                </h4>
                <p className="text-sm text-muted-foreground">
                  {ranking.filter(r => r.total_score >= 70).map(r => r.project_name).join(', ') || 'No high priority projects'}
                </p>
              </div>

              <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-900">
                <h4 className="font-medium text-yellow-700 dark:text-yellow-400 mb-2 flex items-center gap-2">
                  <Minus className="h-4 w-4" />
                  Consider ({ranking.filter(r => r.total_score >= 40 && r.total_score < 70).length})
                </h4>
                <p className="text-sm text-muted-foreground">
                  {ranking.filter(r => r.total_score >= 40 && r.total_score < 70).map(r => r.project_name).join(', ') || 'No medium priority projects'}
                </p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-950/20 rounded-lg border">
                <h4 className="font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <ArrowDown className="h-4 w-4" />
                  Defer ({ranking.filter(r => r.total_score < 40).length})
                </h4>
                <p className="text-sm text-muted-foreground">
                  {ranking.filter(r => r.total_score < 40).map(r => r.project_name).join(', ') || 'No low priority projects'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  icon?: any;
  color?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className={`text-3xl font-bold ${color || ''}`}>{value}</p>
          </div>
          {Icon && <Icon className="h-8 w-8 text-muted-foreground" />}
        </div>
      </CardContent>
    </Card>
  );
}
