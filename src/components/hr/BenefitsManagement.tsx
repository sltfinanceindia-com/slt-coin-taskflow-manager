import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HeartPulse, Shield, Users, FileText, Plus, CheckCircle, DollarSign, Loader2, FileX } from "lucide-react";
import { format } from "date-fns";
import { useBenefits, EmployeeBenefit } from "@/hooks/useBenefits";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function BenefitsManagement() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: "",
    name: "",
    type: "health" as EmployeeBenefit['type'],
    provider: "",
    coverage_amount: "",
    premium: "",
    employer_contribution: "",
    employee_contribution: "",
    valid_from: "",
    valid_until: "",
    dependents_count: "0",
  });

  const { benefits, isLoading, error, createBenefit } = useBenefits();

  const { data: employees = [] } = useQuery({
    queryKey: ['employees-for-benefits'],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('id, full_name, email').order('full_name');
      return data || [];
    }
  });

  const handleSubmit = () => {
    createBenefit.mutate({
      employee_id: formData.employee_id || null,
      name: formData.name,
      type: formData.type,
      provider: formData.provider || null,
      coverage_amount: formData.coverage_amount ? Number(formData.coverage_amount) : null,
      premium: formData.premium ? Number(formData.premium) : null,
      employer_contribution: formData.employer_contribution ? Number(formData.employer_contribution) : null,
      employee_contribution: formData.employee_contribution ? Number(formData.employee_contribution) : null,
      valid_from: formData.valid_from || null,
      valid_until: formData.valid_until || null,
      dependents_count: formData.dependents_count ? Number(formData.dependents_count) : null,
      status: 'active',
      organization_id: null,
    });
    setIsDialogOpen(false);
    setFormData({
      employee_id: "", name: "", type: "health", provider: "", coverage_amount: "",
      premium: "", employer_contribution: "", employee_contribution: "",
      valid_from: "", valid_until: "", dependents_count: "0",
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "health": return <HeartPulse className="h-5 w-5 text-red-500" />;
      case "life": return <Shield className="h-5 w-5 text-blue-500" />;
      case "dental": return <HeartPulse className="h-5 w-5 text-purple-500" />;
      case "vision": return <HeartPulse className="h-5 w-5 text-green-500" />;
      default: return <FileText className="h-5 w-5 text-muted-foreground" />;
    }
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
        <h3 className="mt-4 font-semibold">Error loading benefits</h3>
        <p className="text-muted-foreground">{error.message}</p>
      </Card>
    );
  }

  const activeBenefits = benefits.filter(b => b.status === 'active');
  const totalEmployerContribution = activeBenefits.reduce((sum, b) => sum + (b.employer_contribution || 0), 0);
  const totalEmployeeContribution = activeBenefits.reduce((sum, b) => sum + (b.employee_contribution || 0), 0);
  const totalDependents = activeBenefits.reduce((sum, b) => sum + (b.dependents_count || 0), 0);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Employee Benefits</h1>
          <p className="text-muted-foreground">Track insurance, health benefits, and other perks</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Benefit
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Benefit</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Employee</Label>
                <Select value={formData.employee_id} onValueChange={(v) => setFormData({...formData, employee_id: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp: any) => (
                      <SelectItem key={emp.id} value={emp.id}>{emp.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Benefit Name</Label>
                <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g., Group Health Insurance" />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={formData.type} onValueChange={(v: EmployeeBenefit['type']) => setFormData({...formData, type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="life">Life</SelectItem>
                    <SelectItem value="dental">Dental</SelectItem>
                    <SelectItem value="vision">Vision</SelectItem>
                    <SelectItem value="retirement">Retirement</SelectItem>
                    <SelectItem value="wellness">Wellness</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Provider</Label>
                <Input value={formData.provider} onChange={(e) => setFormData({...formData, provider: e.target.value})} placeholder="e.g., ICICI Lombard" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Coverage Amount</Label>
                  <Input type="number" value={formData.coverage_amount} onChange={(e) => setFormData({...formData, coverage_amount: e.target.value})} placeholder="500000" />
                </div>
                <div className="space-y-2">
                  <Label>Premium</Label>
                  <Input type="number" value={formData.premium} onChange={(e) => setFormData({...formData, premium: e.target.value})} placeholder="15000" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Employer Contribution</Label>
                  <Input type="number" value={formData.employer_contribution} onChange={(e) => setFormData({...formData, employer_contribution: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Employee Contribution</Label>
                  <Input type="number" value={formData.employee_contribution} onChange={(e) => setFormData({...formData, employee_contribution: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valid From</Label>
                  <Input type="date" value={formData.valid_from} onChange={(e) => setFormData({...formData, valid_from: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Valid Until</Label>
                  <Input type="date" value={formData.valid_until} onChange={(e) => setFormData({...formData, valid_until: e.target.value})} />
                </div>
              </div>
              <Button className="w-full" onClick={handleSubmit} disabled={createBenefit.isPending || !formData.name}>
                {createBenefit.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Adding...</> : 'Add Benefit'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Benefits</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBenefits.length}</div>
            <p className="text-xs text-muted-foreground">Currently enrolled</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Employer Contribution</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalEmployerContribution.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Annual</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Employee Contribution</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalEmployeeContribution.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Annual</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Dependents Covered</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDependents}</div>
            <p className="text-xs text-muted-foreground">Family members</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">All Benefits</TabsTrigger>
          <TabsTrigger value="claims">Claims</TabsTrigger>
          <TabsTrigger value="dependents">Dependents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {benefits.length === 0 ? (
            <Card className="p-8 text-center">
              <FileX className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 font-semibold">No benefits found</h3>
              <p className="text-muted-foreground">Get started by adding your first benefit.</p>
              <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />Add Benefit
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {benefits.map((benefit) => (
                <Card key={benefit.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getTypeIcon(benefit.type)}
                        <div>
                          <CardTitle className="text-lg">{benefit.name}</CardTitle>
                          <CardDescription>{benefit.provider || 'No provider'}</CardDescription>
                        </div>
                      </div>
                      <Badge variant={benefit.status === 'active' ? 'default' : 'secondary'}>
                        {benefit.status.charAt(0).toUpperCase() + benefit.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Coverage</p>
                        <p className="font-semibold">₹{(benefit.coverage_amount || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Valid Until</p>
                        <p className="font-semibold">{benefit.valid_until ? format(new Date(benefit.valid_until), "MMM dd, yyyy") : 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Employer Pays</p>
                        <p className="font-semibold">₹{(benefit.employer_contribution || 0).toLocaleString()}/yr</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Employee Pays</p>
                        <p className="font-semibold">₹{(benefit.employee_contribution || 0).toLocaleString()}/yr</p>
                      </div>
                    </div>
                    {benefit.employee && (
                      <p className="text-sm text-muted-foreground">Employee: {benefit.employee.full_name}</p>
                    )}
                    {(benefit.dependents_count || 0) > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{benefit.dependents_count} dependents covered</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="claims">
          <Card>
            <CardHeader>
              <CardTitle>Claims History</CardTitle>
              <CardDescription>Track your benefit claims and reimbursements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">Claims tracking coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dependents">
          <Card>
            <CardHeader>
              <CardTitle>Covered Dependents</CardTitle>
              <CardDescription>Family members included in your benefits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">Dependents tracking coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
