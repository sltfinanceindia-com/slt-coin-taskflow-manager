/**
 * Project Budget Tab
 * Budget overview, expense breakdown, budget vs actual
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DollarSign, Plus, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

interface ProjectBudgetTabProps {
  project: any;
}

export function ProjectBudgetTab({ project }: ProjectBudgetTabProps) {
  const budget = project.budget || 0;
  const spent = project.spent_budget || 0;
  const remaining = budget - spent;
  const usagePercent = budget > 0 ? Math.round((spent / budget) * 100) : 0;
  const isOverBudget = spent > budget;

  return (
    <div className="space-y-6">
      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm">Total Budget</span>
            </div>
            <p className="text-2xl font-bold mt-2">${budget.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className={isOverBudget ? 'border-destructive' : ''}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingDown className="h-4 w-4" />
              <span className="text-sm">Spent</span>
            </div>
            <p className={`text-2xl font-bold mt-2 ${isOverBudget ? 'text-destructive' : ''}`}>
              ${spent.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Remaining</span>
            </div>
            <p className={`text-2xl font-bold mt-2 ${remaining < 0 ? 'text-destructive' : 'text-green-600'}`}>
              ${remaining.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Budget Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Budget Utilization</span>
              <div className="flex items-center gap-2">
                <span className={`font-bold ${isOverBudget ? 'text-destructive' : ''}`}>
                  {usagePercent}%
                </span>
                {isOverBudget && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Over Budget
                  </Badge>
                )}
              </div>
            </div>
            <Progress 
              value={Math.min(usagePercent, 100)} 
              className={`h-3 ${isOverBudget ? '[&>div]:bg-destructive' : ''}`} 
            />
          </div>
        </CardContent>
      </Card>

      {/* Expense Breakdown */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Expense Breakdown</CardTitle>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No expenses recorded</p>
            <p className="text-sm mt-1">Track project expenses by category</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
