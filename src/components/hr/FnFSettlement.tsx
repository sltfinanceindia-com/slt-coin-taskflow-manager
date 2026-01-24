import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { FileBox, Search, CheckCircle, Clock, DollarSign, Loader2, FileX, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { useFnFSettlements } from "@/hooks/useFnFSettlements";

export function FnFSettlement() {
  const { settlements, isLoading, error, updateSettlement } = useFnFSettlements();
  const [activeTab, setActiveTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500";
      case "processing": return "bg-blue-500";
      case "pending": return "bg-yellow-500";
      case "disputed": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getClearanceProgress = (settlement: typeof settlements[0]) => {
    const items = [
      settlement.clearance_hr,
      settlement.clearance_it,
      settlement.clearance_finance,
      settlement.clearance_admin,
      settlement.clearance_manager,
    ];
    const completed = items.filter(Boolean).length;
    return Math.round((completed / items.length) * 100);
  };

  const filteredSettlements = settlements.filter(s => {
    const matchesSearch = (s.employee?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || s.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const pendingCount = settlements.filter(s => s.status === 'pending').length;
  const processingCount = settlements.filter(s => s.status === 'processing').length;
  const completedCount = settlements.filter(s => s.status === 'completed').length;
  const totalPending = settlements.filter(s => s.status !== 'completed').reduce((sum, s) => sum + (s.net_payable || 0), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center border-destructive">
        <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
        <h3 className="mt-4 font-semibold">Error loading F&F settlements</h3>
        <p className="text-muted-foreground">{error.message}</p>
      </Card>
    );
  }

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
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting clearance</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Processing</CardTitle>
            <FileBox className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{processingCount}</div>
            <p className="text-xs text-muted-foreground">Being calculated</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Payout</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(totalPending / 100000).toFixed(1)}L</div>
            <p className="text-xs text-muted-foreground">Total amount</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCount}</div>
            <p className="text-xs text-muted-foreground">This quarter</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
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

        <TabsContent value={activeTab} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Settlements - {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredSettlements.length === 0 ? (
                <div className="text-center py-8">
                  <FileBox className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">No {activeTab} settlements found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Last Working Day</TableHead>
                      <TableHead>Notice Period</TableHead>
                      <TableHead>Clearance</TableHead>
                      <TableHead>Net Payable</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSettlements.map((settlement) => (
                      <TableRow key={settlement.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{settlement.employee?.full_name || 'Unknown'}</p>
                            <p className="text-xs text-muted-foreground">{settlement.employee?.department}</p>
                          </div>
                        </TableCell>
                        <TableCell>{format(new Date(settlement.last_working_day), "MMM dd, yyyy")}</TableCell>
                        <TableCell>
                          {settlement.notice_served_days}/{settlement.notice_period_days} days
                          {(settlement.notice_served_days || 0) < (settlement.notice_period_days || 0) && (
                            <Badge variant="outline" className="ml-2 text-xs">Buyout</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="w-24">
                            <Progress value={getClearanceProgress(settlement)} className="h-2" />
                            <p className="text-xs text-muted-foreground mt-1">{getClearanceProgress(settlement)}% complete</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">₹{(settlement.net_payable || 0).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(settlement.status)}>
                            {settlement.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">View Details</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>F&F Settlement - {settlement.employee?.full_name}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-6">
                                {/* Settlement Breakdown */}
                                <div className="space-y-4">
                                  <h4 className="font-semibold">Settlement Breakdown</h4>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="flex justify-between p-3 bg-muted rounded-lg">
                                      <span>Basic Salary</span>
                                      <span className="font-medium">₹{(settlement.basic_salary || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between p-3 bg-muted rounded-lg">
                                      <span>Leave Encashment</span>
                                      <span className="font-medium">₹{(settlement.leave_encashment || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between p-3 bg-muted rounded-lg">
                                      <span>Gratuity</span>
                                      <span className="font-medium">₹{(settlement.gratuity || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                      <span>Deductions</span>
                                      <span className="font-medium text-red-600">-₹{((settlement.notice_recovery || 0) + (settlement.loan_recovery || 0) + (settlement.other_deductions || 0)).toLocaleString()}</span>
                                    </div>
                                  </div>
                                  <div className="flex justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                    <span className="font-semibold">Net Payable</span>
                                    <span className="font-bold text-green-600 text-xl">₹{(settlement.net_payable || 0).toLocaleString()}</span>
                                  </div>
                                </div>

                                {/* Clearance Checklist */}
                                <div className="space-y-4">
                                  <h4 className="font-semibold">Clearance Checklist</h4>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="flex items-center gap-2 p-2 border rounded">
                                      <Checkbox checked={settlement.clearance_hr || false} disabled />
                                      <div>
                                        <p className="text-sm">HR Clearance</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 p-2 border rounded">
                                      <Checkbox checked={settlement.clearance_it || false} disabled />
                                      <div>
                                        <p className="text-sm">IT Clearance</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 p-2 border rounded">
                                      <Checkbox checked={settlement.clearance_finance || false} disabled />
                                      <div>
                                        <p className="text-sm">Finance Clearance</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 p-2 border rounded">
                                      <Checkbox checked={settlement.clearance_admin || false} disabled />
                                      <div>
                                        <p className="text-sm">Admin Clearance</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 p-2 border rounded">
                                      <Checkbox checked={settlement.clearance_manager || false} disabled />
                                      <div>
                                        <p className="text-sm">Manager Sign-off</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex gap-2">
                                  {settlement.status !== 'completed' && (
                                    <Button 
                                      className="flex-1"
                                      onClick={() => updateSettlement.mutate({ id: settlement.id, status: 'completed' })}
                                      disabled={updateSettlement.isPending}
                                    >
                                      {updateSettlement.isPending ? 'Processing...' : 'Complete F&F'}
                                    </Button>
                                  )}
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
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
