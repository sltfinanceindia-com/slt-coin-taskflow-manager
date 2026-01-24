import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Coins, Search, Calculator, Users, Clock, CheckCircle, DollarSign, Loader2, FileX, AlertCircle } from "lucide-react";
import { format, differenceInYears, differenceInMonths } from "date-fns";
import { useGratuityRecords } from "@/hooks/useGratuityRecords";

export function GratuityManagement() {
  const { records, isLoading, error } = useGratuityRecords();
  const [searchTerm, setSearchTerm] = useState("");
  const [calculatorData, setCalculatorData] = useState({
    basicSalary: "",
    yearsOfService: "",
    monthsOfService: ""
  });
  const [calculatedGratuity, setCalculatedGratuity] = useState<number | null>(null);

  const calculateGratuity = () => {
    const basic = parseFloat(calculatorData.basicSalary);
    const years = parseFloat(calculatorData.yearsOfService);
    const months = parseFloat(calculatorData.monthsOfService);
    
    if (isNaN(basic) || isNaN(years)) {
      setCalculatedGratuity(null);
      return;
    }

    // Gratuity Formula: (15 * Last drawn salary * Years of service) / 26
    const totalYears = years + (months || 0) / 12;
    const gratuity = Math.round((15 * basic * totalYears) / 26);
    setCalculatedGratuity(gratuity);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "eligible": return "bg-green-500";
      case "not_eligible": return "bg-gray-500";
      case "nearing_eligibility": return "bg-yellow-500";
      case "paid": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  const eligibleCount = records.filter(r => r.status === 'eligible' || r.status === 'paid').length;
  const nearingCount = records.filter(r => r.status === 'nearing_eligibility').length;
  const totalProvision = records.reduce((sum, r) => sum + (r.gratuity_amount || 0), 0);

  const filteredRecords = records.filter(r =>
    (r.employee?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <h3 className="mt-4 font-semibold">Error loading gratuity records</h3>
        <p className="text-muted-foreground">{error.message}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gratuity Management</h1>
          <p className="text-muted-foreground">Calculate and track gratuity based on tenure</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Calculator className="mr-2 h-4 w-4" />
              Gratuity Calculator
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Gratuity Calculator</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Last Drawn Basic Salary (₹)</Label>
                <Input
                  type="number"
                  value={calculatorData.basicSalary}
                  onChange={(e) => setCalculatorData({...calculatorData, basicSalary: e.target.value})}
                  placeholder="e.g., 50000"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Years of Service</Label>
                  <Input
                    type="number"
                    value={calculatorData.yearsOfService}
                    onChange={(e) => setCalculatorData({...calculatorData, yearsOfService: e.target.value})}
                    placeholder="e.g., 5"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Months</Label>
                  <Input
                    type="number"
                    value={calculatorData.monthsOfService}
                    onChange={(e) => setCalculatorData({...calculatorData, monthsOfService: e.target.value})}
                    placeholder="e.g., 6"
                  />
                </div>
              </div>
              <Button onClick={calculateGratuity} className="w-full">Calculate</Button>
              
              {calculatedGratuity !== null && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm text-muted-foreground">Estimated Gratuity Amount</p>
                  <p className="text-2xl font-bold text-green-600">₹{calculatedGratuity.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Formula: (15 × Basic × Years) ÷ 26
                  </p>
                </div>
              )}

              <div className="p-4 bg-muted rounded-lg text-sm">
                <p className="font-medium mb-2">Eligibility Criteria:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Minimum 5 years of continuous service</li>
                  <li>Applicable under Payment of Gratuity Act, 1972</li>
                  <li>Maximum limit: ₹20,00,000</li>
                </ul>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{records.length}</div>
            <p className="text-xs text-muted-foreground">Active employees</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Eligible</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{eligibleCount}</div>
            <p className="text-xs text-muted-foreground">5+ years service</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Approaching</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{nearingCount}</div>
            <p className="text-xs text-muted-foreground">Within 1 year</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Provision</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(totalProvision / 100000).toFixed(1)}L</div>
            <p className="text-xs text-muted-foreground">Gratuity liability</p>
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

      {/* Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Gratuity Records</CardTitle>
          <CardDescription>Gratuity eligibility and amounts for all employees</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRecords.length === 0 ? (
            <div className="text-center py-8">
              <FileX className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 font-semibold">No gratuity records found</h3>
              <p className="text-muted-foreground">Gratuity records will appear here</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Joining Date</TableHead>
                  <TableHead>Service Period</TableHead>
                  <TableHead>Last Basic</TableHead>
                  <TableHead>Gratuity Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{record.employee?.full_name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">{record.employee?.department}</p>
                      </div>
                    </TableCell>
                    <TableCell>{format(new Date(record.joining_date), "MMM dd, yyyy")}</TableCell>
                    <TableCell>
                      {record.years_of_service || 0} years
                    </TableCell>
                    <TableCell>₹{(record.last_drawn_basic || 0).toLocaleString()}</TableCell>
                    <TableCell className="font-medium">
                      {record.gratuity_amount ? `₹${record.gratuity_amount.toLocaleString()}` : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(record.status)}>
                        {record.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Gratuity Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Calculation Formula</h4>
              <p className="text-sm text-muted-foreground">
                Gratuity = (15 × Last Drawn Salary × Years of Service) ÷ 26
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                * Last drawn salary = Basic + DA
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Tax Treatment</h4>
              <p className="text-sm text-muted-foreground">
                Gratuity up to ₹20 lakhs is exempt from income tax for employees covered under the Payment of Gratuity Act.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
