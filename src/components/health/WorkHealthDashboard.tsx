import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Activity,
  AlertTriangle,
  Shield,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  BarChart3,
  Target
} from 'lucide-react';
import { useWorkHealth } from '@/hooks/useWorkHealth';
import { RiskScoreCard } from './RiskScoreCard';
import { EarlyWarningAlerts } from './EarlyWarningAlerts';

export const WorkHealthDashboard = () => {
  const { 
    riskAssessments, 
    earlyWarnings, 
    summaryStats, 
    isLoading,
    detectWarnings,
    refetchWarnings
  } = useWorkHealth();
  const [activeTab, setActiveTab] = useState('overview');

  const getRiskColor = (score: number) => {
    if (score >= 4) return 'text-red-500';
    if (score >= 3) return 'text-orange-500';
    if (score >= 2) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getRiskBg = (score: number) => {
    if (score >= 4) return 'bg-red-500/10';
    if (score >= 3) return 'bg-orange-500/10';
    if (score >= 2) return 'bg-yellow-500/10';
    return 'bg-green-500/10';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingDown className="h-4 w-4 text-green-500" />;
      case 'worsening': return <TrendingUp className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Work Health Dashboard</h2>
          <p className="text-muted-foreground">Monitor project risks and early warnings</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => detectWarnings.mutate()}
            disabled={detectWarnings.isPending}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${detectWarnings.isPending ? 'animate-spin' : ''}`} />
            Scan for Warnings
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={summaryStats.criticalWarnings > 0 ? 'border-red-500/50' : ''}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical Warnings</p>
                <p className="text-2xl font-bold">{summaryStats.criticalWarnings}</p>
              </div>
              <div className={`p-3 rounded-full ${summaryStats.criticalWarnings > 0 ? 'bg-red-500/10' : 'bg-muted'}`}>
                <AlertTriangle className={`h-5 w-5 ${summaryStats.criticalWarnings > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Warnings</p>
                <p className="text-2xl font-bold">{summaryStats.totalWarnings}</p>
              </div>
              <div className="p-3 rounded-full bg-orange-500/10">
                <Activity className="h-5 w-5 text-orange-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {summaryStats.unacknowledged} unacknowledged
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Risk Score</p>
                <p className={`text-2xl font-bold ${getRiskColor(summaryStats.avgRiskScore)}`}>
                  {summaryStats.avgRiskScore.toFixed(1)}
                </p>
              </div>
              <div className={`p-3 rounded-full ${getRiskBg(summaryStats.avgRiskScore)}`}>
                <Target className={`h-5 w-5 ${getRiskColor(summaryStats.avgRiskScore)}`} />
              </div>
            </div>
            <Progress 
              value={(summaryStats.avgRiskScore / 5) * 100} 
              className="mt-2 h-1.5"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Assessments</p>
                <p className="text-2xl font-bold">{riskAssessments.length}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-500/10">
                <BarChart3 className="h-5 w-5 text-blue-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              across all projects
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview" className="gap-1.5 px-2 sm:px-3">
            <span className="text-xs sm:text-sm">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="warnings" className="gap-1.5 px-2 sm:px-3">
            <span className="text-xs sm:text-sm">Warnings</span>
            {summaryStats.unacknowledged > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">
                {summaryStats.unacknowledged}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="assessments" className="gap-1.5 px-2 sm:px-3">
            <span className="text-xs sm:text-sm">Assess</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Risk Heatmap */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Project Risk Heatmap</CardTitle>
              </CardHeader>
              <CardContent>
                {riskAssessments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No risk assessments yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Get unique projects with latest assessment */}
                    {Object.values(
                      riskAssessments.reduce((acc, a) => {
                        if (!acc[a.project_id] || new Date(a.assessment_date) > new Date(acc[a.project_id].assessment_date)) {
                          acc[a.project_id] = a;
                        }
                        return acc;
                      }, {} as Record<string, typeof riskAssessments[0]>)
                    ).slice(0, 6).map(assessment => (
                      <div
                        key={assessment.id}
                        className={`p-3 rounded-lg border ${getRiskBg(Number(assessment.overall_risk_score))}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{assessment.project?.name}</span>
                            {getTrendIcon(assessment.risk_trend)}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-lg font-bold ${getRiskColor(Number(assessment.overall_risk_score))}`}>
                              {Number(assessment.overall_risk_score).toFixed(1)}
                            </span>
                            <Badge variant="outline" className={getRiskColor(Number(assessment.overall_risk_score))}>
                              {Number(assessment.overall_risk_score) >= 4 ? 'Critical' :
                               Number(assessment.overall_risk_score) >= 3 ? 'High' :
                               Number(assessment.overall_risk_score) >= 2 ? 'Medium' : 'Low'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Warnings */}
            <EarlyWarningAlerts compact limit={5} />
          </div>
        </TabsContent>

        <TabsContent value="warnings">
          <EarlyWarningAlerts />
        </TabsContent>

        <TabsContent value="assessments">
          <RiskScoreCard />
        </TabsContent>
      </Tabs>
    </div>
  );
};
