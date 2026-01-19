import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { GitBranch, Plus, Search, Users, Target, TrendingUp, AlertTriangle } from 'lucide-react';

interface SuccessionPlan {
  id: string;
  position: string;
  current_holder: string;
  department: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  successors: {
    name: string;
    readiness: 'ready_now' | 'ready_1yr' | 'ready_2yr';
    readiness_score: number;
  }[];
}

export function SuccessionManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Mock data
  const plans: SuccessionPlan[] = [
    {
      id: '1',
      position: 'Chief Technology Officer',
      current_holder: 'Robert Chen',
      department: 'Technology',
      risk_level: 'high',
      successors: [
        { name: 'Sarah Johnson', readiness: 'ready_1yr', readiness_score: 75 },
        { name: 'Mike Williams', readiness: 'ready_2yr', readiness_score: 55 },
      ]
    },
    {
      id: '2',
      position: 'VP Engineering',
      current_holder: 'Alice Martinez',
      department: 'Technology',
      risk_level: 'medium',
      successors: [
        { name: 'David Kim', readiness: 'ready_now', readiness_score: 90 },
        { name: 'Emily Brown', readiness: 'ready_1yr', readiness_score: 70 },
      ]
    },
    {
      id: '3',
      position: 'Head of Sales',
      current_holder: 'James Wilson',
      department: 'Sales',
      risk_level: 'critical',
      successors: []
    },
    {
      id: '4',
      position: 'Finance Director',
      current_holder: 'Patricia Lee',
      department: 'Finance',
      risk_level: 'low',
      successors: [
        { name: 'Tom Anderson', readiness: 'ready_now', readiness_score: 95 },
        { name: 'Lisa Taylor', readiness: 'ready_now', readiness_score: 88 },
        { name: 'Mark Davis', readiness: 'ready_1yr', readiness_score: 72 },
      ]
    },
  ];

  const filteredPlans = plans.filter(p => {
    const matchesSearch = p.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.current_holder.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = riskFilter === 'all' || p.risk_level === riskFilter;
    return matchesSearch && matchesRisk;
  });

  const getRiskBadge = (risk: SuccessionPlan['risk_level']) => {
    const config: Record<SuccessionPlan['risk_level'], { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      low: { variant: 'default', label: 'Low Risk' },
      medium: { variant: 'secondary', label: 'Medium Risk' },
      high: { variant: 'outline', label: 'High Risk' },
      critical: { variant: 'destructive', label: 'Critical' },
    };
    return <Badge variant={config[risk].variant}>{config[risk].label}</Badge>;
  };

  const getReadinessBadge = (readiness: 'ready_now' | 'ready_1yr' | 'ready_2yr') => {
    const config = {
      ready_now: { color: 'bg-green-100 text-green-800', label: 'Ready Now' },
      ready_1yr: { color: 'bg-yellow-100 text-yellow-800', label: '1 Year' },
      ready_2yr: { color: 'bg-orange-100 text-orange-800', label: '2 Years' },
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${config[readiness].color}`}>{config[readiness].label}</span>;
  };

  const stats = {
    totalPositions: plans.length,
    critical: plans.filter(p => p.risk_level === 'critical').length,
    noSuccessor: plans.filter(p => p.successors.length === 0).length,
    readyNow: plans.filter(p => p.successors.some(s => s.readiness === 'ready_now')).length,
  };

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
              <Input placeholder="Position Title" />
              <Input placeholder="Current Holder" />
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tech">Technology</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                  <SelectItem value="ops">Operations</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Risk Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
              <Button className="w-full" onClick={() => setIsDialogOpen(false)}>Create Plan</Button>
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
      <div className="grid gap-4 md:grid-cols-2">
        {filteredPlans.map((plan) => (
          <Card key={plan.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{plan.position}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {plan.current_holder} • {plan.department}
                  </p>
                </div>
                {getRiskBadge(plan.risk_level)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm font-medium">Successors ({plan.successors.length})</p>
                {plan.successors.length === 0 ? (
                  <p className="text-sm text-red-600 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    No successors identified
                  </p>
                ) : (
                  <div className="space-y-3">
                    {plan.successors.map((successor, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                            {successor.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{successor.name}</p>
                            {getReadinessBadge(successor.readiness)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="w-20">
                            <Progress value={successor.readiness_score} className="h-2" />
                          </div>
                          <span className="text-xs text-muted-foreground">{successor.readiness_score}%</span>
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
    </div>
  );
}
