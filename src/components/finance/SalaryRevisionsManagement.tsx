import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, TrendingUp, Search, FileText, Calendar, DollarSign, Loader2, FileX } from "lucide-react";
import { format } from "date-fns";
import { useSalaryRevisions } from "@/hooks/useSalaryRevisions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function SalaryRevisionsManagement() {
  const { profile } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    employee_id: "",
    previous_salary: 0,
    new_salary: 0,
    effective_date: format(new Date(), 'yyyy-MM-dd'),
    revision_type: "annual",
    remarks: ""
  });

  const { revisions, isLoading, error, createRevision, updateRevision } = useSalaryRevisions();

  const { data: employees } = useQuery({
    queryKey: ['employees-for-revision', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('organization_id', profile?.organization_id)
        .eq('is_active', true)
        .order('full_name');
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  const calculateIncrement = (prev: number, newSal: number) => {
    if (prev === 0) return 0;
    return ((newSal - prev) / prev * 100).toFixed(2);
  };

  const handleSubmit = () => {
    if (!formData.employee_id || formData.new_salary <= 0) return;
    
    createRevision.mutate({
      employee_id: formData.employee_id,
      previous_salary: formData.previous_salary,
      new_salary: formData.new_salary,
      effective_date: formData.effective_date,
      revision_type: formData.revision_type as 'annual' | 'market_adjustment' | 'performance' | 'promotion' | 'special',
      remarks: formData.remarks,
      status: 'pending',
    });
    
    setIsDialogOpen(false);
    setFormData({
      employee_id: "",
      previous_salary: 0,
      new_salary: 0,
      effective_date: format(new Date(), 'yyyy-MM-dd'),
      revision_type: "annual",
      remarks: ""
    });
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, JSX.Element> = {
      pending: <Badge variant="secondary">Pending</Badge>,
      approved: <Badge className="bg-green-100 text-green-800">Approved</Badge>,
      rejected: <Badge variant="destructive">Rejected</Badge>,
      implemented: <Badge className="bg-blue-100 text-blue-800">Implemented</Badge>,
    };
    return badges[status] || <Badge variant="secondary">{status}</Badge>;
  };

  const filteredRevisions = revisions.filter(rev =>
    rev.employee?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false
  );

  const stats = {
    pending: revisions.filter(r => r.status === 'pending').length,
    thisMonth: revisions.filter(r => {
      const created = new Date(r.created_at);
      const now = new Date();
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length,
    avgIncrement: revisions.length > 0
      ? (revisions.reduce((acc, r) => {
          const inc = r.previous_salary ? ((r.new_salary - r.previous_salary) / r.previous_salary) * 100 : 0;
          return acc + inc;
        }, 0) / revisions.length).toFixed(1)
      : '0',
    totalBudget: revisions.filter(r => r.status === 'approved').reduce((acc, r) => acc + (r.new_salary - r.previous_salary), 0),
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString()}`;
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
        <h3 className="mt-4 font-semibold">Error loading revisions</h3>
        <p className="text-muted-foreground">{error.message}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Salary Revisions</h1>
          <p className="text-muted-foreground">Track salary history and manage increment cycles</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Revision
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Salary Revision</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Employee</Label>
                <Select value={formData.employee_id} onValueChange={(v) => setFormData(p => ({...p, employee_id: v}))}>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Previous Salary</Label>
                  <Input
                    type="number"
                    value={formData.previous_salary || ''}
                    onChange={(e) => setFormData(p => ({...p, previous_salary: Number(e.target.value)}))}
                    placeholder="50000"
                  />
                </div>
                <div>
                  <Label>New Salary</Label>
                  <Input
                    type="number"
                    value={formData.new_salary || ''}
                    onChange={(e) => setFormData(p => ({...p, new_salary: Number(e.target.value)}))}
                    placeholder="55000"
                  />
                </div>
              </div>
              {formData.previous_salary > 0 && formData.new_salary > 0 && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">
                    Increment: <strong>{calculateIncrement(formData.previous_salary, formData.new_salary)}%</strong>
                  </p>
                </div>
              )}
              <div>
                <Label>Effective Date</Label>
                <Input
                  type="date"
                  value={formData.effective_date}
                  onChange={(e) => setFormData(p => ({...p, effective_date: e.target.value}))}
                />
              </div>
              <div>
                <Label>Revision Type</Label>
                <Select value={formData.revision_type} onValueChange={(v) => setFormData(p => ({...p, revision_type: v}))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="annual">Annual Increment</SelectItem>
                    <SelectItem value="promotion">Promotion</SelectItem>
                    <SelectItem value="market">Market Adjustment</SelectItem>
                    <SelectItem value="performance">Performance Based</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Remarks</Label>
                <Textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData(p => ({...p, remarks: e.target.value}))}
                  placeholder="Reason for revision..."
                />
              </div>
              <Button className="w-full" onClick={handleSubmit} disabled={createRevision.isPending}>
                {createRevision.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</> : 'Submit for Approval'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisMonth}</div>
            <p className="text-xs text-muted-foreground">Revisions processed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Increment</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgIncrement}%</div>
            <p className="text-xs text-muted-foreground">This cycle</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Approved Budget</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalBudget)}</div>
            <p className="text-xs text-muted-foreground">Monthly increase</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Revisions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Revisions</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRevisions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileX className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No salary revisions found</p>
              <p className="text-sm">Create your first revision to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Previous</TableHead>
                  <TableHead>New</TableHead>
                  <TableHead>Increment</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Effective Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRevisions.map((rev) => {
                  const increment = rev.previous_salary ? ((rev.new_salary - rev.previous_salary) / rev.previous_salary * 100).toFixed(1) : '0';
                  return (
                    <TableRow key={rev.id}>
                      <TableCell className="font-medium">{rev.employee?.full_name || 'Unknown'}</TableCell>
                      <TableCell>₹{rev.previous_salary.toLocaleString()}</TableCell>
                      <TableCell>₹{rev.new_salary.toLocaleString()}</TableCell>
                      <TableCell className="text-green-600">+{increment}%</TableCell>
                      <TableCell className="capitalize">{rev.revision_type}</TableCell>
                      <TableCell>{format(new Date(rev.effective_date), "MMM dd, yyyy")}</TableCell>
                      <TableCell>{getStatusBadge(rev.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {rev.status === 'pending' && (
                            <>
                              <Button size="sm" variant="outline" onClick={() => updateRevision.mutate({ id: rev.id, status: 'approved' })}>
                                Approve
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => updateRevision.mutate({ id: rev.id, status: 'rejected' })}>
                                Reject
                              </Button>
                            </>
                          )}
                          {rev.status === 'approved' && (
                            <Button size="sm" variant="outline" onClick={() => updateRevision.mutate({ id: rev.id, status: 'implemented' })}>
                              Implement
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
