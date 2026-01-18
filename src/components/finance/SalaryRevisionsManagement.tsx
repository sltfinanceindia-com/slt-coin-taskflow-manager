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
import { Plus, TrendingUp, Search, FileText, Calendar, DollarSign } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface SalaryRevision {
  id: string;
  employee_id: string;
  employee_name: string;
  previous_salary: number;
  new_salary: number;
  increment_percentage: number;
  effective_date: string;
  revision_type: string;
  status: string;
  approved_by?: string;
  remarks?: string;
  created_at: string;
}

export function SalaryRevisionsManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    employee_id: "",
    previous_salary: "",
    new_salary: "",
    effective_date: "",
    revision_type: "annual",
    remarks: ""
  });
  const queryClient = useQueryClient();

  // Mock data for demonstration
  const revisions: SalaryRevision[] = [
    {
      id: "1",
      employee_id: "emp1",
      employee_name: "John Doe",
      previous_salary: 50000,
      new_salary: 55000,
      increment_percentage: 10,
      effective_date: "2024-04-01",
      revision_type: "annual",
      status: "approved",
      approved_by: "HR Manager",
      remarks: "Annual performance review",
      created_at: new Date().toISOString()
    },
    {
      id: "2",
      employee_id: "emp2",
      employee_name: "Jane Smith",
      previous_salary: 60000,
      new_salary: 72000,
      increment_percentage: 20,
      effective_date: "2024-04-01",
      revision_type: "promotion",
      status: "pending",
      remarks: "Promotion to Senior Developer",
      created_at: new Date().toISOString()
    }
  ];

  const calculateIncrement = (prev: number, newSal: number) => {
    if (prev === 0) return 0;
    return ((newSal - prev) / prev * 100).toFixed(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Salary revision submitted for approval");
    setIsDialogOpen(false);
    setFormData({
      employee_id: "",
      previous_salary: "",
      new_salary: "",
      effective_date: "",
      revision_type: "annual",
      remarks: ""
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-500";
      case "pending": return "bg-yellow-500";
      case "rejected": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const filteredRevisions = revisions.filter(rev =>
    rev.employee_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Employee</Label>
                <Select value={formData.employee_id} onValueChange={(v) => setFormData({...formData, employee_id: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="emp1">John Doe</SelectItem>
                    <SelectItem value="emp2">Jane Smith</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Previous Salary</Label>
                  <Input
                    type="number"
                    value={formData.previous_salary}
                    onChange={(e) => setFormData({...formData, previous_salary: e.target.value})}
                    placeholder="50000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>New Salary</Label>
                  <Input
                    type="number"
                    value={formData.new_salary}
                    onChange={(e) => setFormData({...formData, new_salary: e.target.value})}
                    placeholder="55000"
                  />
                </div>
              </div>
              {formData.previous_salary && formData.new_salary && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">
                    Increment: <strong>{calculateIncrement(Number(formData.previous_salary), Number(formData.new_salary))}%</strong>
                  </p>
                </div>
              )}
              <div className="space-y-2">
                <Label>Effective Date</Label>
                <Input
                  type="date"
                  value={formData.effective_date}
                  onChange={(e) => setFormData({...formData, effective_date: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Revision Type</Label>
                <Select value={formData.revision_type} onValueChange={(v) => setFormData({...formData, revision_type: v})}>
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
              <div className="space-y-2">
                <Label>Remarks</Label>
                <Textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                  placeholder="Reason for revision..."
                />
              </div>
              <Button type="submit" className="w-full">Submit for Approval</Button>
            </form>
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
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Revisions processed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Increment</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.5%</div>
            <p className="text-xs text-muted-foreground">This cycle</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹2.5L</div>
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
              {filteredRevisions.map((rev) => (
                <TableRow key={rev.id}>
                  <TableCell className="font-medium">{rev.employee_name}</TableCell>
                  <TableCell>₹{rev.previous_salary.toLocaleString()}</TableCell>
                  <TableCell>₹{rev.new_salary.toLocaleString()}</TableCell>
                  <TableCell className="text-green-600">+{rev.increment_percentage}%</TableCell>
                  <TableCell className="capitalize">{rev.revision_type}</TableCell>
                  <TableCell>{format(new Date(rev.effective_date), "MMM dd, yyyy")}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(rev.status)}>{rev.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">View</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
