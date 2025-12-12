import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus, DollarSign, Clock, Target, Calculator } from 'lucide-react';
import { useBaselines } from '@/hooks/useBaselines';

interface EarnedValueChartProps {
  projectId: string;
}

interface EVMMetrics {
  // Planned Value (PV) - Budgeted Cost of Work Scheduled
  plannedValue: number;
  // Earned Value (EV) - Budgeted Cost of Work Performed
  earnedValue: number;
  // Actual Cost (AC) - Actual Cost of Work Performed
  actualCost: number;
  // Budget at Completion
  budgetAtCompletion: number;
  // Percent Complete
  percentComplete: number;
}

function calculateEVMMetrics(metrics: EVMMetrics) {
  const { plannedValue, earnedValue, actualCost, budgetAtCompletion, percentComplete } = metrics;
  
  // Schedule Variance (SV) = EV - PV
  const scheduleVariance = earnedValue - plannedValue;
  
  // Cost Variance (CV) = EV - AC
  const costVariance = earnedValue - actualCost;
  
  // Schedule Performance Index (SPI) = EV / PV
  const spi = plannedValue > 0 ? earnedValue / plannedValue : 0;
  
  // Cost Performance Index (CPI) = EV / AC
  const cpi = actualCost > 0 ? earnedValue / actualCost : 0;
  
  // Estimate at Completion (EAC) = BAC / CPI
  const eac = cpi > 0 ? budgetAtCompletion / cpi : budgetAtCompletion;
  
  // Estimate to Complete (ETC) = EAC - AC
  const etc = eac - actualCost;
  
  // Variance at Completion (VAC) = BAC - EAC
  const vac = budgetAtCompletion - eac;
  
  // To Complete Performance Index (TCPI) = (BAC - EV) / (BAC - AC)
  const tcpi = (budgetAtCompletion - actualCost) > 0 
    ? (budgetAtCompletion - earnedValue) / (budgetAtCompletion - actualCost) 
    : 0;

  return {
    scheduleVariance,
    costVariance,
    spi,
    cpi,
    eac,
    etc,
    vac,
    tcpi,
    percentComplete
  };
}

function MetricCard({ 
  title, 
  value, 
  unit = '', 
  description, 
  trend, 
  icon: Icon,
  colorClass 
}: { 
  title: string; 
  value: number; 
  unit?: string;
  description: string; 
  trend: 'good' | 'bad' | 'neutral';
  icon: React.ElementType;
  colorClass: string;
}) {
  const TrendIcon = trend === 'good' ? TrendingUp : trend === 'bad' ? TrendingDown : Minus;
  const trendColor = trend === 'good' ? 'text-green-500' : trend === 'bad' ? 'text-red-500' : 'text-muted-foreground';
  
  return (
    <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
      <div className={`p-2 rounded-lg ${colorClass}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold">
            {typeof value === 'number' ? value.toFixed(2) : value}{unit}
          </span>
          <TrendIcon className={`h-4 w-4 ${trendColor}`} />
        </div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function PerformanceGauge({ value, label, thresholds }: { 
  value: number; 
  label: string;
  thresholds: { bad: number; good: number };
}) {
  const percentage = Math.min(Math.max(value * 50, 0), 100); // Scale 0-2 to 0-100
  const status = value >= thresholds.good ? 'good' : value < thresholds.bad ? 'bad' : 'warning';
  const statusColor = status === 'good' ? 'bg-green-500' : status === 'bad' ? 'bg-red-500' : 'bg-yellow-500';
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{label}</span>
        <Badge variant={status === 'good' ? 'default' : status === 'bad' ? 'destructive' : 'secondary'}>
          {value.toFixed(2)}
        </Badge>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all ${statusColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Behind ({"<"}1.0)</span>
        <span>On Track (1.0)</span>
        <span>Ahead ({">"}1.0)</span>
      </div>
    </div>
  );
}

export function EarnedValueChart({ projectId }: EarnedValueChartProps) {
  const { calculateVariance } = useBaselines(projectId);
  
  // In a real implementation, these would come from actual project data
  // For now, we'll use the variance data to derive EVM metrics
  const [evmData, setEvmData] = React.useState<ReturnType<typeof calculateEVMMetrics> | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadEVMData() {
      setLoading(true);
      try {
        const variance = await calculateVariance(projectId);
        
        if (variance) {
          // Derive EVM metrics from variance data
          const baselineHours = variance.baseline_hours || 100;
          const actualHours = variance.actual_hours || 0;
          const completionRate = variance.completion_rate || 0;
          
          const metrics: EVMMetrics = {
            plannedValue: baselineHours * (completionRate / 100),
            earnedValue: baselineHours * (completionRate / 100),
            actualCost: actualHours,
            budgetAtCompletion: baselineHours,
            percentComplete: completionRate
          };
          
          setEvmData(calculateEVMMetrics(metrics));
        }
      } catch (error) {
        console.error('Failed to load EVM data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadEVMData();
  }, [projectId, calculateVariance]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Earned Value Management</CardTitle>
          <CardDescription>Loading EVM metrics...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-muted rounded" />
            <div className="h-20 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!evmData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Earned Value Management</CardTitle>
          <CardDescription>No baseline data available</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Create a baseline to enable EVM metrics tracking.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Earned Value Management
        </CardTitle>
        <CardDescription>
          Project performance metrics based on scope, schedule, and cost
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Performance Indices */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold">Performance Indices</h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <PerformanceGauge 
              value={evmData.spi} 
              label="Schedule Performance Index (SPI)"
              thresholds={{ bad: 0.9, good: 1.0 }}
            />
            <PerformanceGauge 
              value={evmData.cpi} 
              label="Cost Performance Index (CPI)"
              thresholds={{ bad: 0.9, good: 1.0 }}
            />
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Schedule Variance"
            value={evmData.scheduleVariance}
            unit="h"
            description={evmData.scheduleVariance >= 0 ? "Ahead of schedule" : "Behind schedule"}
            trend={evmData.scheduleVariance >= 0 ? 'good' : 'bad'}
            icon={Clock}
            colorClass="bg-blue-500/10 text-blue-500"
          />
          <MetricCard
            title="Cost Variance"
            value={evmData.costVariance}
            unit="h"
            description={evmData.costVariance >= 0 ? "Under budget" : "Over budget"}
            trend={evmData.costVariance >= 0 ? 'good' : 'bad'}
            icon={DollarSign}
            colorClass="bg-green-500/10 text-green-500"
          />
          <MetricCard
            title="Estimate at Completion"
            value={evmData.eac}
            unit="h"
            description="Projected total cost"
            trend={evmData.vac >= 0 ? 'good' : 'bad'}
            icon={Target}
            colorClass="bg-purple-500/10 text-purple-500"
          />
          <MetricCard
            title="Estimate to Complete"
            value={evmData.etc}
            unit="h"
            description="Remaining work estimate"
            trend="neutral"
            icon={Calculator}
            colorClass="bg-orange-500/10 text-orange-500"
          />
        </div>

        {/* Project Completion */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Project Completion</span>
            <span className="font-medium">{evmData.percentComplete.toFixed(1)}%</span>
          </div>
          <Progress value={evmData.percentComplete} className="h-3" />
        </div>

        {/* Forecast Summary */}
        <div className="p-4 rounded-lg bg-muted/50 space-y-2">
          <h4 className="text-sm font-semibold">Forecast Summary</h4>
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Variance at Completion (VAC)</span>
              <span className={evmData.vac >= 0 ? 'text-green-500' : 'text-red-500'}>
                {evmData.vac >= 0 ? '+' : ''}{evmData.vac.toFixed(1)}h
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">To Complete Performance Index (TCPI)</span>
              <Badge variant={evmData.tcpi <= 1.1 ? 'default' : 'destructive'}>
                {evmData.tcpi.toFixed(2)}
              </Badge>
            </div>
          </div>
          {evmData.tcpi > 1.1 && (
            <p className="text-xs text-amber-500 mt-2">
              ⚠️ TCPI {">"} 1.1 indicates the project may struggle to meet budget
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Need React import for useState/useEffect
import React from 'react';
