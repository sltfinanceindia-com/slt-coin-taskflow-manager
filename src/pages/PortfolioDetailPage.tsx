import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { usePortfolios, Portfolio } from '@/hooks/usePortfolios';
import { usePrograms } from '@/hooks/usePrograms';
import { useUserRole } from '@/hooks/useUserRole';
import { formatINR } from '@/lib/currency';
import { format } from 'date-fns';
import { 
  ArrowLeft, Briefcase, Layers, FolderOpen, DollarSign, 
  Calendar, Users, TrendingUp, Edit, AlertTriangle, CheckCircle 
} from 'lucide-react';

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
];

const riskOptions = [
  { value: 'low', label: 'Low', color: 'bg-green-500' },
  { value: 'medium', label: 'Medium', color: 'bg-amber-500' },
  { value: 'high', label: 'High', color: 'bg-orange-500' },
  { value: 'critical', label: 'Critical', color: 'bg-red-500' },
];

export default function PortfolioDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { portfolios, isLoading, updatePortfolio, isUpdating } = usePortfolios();
  const { programs } = usePrograms(id);
  const { isAdmin } = useUserRole();
  
  const portfolio = portfolios.find(p => p.id === id);

  const handleStatusChange = (newStatus: string) => {
    if (portfolio && isAdmin) {
      updatePortfolio({ id: portfolio.id, status: newStatus as Portfolio['status'] });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Portfolio not found</p>
            <Button variant="outline" onClick={() => navigate(-1)} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const riskConfig = riskOptions.find(r => r.value === portfolio.risk_level);
  const budgetUsed = portfolio.budget > 0 
    ? Math.round((portfolio.spent_budget / portfolio.budget) * 100) 
    : 0;

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Briefcase className="h-6 w-6" />
              {portfolio.name}
            </h1>
            <p className="text-muted-foreground">{portfolio.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <Select value={portfolio.status} onValueChange={handleStatusChange} disabled={isUpdating}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Badge variant={portfolio.status === 'active' ? 'default' : 'secondary'}>
            {statusOptions.find(s => s.value === portfolio.status)?.label}
          </Badge>
          <div className="flex items-center gap-1">
            <div className={`h-3 w-3 rounded-full ${riskConfig?.color}`} />
            <span className="text-sm">{riskConfig?.label} Risk</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Layers className="h-4 w-4" /> Programs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portfolio.programs_count || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FolderOpen className="h-4 w-4" /> Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portfolio.projects_count || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portfolio.completion_rate || 0}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" /> Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatINR(portfolio.budget || 0)}</div>
            <p className="text-xs text-muted-foreground">{budgetUsed}% used</p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Budget Utilization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Spent: {formatINR(portfolio.spent_budget || 0)}</span>
            <span>Total: {formatINR(portfolio.budget || 0)}</span>
          </div>
          <Progress value={budgetUsed} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Remaining: {formatINR((portfolio.budget || 0) - (portfolio.spent_budget || 0))}</span>
            {portfolio.target_roi && <span>Target ROI: {portfolio.target_roi}%</span>}
          </div>
        </CardContent>
      </Card>

      {/* Programs Tab */}
      <Tabs defaultValue="programs">
        <TabsList>
          <TabsTrigger value="programs">Programs ({programs.length})</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="programs" className="mt-4">
          {programs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Layers className="h-12 w-12 mb-4 opacity-50" />
                <p>No programs in this portfolio yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {programs.map(program => (
                <Card 
                  key={program.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/programs/${program.id}`)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      {program.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">{program.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{program.status}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {program.projects_count || 0} projects
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="details" className="mt-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Owner</p>
                  <p className="font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {portfolio.owner?.full_name || 'Not assigned'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(portfolio.created_at), 'MMM d, yyyy')}
                  </p>
                </div>
                {portfolio.start_date && (
                  <div>
                    <p className="text-sm text-muted-foreground">Start Date</p>
                    <p className="font-medium">{format(new Date(portfolio.start_date), 'MMM d, yyyy')}</p>
                  </div>
                )}
                {portfolio.target_end_date && (
                  <div>
                    <p className="text-sm text-muted-foreground">Target End Date</p>
                    <p className="font-medium">{format(new Date(portfolio.target_end_date), 'MMM d, yyyy')}</p>
                  </div>
                )}
              </div>

            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
