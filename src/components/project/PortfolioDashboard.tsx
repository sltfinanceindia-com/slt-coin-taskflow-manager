import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  Clock,
  FolderOpen,
  BarChart3
} from 'lucide-react';
import { usePortfolios, Portfolio } from '@/hooks/usePortfolios';
import { usePrograms } from '@/hooks/usePrograms';
import { useEnhancedProjects } from '@/hooks/useEnhancedProjects';
import { formatINR } from '@/lib/currency';
import { Skeleton } from '@/components/ui/skeleton';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, trend }) => (
  <Card className="relative overflow-hidden">
    <CardContent className="p-4 sm:p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-xl sm:text-2xl font-bold">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center gap-1 text-xs ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
              <TrendingUp className={`h-3 w-3 ${!trend.isPositive && 'rotate-180'}`} />
              <span>{trend.value}%</span>
            </div>
          )}
        </div>
        <div className="rounded-lg bg-primary/10 p-2 sm:p-3">
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

const getRiskBadge = (level: Portfolio['risk_level']) => {
  const config = {
    low: { variant: 'secondary' as const, label: 'Low Risk' },
    medium: { variant: 'outline' as const, label: 'Medium Risk' },
    high: { variant: 'destructive' as const, label: 'High Risk' },
    critical: { variant: 'destructive' as const, label: 'Critical' },
  };
  return config[level];
};

export const PortfolioDashboard: React.FC = () => {
  const { portfolios, isLoading: loadingPortfolios } = usePortfolios();
  const { programs, isLoading: loadingPrograms } = usePrograms();
  const { projects, isLoading: loadingProjects } = useEnhancedProjects();

  const isLoading = loadingPortfolios || loadingPrograms || loadingProjects;

  // Calculate aggregate metrics
  const totalBudget = portfolios.reduce((sum, p) => sum + (p.budget || 0), 0);
  const totalSpent = portfolios.reduce((sum, p) => sum + (p.spent_budget || 0), 0);
  const avgCompletion = portfolios.length > 0
    ? Math.round(portfolios.reduce((sum, p) => sum + (p.completion_rate || 0), 0) / portfolios.length)
    : 0;
  
  const projectsByHealth = {
    green: projects.filter(p => p.health_status === 'green').length,
    amber: projects.filter(p => p.health_status === 'amber').length,
    red: projects.filter(p => p.health_status === 'red').length,
  };

  const activeProjects = projects.filter(p => p.stage === 'in_progress').length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Portfolios"
          value={portfolios.length}
          subtitle={`${programs.length} programs`}
          icon={<Briefcase className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />}
        />
        <StatCard
          title="Active Projects"
          value={activeProjects}
          subtitle={`${projects.length} total`}
          icon={<FolderOpen className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />}
        />
        <StatCard
          title="Total Budget"
          value={formatINR(totalBudget)}
          subtitle={`${formatINR(totalSpent)} spent`}
          icon={<DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />}
        />
        <StatCard
          title="Avg Completion"
          value={`${avgCompletion}%`}
          icon={<BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />}
        />
      </div>

      {/* Project Health Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Project Health Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 sm:p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                <span className="text-xs sm:text-sm font-medium text-green-500">On Track</span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-green-500">{projectsByHealth.green}</p>
            </div>
            <div className="text-center p-3 sm:p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
                <span className="text-xs sm:text-sm font-medium text-amber-500">At Risk</span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-amber-500">{projectsByHealth.amber}</p>
            </div>
            <div className="text-center p-3 sm:p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                <span className="text-xs sm:text-sm font-medium text-red-500">Critical</span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-red-500">{projectsByHealth.red}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {portfolios.slice(0, 4).map((portfolio) => (
          <Card key={portfolio.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base sm:text-lg truncate">{portfolio.name}</CardTitle>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-1">
                    {portfolio.description || 'No description'}
                  </p>
                </div>
                <Badge {...getRiskBadge(portfolio.risk_level)} className="shrink-0">
                  {getRiskBadge(portfolio.risk_level).label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Completion</span>
                  <span className="font-medium">{portfolio.completion_rate || 0}%</span>
                </div>
                <Progress value={portfolio.completion_rate || 0} className="h-2" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div>
                  <p className="text-xs text-muted-foreground">Programs</p>
                  <p className="text-lg font-semibold">{portfolio.programs_count || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Projects</p>
                  <p className="text-lg font-semibold">{portfolio.projects_count || 0}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span>Budget</span>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatINR(portfolio.budget || 0)}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatINR(portfolio.spent_budget || 0)} spent
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PortfolioDashboard;
