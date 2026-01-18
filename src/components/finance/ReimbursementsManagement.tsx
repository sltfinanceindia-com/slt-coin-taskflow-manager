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
import { Plus, Receipt, Search, Upload, DollarSign, Clock, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Reimbursement {
  id: string;
  employee_name: string;
  category: string;
  amount: number;
  submitted_date: string;
  status: string;
  description: string;
  receipt_url?: string;
}

export function ReimbursementsManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    category: "",
    amount: "",
    description: "",
    receipt: null as File | null
  });

  const reimbursements: Reimbursement[] = [
    {
      id: "1",
      employee_name: "John Doe",
      category: "medical",
      amount: 5000,
      submitted_date: "2024-01-15",
      status: "approved",
      description: "Doctor consultation and medicines"
    },
    {
      id: "2",
      employee_name: "Jane Smith",
      category: "travel",
      amount: 12000,
      submitted_date: "2024-01-18",
      status: "pending",
      description: "Client visit travel expenses"
    },
    {
      id: "3",
      employee_name: "Mike Johnson",
      category: "fuel",
      amount: 3500,
      submitted_date: "2024-01-20",
      status: "processing",
      description: "Monthly fuel allowance"
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Reimbursement request submitted successfully");
    setIsDialogOpen(false);
    setFormData({ category: "", amount: "", description: "", receipt: null });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-500";
      case "pending": return "bg-yellow-500";
      case "processing": return "bg-blue-500";
      case "rejected": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      medical: "Medical",
      travel: "Travel",
      fuel: "Fuel",
      mobile: "Mobile/Internet",
      food: "Food",
      other: "Other"
    };
    return labels[category] || category;
  };

  const filteredReimbursements = reimbursements.filter(r =>
    r.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reimbursements</h1>
          <p className="text-muted-foreground">Handle medical, travel, and expense reimbursements</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Claim
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Submit Reimbursement Claim</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medical">Medical</SelectItem>
                    <SelectItem value="travel">Travel</SelectItem>
                    <SelectItem value="fuel">Fuel</SelectItem>
                    <SelectItem value="mobile">Mobile/Internet</SelectItem>
                    <SelectItem value="food">Food</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Amount (₹)</Label>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  placeholder="Enter amount"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe the expense..."
                />
              </div>
              <div className="space-y-2">
                <Label>Upload Receipt</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mt-2">
                    Click or drag to upload receipt
                  </p>
                  <Input
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf"
                    onChange={(e) => setFormData({...formData, receipt: e.target.files?.[0] || null})}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">Submit Claim</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Claims</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹45,000</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹12,500</div>
            <p className="text-xs text-muted-foreground">In pipeline</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Your Claims</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹8,000</div>
            <p className="text-xs text-muted-foreground">Pending payout</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search claims..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Claims Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reimbursement Claims</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReimbursements.map((claim) => (
                <TableRow key={claim.id}>
                  <TableCell className="font-medium">{claim.employee_name}</TableCell>
                  <TableCell>{getCategoryLabel(claim.category)}</TableCell>
                  <TableCell>₹{claim.amount.toLocaleString()}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{claim.description}</TableCell>
                  <TableCell>{format(new Date(claim.submitted_date), "MMM dd, yyyy")}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(claim.status)}>{claim.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">View</Button>
                      {claim.status === "pending" && (
                        <>
                          <Button variant="ghost" size="sm" className="text-green-600">Approve</Button>
                          <Button variant="ghost" size="sm" className="text-red-600">Reject</Button>
                        </>
                      )}
                    </div>
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
