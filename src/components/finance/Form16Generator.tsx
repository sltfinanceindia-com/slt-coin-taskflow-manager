import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, Download, Search, Mail, Users, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";

interface Form16Record {
  id: string;
  employee_name: string;
  employee_id: string;
  pan: string;
  financial_year: string;
  gross_salary: number;
  total_deductions: number;
  taxable_income: number;
  tax_paid: number;
  status: string;
  generated_date?: string;
  sent_date?: string;
}

export function Form16Generator() {
  const [selectedYear, setSelectedYear] = useState("2023-24");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);

  const records: Form16Record[] = [
    {
      id: "1",
      employee_name: "John Doe",
      employee_id: "EMP001",
      pan: "ABCDE1234F",
      financial_year: "2023-24",
      gross_salary: 1200000,
      total_deductions: 250000,
      taxable_income: 950000,
      tax_paid: 95000,
      status: "generated",
      generated_date: "2024-06-01"
    },
    {
      id: "2",
      employee_name: "Jane Smith",
      employee_id: "EMP002",
      pan: "FGHIJ5678K",
      financial_year: "2023-24",
      gross_salary: 1500000,
      total_deductions: 300000,
      taxable_income: 1200000,
      tax_paid: 145000,
      status: "sent",
      generated_date: "2024-06-01",
      sent_date: "2024-06-05"
    },
    {
      id: "3",
      employee_name: "Mike Johnson",
      employee_id: "EMP003",
      pan: "LMNOP9012Q",
      financial_year: "2023-24",
      gross_salary: 800000,
      total_deductions: 200000,
      taxable_income: 600000,
      tax_paid: 35000,
      status: "pending"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent": return "bg-green-500";
      case "generated": return "bg-blue-500";
      case "pending": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRecords(records.map(r => r.id));
    } else {
      setSelectedRecords([]);
    }
  };

  const handleSelectRecord = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedRecords([...selectedRecords, id]);
    } else {
      setSelectedRecords(selectedRecords.filter(r => r !== id));
    }
  };

  const handleBulkGenerate = () => {
    toast.success(`Generating Form 16 for ${selectedRecords.length} employees`);
  };

  const handleBulkSend = () => {
    toast.success(`Sending Form 16 to ${selectedRecords.length} employees`);
  };

  const filteredRecords = records.filter(r =>
    r.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.pan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: records.length,
    generated: records.filter(r => r.status === "generated" || r.status === "sent").length,
    sent: records.filter(r => r.status === "sent").length,
    pending: records.filter(r => r.status === "pending").length
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Form 16 Generator</h1>
          <p className="text-muted-foreground">Generate annual tax statements for employees</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2023-24">FY 2023-24</SelectItem>
              <SelectItem value="2022-23">FY 2022-23</SelectItem>
              <SelectItem value="2021-22">FY 2021-22</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">For {selectedYear}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Generated</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.generated}</div>
            <p className="text-xs text-muted-foreground">Forms ready</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sent</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.sent}</div>
            <p className="text-xs text-muted-foreground">Delivered to employees</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting generation</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, ID, or PAN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {selectedRecords.length > 0 && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleBulkGenerate}>
              <FileText className="mr-2 h-4 w-4" />
              Generate ({selectedRecords.length})
            </Button>
            <Button onClick={handleBulkSend}>
              <Mail className="mr-2 h-4 w-4" />
              Send ({selectedRecords.length})
            </Button>
          </div>
        )}
      </div>

      {/* Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Tax Records - {selectedYear}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedRecords.length === records.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>PAN</TableHead>
                <TableHead>Gross Salary</TableHead>
                <TableHead>Deductions</TableHead>
                <TableHead>Taxable Income</TableHead>
                <TableHead>Tax Paid</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedRecords.includes(record.id)}
                      onCheckedChange={(checked) => handleSelectRecord(record.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{record.employee_name}</p>
                      <p className="text-xs text-muted-foreground">{record.employee_id}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">{record.pan}</TableCell>
                  <TableCell>₹{record.gross_salary.toLocaleString()}</TableCell>
                  <TableCell>₹{record.total_deductions.toLocaleString()}</TableCell>
                  <TableCell>₹{record.taxable_income.toLocaleString()}</TableCell>
                  <TableCell>₹{record.tax_paid.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(record.status)}>{record.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {record.status === "pending" ? (
                        <Button variant="outline" size="sm">Generate</Button>
                      ) : (
                        <>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                          {record.status !== "sent" && (
                            <Button variant="ghost" size="sm">
                              <Mail className="h-4 w-4" />
                            </Button>
                          )}
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
