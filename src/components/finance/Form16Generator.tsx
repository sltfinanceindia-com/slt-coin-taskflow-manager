import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, Download, Search, Mail, Users, CheckCircle, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useForm16, Form16Record } from "@/hooks/useForm16";

export function Form16Generator() {
  const { records, isLoading, generateForm16, sendForm16 } = useForm16();
  const [selectedYear, setSelectedYear] = useState("2023-24");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent": return "bg-green-500";
      case "generated": return "bg-blue-500";
      case "pending": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  const filteredByYear = records.filter(r => r.financial_year === selectedYear);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRecords(filteredByYear.map(r => r.id));
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

  const handleBulkGenerate = async () => {
    const employeeIds = records
      .filter(r => selectedRecords.includes(r.id))
      .map(r => r.employee_id);
    
    try {
      await generateForm16.mutateAsync(employeeIds);
      setSelectedRecords([]);
    } catch (error) {
      console.error('Generate Form 16 error:', error);
    }
  };

  const handleBulkSend = async () => {
    const employeeIds = records
      .filter(r => selectedRecords.includes(r.id))
      .map(r => r.employee_id);
    
    try {
      await sendForm16.mutateAsync(employeeIds);
      setSelectedRecords([]);
    } catch (error) {
      console.error('Send Form 16 error:', error);
    }
  };

  const filteredRecords = filteredByYear.filter(r =>
    (r.employee?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.employee?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: filteredByYear.length,
    generated: filteredByYear.filter(r => r.status === "generated" || r.status === "sent").length,
    sent: filteredByYear.filter(r => r.status === "sent").length,
    pending: filteredByYear.filter(r => r.status === "pending").length
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

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
            <Button 
              variant="outline" 
              onClick={handleBulkGenerate}
              disabled={generateForm16.isPending}
            >
              {generateForm16.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <FileText className="mr-2 h-4 w-4" />
              Generate ({selectedRecords.length})
            </Button>
            <Button 
              onClick={handleBulkSend}
              disabled={sendForm16.isPending}
            >
              {sendForm16.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
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
          {filteredRecords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No Form 16 records found for {selectedYear}</p>
              <p className="text-sm">Records will appear here after payroll processing</p>
            </div>
          ) : (
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedRecords.length === filteredRecords.length && filteredRecords.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Employee</TableHead>
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
                      <p className="font-medium">{record.employee?.full_name || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">{record.employee?.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>₹{(record.gross_salary || 0).toLocaleString()}</TableCell>
                  <TableCell>₹{(record.total_deductions || 0).toLocaleString()}</TableCell>
                  <TableCell>₹{(record.taxable_income || 0).toLocaleString()}</TableCell>
                  <TableCell>₹{(record.tax_paid || 0).toLocaleString()}</TableCell>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
