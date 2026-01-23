import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { GitBranch, Plus, Search, Users, Target, TrendingUp, AlertTriangle, Loader2, FileX } from 'lucide-react';
import { useSuccessionPlans } from '@/hooks/useSuccessionPlans';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function SuccessionManagement() {
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    position: '',
    current_holder_id: '',
    department: '',
    risk_level: 'medium',
  });

  const { plans, isLoading, error, createPlan } = useSuccessionPlans();

  const { data: employees } = useQuery({
    queryKey: ['employees-for-succession', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('organization_id', profile?.organization_id)
        .eq('is_active', true)
        .order('full_name');
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  const handleSubmit = () => {
    if (!formData.position || !formData.current_holder_id) return;
    
    createPlan.mutate({
      position: formData.position,
      current_holder_id: formData.current_holder_id,
      department: formData.department,
      risk_level: formData.risk_level as 'low' | 'medium' | 'high' | 'critical',
    });
    
    setIsDialogOpen(false);
    setFormData({ position: '', current_holder_id: '', department: '', risk_level: 'medium' });
  };

  const filteredPlans = plans.filter(p => {
    const matchesSearch = p.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (p.current_holder?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = riskFilter === 'all' || p.risk_level === riskFilter;
    return matchesSearch && matchesRisk;
  });

  const getRiskBadge = (risk: string) => {
    const config: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      low: { variant: 'default', label: 'Low Risk' },
      medium: { variant: 'secondary', label: 'Medium Risk' },
      high: { variant: 'outline', label: 'High Risk' },
      critical: { variant: 'destructive', label: 'Critical' },
    };
    const cfg = config[risk] || { variant: 'secondary', label: risk };
    return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
  };

  const getReadinessBadge = (readiness: string) => {
    const config: Record<string, { color: string; label: string }> = {
      ready_now: { color: 'bg-green-100 text-green-800', label: 'Ready Now' },
      ready_1yr: { color: 'bg-yellow-100 text-yellow-800', label: '1 Year' },
      ready_2yr: { color: 'bg-orange-100 text-orange-800', label: '2 Years' },
    };
    const cfg = config[readiness] || { color: 'bg-gray-100 text-gray-800', label: readiness };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${cfg.color}`}>{cfg.label}</span>;
  };

  const stats = {
    totalPositions: plans.length,
    critical: plans.filter(p => p.risk_level === 'critical').length,
    noSuccessor: plans.filter(p => !p.candidates || p.candidates.length === 0).length,
    readyNow: plans.filter(p => p.candidates?.some((c: any) => c.readiness === 'ready_now')).length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center border-destructive">
        <FileX className="h-12 w-12 mx-auto text-destructive" />
        <h3 className="mt-4 font-semibold">Error loading succession plans</h3>
        <p className="text-muted-foreground">{error.message}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Succession Planning</h2>
          <p className="text-muted-foreground">Identify and develop future leaders</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Succession Plan</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Position Title</Label>
                <Input 
                  placeholder="e.g., Chief Technology Officer"
                  value={formData.position}
                  onChange={(e) => setFormData(p => ({ ...p, position: e.target.value }))}
                />
              </div>
              <div>
                <Label>Current Holder</Label>
                <Select value={formData.current_holder_id} onValueChange={(v) => setFormData(p => ({ ...p, current_holder_id: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees?.map((e) => (
                      <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Department</Label>
                <Select value={formData.department} onValueChange={(v) => setFormData(p => ({ ...p, department: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Risk Level</Label>
                <Select value={formData.risk_level} onValueChange={(v) => setFormData(p => ({ ...p, risk_level: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={handleSubmit} disabled={createPlan.isPending}>
                {createPlan.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : 'Create Plan'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Key Positions</p>
                <p className="text-2xl font-bold">{stats.totalPositions}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical Risk</p>
                <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">No Successor</p>
                <p className="text-2xl font-bold text-orange-600">{stats.noSuccessor}</p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ready Now</p>
                <p className="text-2xl font-bold text-green-600">{stats.readyNow}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search positions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risks</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Succession Plans */}
      {filteredPlans.length === 0 ? (
        <Card className="p-8 text-center">
          <FileX className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No succession plans found</p>
          <p className="text-sm text-muted-foreground">Create your first plan to get started</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredPlans.map((plan) => (
            <Card key={plan.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{plan.position}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {plan.current_holder?.full_name || 'Unknown'} • {plan.department}
                    </p>
                  </div>
                  {getRiskBadge(plan.risk_level)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm font-medium">Successors ({plan.candidates?.length || 0})</p>
                  {(!plan.candidates || plan.candidates.length === 0) ? (
                    <p className="text-sm text-red-600 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      No successors identified
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {plan.candidates.map((successor: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                              {successor.name?.charAt(0) || '?'}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{successor.name}</p>
                              {getReadinessBadge(successor.readiness)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="w-20">
                              <Progress value={successor.readiness_score || 0} className="h-2" />
                            </div>
                            <span className="text-xs text-muted-foreground">{successor.readiness_score || 0}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Successor
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
