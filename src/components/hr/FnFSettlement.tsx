import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { FileBox, Search, CheckCircle, Clock, AlertTriangle, DollarSign, Calendar, FileText } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface FnFRecord {
  id: string;
  employee_name: string;
  employee_id: string;
  department: string;
  resignation_date: string;
  last_working_day: string;
  notice_period_days: number;
  notice_served: number;
  pending_salary: number;
  leave_encashment: number;
  gratuity: number;
  deductions: number;
  net_payable: number;
  status: string;
  clearance_progress: number;
}

export function FnFSettlement() {
  const [activeTab, setActiveTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const records: FnFRecord[] = [
    {
      id: "1",
      employee_name: "John Doe",
      employee_id: "EMP001",
      department: "Engineering",
      resignation_date: "2024-01-01",
      last_working_day: "2024-01-31",
      notice_period_days: 30,
      notice_served: 30,
      pending_salary: 85000,
      leave_encashment: 42500,
      gratuity: 125000,
      deductions: 15000,
      net_payable: 237500,
      status: "processing",
      clearance_progress: 75
    },
    {
      id: "2",
      employee_name: "Jane Smith",
      employee_id: "EMP002",
      department: "Design",
      resignation_date: "2024-01-15",
      last_working_day: "2024-02-14",
      notice_period_days: 30,
      notice_served: 20,
      pending_salary: 65000,
      leave_encashment: 32500,
      gratuity: 0,
      deductions: 32500,
      net_payable: 65000,
      status: "clearance_pending",
      clearance_progress: 40
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500";
      case "processing": return "bg-blue-500";
      case "clearance_pending": return "bg-yellow-500";
      case "on_hold": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const clearanceItems = [
    { id: "1", label: "IT Asset Return", department: "IT", completed: true },
    { id: "2", label: "ID Card Return", department: "Admin", completed: true },
    { id: "3", label: "Access Revocation", department: "IT", completed: true },
    { id: "4", label: "Library Books Return", department: "Admin", completed: false },
    { id: "5", label: "Finance Clearance", department: "Finance", completed: false },
    { id: "6", label: "Manager Sign-off", department: "HR", completed: true },
    { id: "7", label: "Exit Interview", department: "HR", completed: false },
    { id: "8", label: "Knowledge Transfer", department: "Department", completed: true }
  ];

  const filteredRecords = records.filter(r =>
    r.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Full & Final Settlement</h1>
          <p className="text-muted-foreground">Calculate and process exit clearance and final payments</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending F&F</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Awaiting clearance</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Processing</CardTitle>
            <FileBox className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Being calculated</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Payout</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹4.5L</div>
            <p className="text-xs text-muted-foreground">Total amount</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">This quarter</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Settlements</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Last Working Day</TableHead>
                    <TableHead>Notice Period</TableHead>
                    <TableHead>Clearance</TableHead>
                    <TableHead>Estimated Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{record.employee_name}</p>
                          <p className="text-xs text-muted-foreground">{record.employee_id} • {record.department}</p>
                        </div>
                      </TableCell>
                      <TableCell>{format(new Date(record.last_working_day), "MMM dd, yyyy")}</TableCell>
                      <TableCell>
                        {record.notice_served}/{record.notice_period_days} days
                        {record.notice_served < record.notice_period_days && (
                          <Badge variant="outline" className="ml-2 text-xs">Buyout</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="w-24">
                          <Progress value={record.clearance_progress} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">{record.clearance_progress}% complete</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">₹{record.net_payable.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(record.status)}>
                          {record.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">View Details</Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>F&F Settlement - {record.employee_name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6">
                              {/* Settlement Breakdown */}
                              <div className="space-y-4">
                                <h4 className="font-semibold">Settlement Breakdown</h4>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="flex justify-between p-3 bg-muted rounded-lg">
                                    <span>Pending Salary</span>
                                    <span className="font-medium">₹{record.pending_salary.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between p-3 bg-muted rounded-lg">
                                    <span>Leave Encashment</span>
                                    <span className="font-medium">₹{record.leave_encashment.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between p-3 bg-muted rounded-lg">
                                    <span>Gratuity</span>
                                    <span className="font-medium">₹{record.gratuity.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between p-3 bg-red-50 rounded-lg">
                                    <span>Deductions</span>
                                    <span className="font-medium text-red-600">-₹{record.deductions.toLocaleString()}</span>
                                  </div>
                                </div>
                                <div className="flex justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                                  <span className="font-semibold">Net Payable</span>
                                  <span className="font-bold text-green-600 text-xl">₹{record.net_payable.toLocaleString()}</span>
                                </div>
                              </div>

                              {/* Clearance Checklist */}
                              <div className="space-y-4">
                                <h4 className="font-semibold">Clearance Checklist</h4>
                                <div className="grid grid-cols-2 gap-2">
                                  {clearanceItems.map((item) => (
                                    <div key={item.id} className="flex items-center gap-2 p-2 border rounded">
                                      <Checkbox checked={item.completed} disabled />
                                      <div>
                                        <p className="text-sm">{item.label}</p>
                                        <p className="text-xs text-muted-foreground">{item.department}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <Button className="flex-1">Process F&F</Button>
                                <Button variant="outline">Generate Letter</Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="processing">
          <Card>
            <CardContent className="py-8 text-center">
              <FileBox className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">Settlements being processed will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardContent className="py-8 text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <p className="mt-4 text-muted-foreground">Completed settlements will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
