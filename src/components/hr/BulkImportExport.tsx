/**
 * Bulk Import/Export Component
 * Handle bulk operations for employee data
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  FileText,
  Users,
  Clock,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImportHistory {
  id: string;
  fileName: string;
  type: 'employees' | 'attendance' | 'leaves' | 'salaries';
  status: 'completed' | 'failed' | 'processing';
  recordsProcessed: number;
  recordsFailed: number;
  createdAt: string;
}

const mockHistory: ImportHistory[] = [
  {
    id: '1',
    fileName: 'employees_jan2025.xlsx',
    type: 'employees',
    status: 'completed',
    recordsProcessed: 150,
    recordsFailed: 2,
    createdAt: '2025-01-15T10:30:00',
  },
  {
    id: '2',
    fileName: 'attendance_dec2024.csv',
    type: 'attendance',
    status: 'completed',
    recordsProcessed: 3200,
    recordsFailed: 0,
    createdAt: '2025-01-02T09:15:00',
  },
];

export function BulkImportExport() {
  const [activeTab, setActiveTab] = useState('import');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importType, setImportType] = useState('employees');
  const [exportType, setExportType] = useState('employees');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast({
        title: 'No File Selected',
        description: 'Please select a file to import.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    // Simulate import progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          toast({
            title: 'Import Complete',
            description: `Successfully imported ${selectedFile.name}`,
          });
          setSelectedFile(null);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const handleExport = () => {
    setIsProcessing(true);
    
    setTimeout(() => {
      setIsProcessing(false);
      toast({
        title: 'Export Complete',
        description: `${exportType}_export_${new Date().toISOString().split('T')[0]}.xlsx has been downloaded.`,
      });
    }, 2000);
  };

  const downloadTemplate = () => {
    toast({
      title: 'Template Downloaded',
      description: `${importType}_template.xlsx has been downloaded.`,
    });
  };

  const getStatusBadge = (status: ImportHistory['status']) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-500/10 text-green-600 gap-1">
            <CheckCircle className="h-3 w-3" />
            Completed
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            Failed
          </Badge>
        );
      case 'processing':
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            Processing
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Bulk Import & Export</h2>
        <p className="text-muted-foreground">
          Import or export data in bulk using Excel or CSV files
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="import" className="gap-2">
            <Upload className="h-4 w-4" />
            Import
          </TabsTrigger>
          <TabsTrigger value="export" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <FileText className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Import Data</CardTitle>
              <CardDescription>
                Upload Excel (.xlsx) or CSV files to import data in bulk
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Data Type</Label>
                <Select value={importType} onValueChange={setImportType}>
                  <SelectTrigger className="max-w-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employees">Employees</SelectItem>
                    <SelectItem value="attendance">Attendance Records</SelectItem>
                    <SelectItem value="leaves">Leave Balances</SelectItem>
                    <SelectItem value="salaries">Salary Structures</SelectItem>
                    <SelectItem value="departments">Departments</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Upload File</Label>
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Drag and drop your file here, or click to browse
                  </p>
                  <Input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileSelect}
                    className="max-w-xs mx-auto"
                  />
                  {selectedFile && (
                    <p className="text-sm font-medium mt-4">
                      Selected: {selectedFile.name}
                    </p>
                  )}
                </div>
              </div>

              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Importing...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}

              <div className="flex gap-4">
                <Button onClick={handleImport} disabled={!selectedFile || isProcessing}>
                  <Upload className="h-4 w-4 mr-2" />
                  Start Import
                </Button>
                <Button variant="outline" onClick={downloadTemplate}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Import Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  Use the provided template to ensure correct column mapping
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  Dates should be in YYYY-MM-DD format
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  Required fields: Employee ID, Name, Email (for employee imports)
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  Maximum file size: 10MB
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Export Data</CardTitle>
              <CardDescription>
                Download data in Excel or CSV format
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Data Type</Label>
                <Select value={exportType} onValueChange={setExportType}>
                  <SelectTrigger className="max-w-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employees">All Employees</SelectItem>
                    <SelectItem value="attendance">Attendance (This Month)</SelectItem>
                    <SelectItem value="leaves">Leave Balances</SelectItem>
                    <SelectItem value="payroll">Payroll Summary</SelectItem>
                    <SelectItem value="departments">Departments</SelectItem>
                    <SelectItem value="teams">Teams</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleExport} disabled={isProcessing}>
                <Download className="h-4 w-4 mr-2" />
                {isProcessing ? 'Exporting...' : 'Export to Excel'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Import History</CardTitle>
              <CardDescription>
                View recent import operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{item.fileName}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(item.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {item.recordsProcessed} records
                        </p>
                        {item.recordsFailed > 0 && (
                          <p className="text-sm text-destructive">
                            {item.recordsFailed} failed
                          </p>
                        )}
                      </div>
                      {getStatusBadge(item.status)}
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
