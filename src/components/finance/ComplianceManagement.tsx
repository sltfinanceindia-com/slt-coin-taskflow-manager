import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, CheckCircle, AlertTriangle, Clock, FileText, Calendar, Download, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useComplianceItems } from "@/hooks/useComplianceItems";

export function ComplianceManagement() {
  const [activeTab, setActiveTab] = useState("overview");
  const { complianceItems, isLoading, updateStatus } = useComplianceItems();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500";
      case "pending": return "bg-yellow-500";
      case "overdue": return "bg-red-500";
      case "upcoming": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      pf: "Provident Fund",
      esi: "ESI",
      pt: "Professional Tax",
      tds: "TDS",
      lwf: "Labour Welfare Fund"
    };
    return labels[type] || type;
  };

  const stats = {
    completed: complianceItems.filter(c => c.status === "completed").length,
    pending: complianceItems.filter(c => c.status === "pending").length,
    overdue: complianceItems.filter(c => c.status === "overdue").length,
    upcoming: complianceItems.filter(c => c.status === "upcoming").length
  };

  const complianceScore = complianceItems.length > 0 
    ? Math.round((stats.completed / complianceItems.length) * 100)
    : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Statutory Compliance</h1>
          <p className="text-muted-foreground">Manage PF, ESI, PT, and LWF compliance and filings</p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceScore}%</div>
            <Progress value={complianceScore} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Due soon</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground">Requires action</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.upcoming}</div>
            <p className="text-xs text-muted-foreground">Next 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pf">PF</TabsTrigger>
          <TabsTrigger value="esi">ESI</TabsTrigger>
          <TabsTrigger value="pt">Professional Tax</TabsTrigger>
          <TabsTrigger value="calendar">Compliance Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Compliance Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Filed</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complianceItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{getTypeLabel(item.type)}</TableCell>
                      <TableCell>{format(new Date(item.due_date), "MMM dd, yyyy")}</TableCell>
                      <TableCell>{item.amount ? `₹${item.amount.toLocaleString()}` : "-"}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {item.last_filed ? format(new Date(item.last_filed), "MMM dd, yyyy") : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {item.status !== "completed" && (
                            <Button variant="outline" size="sm">File Now</Button>
                          )}
                          <Button variant="ghost" size="sm">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pf">
          <Card>
            <CardHeader>
              <CardTitle>Provident Fund Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Employee Contribution</p>
                      <p className="text-2xl font-bold">₹62,500</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Employer Contribution</p>
                      <p className="text-2xl font-bold">₹62,500</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Total PF Liability</p>
                      <p className="text-2xl font-bold">₹1,25,000</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="esi">
          <Card>
            <CardHeader>
              <CardTitle>ESI Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">ESI contribution details and filings will appear here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pt">
          <Card>
            <CardHeader>
              <CardTitle>Professional Tax</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Professional tax deductions and filings by state.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceItems
                  .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
                  .map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(item.status)}`} />
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{getTypeLabel(item.type)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{format(new Date(item.due_date), "MMM dd, yyyy")}</p>
                        <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
