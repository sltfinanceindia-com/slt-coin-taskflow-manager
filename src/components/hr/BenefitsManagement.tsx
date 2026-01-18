import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { HeartPulse, Shield, Users, FileText, Plus, CheckCircle, Clock, DollarSign } from "lucide-react";
import { format } from "date-fns";

interface Benefit {
  id: string;
  name: string;
  type: string;
  provider: string;
  coverage: string;
  premium: number;
  employer_contribution: number;
  employee_contribution: number;
  valid_until: string;
  dependents: number;
  status: string;
}

export function BenefitsManagement() {
  const [activeTab, setActiveTab] = useState("overview");

  const benefits: Benefit[] = [
    {
      id: "1",
      name: "Group Health Insurance",
      type: "health",
      provider: "ICICI Lombard",
      coverage: "₹5,00,000",
      premium: 15000,
      employer_contribution: 12000,
      employee_contribution: 3000,
      valid_until: "2025-03-31",
      dependents: 3,
      status: "active"
    },
    {
      id: "2",
      name: "Term Life Insurance",
      type: "life",
      provider: "HDFC Life",
      coverage: "₹50,00,000",
      premium: 8000,
      employer_contribution: 8000,
      employee_contribution: 0,
      valid_until: "2025-03-31",
      dependents: 0,
      status: "active"
    },
    {
      id: "3",
      name: "Personal Accident Cover",
      type: "accident",
      provider: "Bajaj Allianz",
      coverage: "₹10,00,000",
      premium: 2500,
      employer_contribution: 2500,
      employee_contribution: 0,
      valid_until: "2025-03-31",
      dependents: 0,
      status: "active"
    },
    {
      id: "4",
      name: "Dental Plan",
      type: "dental",
      provider: "Clove Dental",
      coverage: "₹25,000",
      premium: 3000,
      employer_contribution: 1500,
      employee_contribution: 1500,
      valid_until: "2025-03-31",
      dependents: 2,
      status: "active"
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "health": return <HeartPulse className="h-5 w-5 text-red-500" />;
      case "life": return <Shield className="h-5 w-5 text-blue-500" />;
      case "accident": return <Shield className="h-5 w-5 text-orange-500" />;
      case "dental": return <HeartPulse className="h-5 w-5 text-purple-500" />;
      default: return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const totalEmployerContribution = benefits.reduce((sum, b) => sum + b.employer_contribution, 0);
  const totalEmployeeContribution = benefits.reduce((sum, b) => sum + b.employee_contribution, 0);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Employee Benefits</h1>
          <p className="text-muted-foreground">Track insurance, health benefits, and other perks</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Enroll in Benefit
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Benefits</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{benefits.filter(b => b.status === "active").length}</div>
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
            <CardTitle className="text-sm font-medium">Your Contribution</CardTitle>
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
            <div className="text-2xl font-bold">{benefits.reduce((sum, b) => sum + b.dependents, 0)}</div>
            <p className="text-xs text-muted-foreground">Family members</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">My Benefits</TabsTrigger>
          <TabsTrigger value="claims">Claims</TabsTrigger>
          <TabsTrigger value="dependents">Dependents</TabsTrigger>
          <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {benefits.map((benefit) => (
              <Card key={benefit.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(benefit.type)}
                      <div>
                        <CardTitle className="text-lg">{benefit.name}</CardTitle>
                        <CardDescription>{benefit.provider}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700">Active</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Coverage</p>
                      <p className="font-semibold">{benefit.coverage}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Valid Until</p>
                      <p className="font-semibold">{format(new Date(benefit.valid_until), "MMM dd, yyyy")}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Employer Pays</p>
                      <p className="font-semibold">₹{benefit.employer_contribution.toLocaleString()}/yr</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">You Pay</p>
                      <p className="font-semibold">₹{benefit.employee_contribution.toLocaleString()}/yr</p>
                    </div>
                  </div>
                  {benefit.dependents > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{benefit.dependents} dependents covered</span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">View Details</Button>
                    <Button variant="outline" size="sm" className="flex-1">File Claim</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="claims">
          <Card>
            <CardHeader>
              <CardTitle>Claims History</CardTitle>
              <CardDescription>Track your benefit claims and reimbursements</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Claim ID</TableHead>
                    <TableHead>Benefit</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono">CLM-2024-001</TableCell>
                    <TableCell>Health Insurance</TableCell>
                    <TableCell>Jan 15, 2024</TableCell>
                    <TableCell>₹12,500</TableCell>
                    <TableCell><Badge className="bg-green-500">Approved</Badge></TableCell>
                    <TableCell><Button variant="ghost" size="sm">View</Button></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono">CLM-2024-002</TableCell>
                    <TableCell>Dental Plan</TableCell>
                    <TableCell>Feb 20, 2024</TableCell>
                    <TableCell>₹5,000</TableCell>
                    <TableCell><Badge className="bg-yellow-500">Processing</Badge></TableCell>
                    <TableCell><Button variant="ghost" size="sm">View</Button></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Relationship</TableHead>
                    <TableHead>Date of Birth</TableHead>
                    <TableHead>Benefits</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Jane Doe</TableCell>
                    <TableCell>Spouse</TableCell>
                    <TableCell>May 15, 1990</TableCell>
                    <TableCell>Health, Dental</TableCell>
                    <TableCell><Button variant="ghost" size="sm">Edit</Button></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Alex Doe</TableCell>
                    <TableCell>Child</TableCell>
                    <TableCell>Aug 20, 2015</TableCell>
                    <TableCell>Health, Dental</TableCell>
                    <TableCell><Button variant="ghost" size="sm">Edit</Button></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Add Dependent
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="enrollment">
          <Card>
            <CardHeader>
              <CardTitle>Open Enrollment</CardTitle>
              <CardDescription>Enroll in or modify your benefits during open enrollment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Open Enrollment Closed</h3>
                <p className="text-muted-foreground mt-2">Next enrollment period: January 2025</p>
                <Button className="mt-4" variant="outline">Set Reminder</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
