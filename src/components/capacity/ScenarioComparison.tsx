import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWorkloadScenarios, WorkloadScenario } from '@/hooks/useWorkloadScenarios';
import { GitCompare, TrendingUp, TrendingDown, Minus, Calculator, Loader2, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export function ScenarioComparison() {
  const { 
    scenarios, 
    scenariosLoading, 
    workloadForecast,
    calculateScenario, 
    deleteScenario,
    isCalculating,
    isDeleting 
  } = useWorkloadScenarios();
  
  const [selectedScenario1, setSelectedScenario1] = useState<string>('');
  const [selectedScenario2, setSelectedScenario2] = useState<string>('');

  const scenario1 = scenarios.find(s => s.id === selectedScenario1);
  const scenario2 = scenarios.find(s => s.id === selectedScenario2);

  const baselineUtilization = workloadForecast.length > 0
    ? Math.round(workloadForecast.reduce((sum, w) => sum + w.utilization_pct, 0) / workloadForecast.length)
    : 0;

  const getScenarioAvgUtilization = (scenario: WorkloadScenario) => {
    if (!scenario.results?.weekly_utilization?.length) return null;
    return Math.round(
      scenario.results.weekly_utilization.reduce((sum, w) => sum + w.utilization_pct, 0) / 
      scenario.results.weekly_utilization.length
    );
  };

  const renderDelta = (current: number, baseline: number) => {
    const delta = current - baseline;
    if (delta === 0) return <Minus className="h-4 w-4 text-muted-foreground" />;
    if (delta > 0) return (
      <span className="flex items-center text-destructive text-sm">
        <TrendingUp className="h-4 w-4 mr-1" />+{delta}%
      </span>
    );
    return (
      <span className="flex items-center text-green-600 text-sm">
        <TrendingDown className="h-4 w-4 mr-1" />{delta}%
      </span>
    );
  };

  if (scenariosLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Scenario Comparison</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitCompare className="h-5 w-5" />
          Scenario Comparison
        </CardTitle>
        <CardDescription>
          Compare what-if scenarios against baseline forecast
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Baseline info */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Current Baseline</p>
              <p className="text-sm text-muted-foreground">Based on existing tasks and capacity</p>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-1">
              {baselineUtilization}% avg utilization
            </Badge>
          </div>
        </div>

        {/* Scenario selectors */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Scenario A</label>
            <Select value={selectedScenario1} onValueChange={setSelectedScenario1}>
              <SelectTrigger>
                <SelectValue placeholder="Select a scenario" />
              </SelectTrigger>
              <SelectContent>
                {scenarios.map(s => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                    {s.status === 'calculated' && <Badge className="ml-2" variant="outline">Calculated</Badge>}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Scenario B</label>
            <Select value={selectedScenario2} onValueChange={setSelectedScenario2}>
              <SelectTrigger>
                <SelectValue placeholder="Select a scenario" />
              </SelectTrigger>
              <SelectContent>
                {scenarios.filter(s => s.id !== selectedScenario1).map(s => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                    {s.status === 'calculated' && <Badge className="ml-2" variant="outline">Calculated</Badge>}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Comparison grid */}
        {(scenario1 || scenario2) && (
          <div className="grid gap-4 sm:grid-cols-2">
            {[scenario1, scenario2].filter(Boolean).map((scenario) => {
              if (!scenario) return null;
              const avgUtil = getScenarioAvgUtilization(scenario);
              const resourceChanges = scenario.scenario_data?.resource_changes?.length || 0;
              const deadlineShifts = scenario.scenario_data?.deadline_shifts?.length || 0;
              const newProjects = scenario.scenario_data?.new_projects?.length || 0;

              return (
                <Card key={scenario.id} className="border-2">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{scenario.name}</CardTitle>
                        <CardDescription className="text-xs">
                          Created {format(parseISO(scenario.created_at), 'MMM d, yyyy')}
                        </CardDescription>
                      </div>
                      <Badge variant={scenario.status === 'calculated' ? 'default' : 'secondary'}>
                        {scenario.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Changes summary */}
                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                      <div className="p-2 bg-muted/50 rounded">
                        <p className="font-semibold">{resourceChanges}</p>
                        <p className="text-xs text-muted-foreground">Resources</p>
                      </div>
                      <div className="p-2 bg-muted/50 rounded">
                        <p className="font-semibold">{deadlineShifts}</p>
                        <p className="text-xs text-muted-foreground">Deadlines</p>
                      </div>
                      <div className="p-2 bg-muted/50 rounded">
                        <p className="font-semibold">{newProjects}</p>
                        <p className="text-xs text-muted-foreground">Projects</p>
                      </div>
                    </div>

                    {/* Results */}
                    {avgUtil !== null ? (
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Avg Utilization</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold">{avgUtil}%</span>
                            {renderDelta(avgUtil, baselineUtilization)}
                          </div>
                        </div>
                        <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              avgUtil >= 100 ? 'bg-destructive' : 
                              avgUtil >= 85 ? 'bg-amber-500' : 'bg-primary'
                            }`}
                            style={{ width: `${Math.min(avgUtil, 100)}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 border border-dashed rounded-lg text-center">
                        <p className="text-sm text-muted-foreground mb-2">Not calculated yet</p>
                        <Button 
                          size="sm" 
                          onClick={() => calculateScenario(scenario)}
                          disabled={isCalculating}
                        >
                          {isCalculating ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <Calculator className="h-4 w-4 mr-1" />
                          )}
                          Calculate
                        </Button>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          deleteScenario(scenario.id);
                          if (selectedScenario1 === scenario.id) setSelectedScenario1('');
                          if (selectedScenario2 === scenario.id) setSelectedScenario2('');
                        }}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4 mr-1 text-destructive" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {scenarios.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <GitCompare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No scenarios created yet</p>
            <p className="text-sm mt-1">Create a what-if scenario to compare</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
