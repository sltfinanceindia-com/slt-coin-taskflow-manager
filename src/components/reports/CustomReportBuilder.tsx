import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText, 
  Plus, 
  Save, 
  Play, 
  Download, 
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  Table,
  Filter,
  SortAsc,
  Columns,
  Clock,
  Mail,
  Trash2,
  Copy,
  Eye
} from "lucide-react";
import { toast } from "sonner";

interface ReportColumn {
  id: string;
  name: string;
  field: string;
  visible: boolean;
}

interface SavedReport {
  id: string;
  name: string;
  type: string;
  lastRun: string;
  scheduled: boolean;
}

const availableColumns: ReportColumn[] = [
  { id: "1", name: "Employee Name", field: "full_name", visible: true },
  { id: "2", name: "Department", field: "department", visible: true },
  { id: "3", name: "Tasks Completed", field: "tasks_completed", visible: true },
  { id: "4", name: "Total Coins", field: "total_coins", visible: true },
  { id: "5", name: "Attendance Rate", field: "attendance_rate", visible: false },
  { id: "6", name: "Training Progress", field: "training_progress", visible: false },
  { id: "7", name: "Performance Score", field: "performance_score", visible: false },
  { id: "8", name: "Join Date", field: "created_at", visible: false },
];

const savedReports: SavedReport[] = [
  { id: "1", name: "Monthly Performance Report", type: "performance", lastRun: "2024-01-15", scheduled: true },
  { id: "2", name: "Task Completion Analysis", type: "tasks", lastRun: "2024-01-14", scheduled: false },
  { id: "3", name: "Attendance Summary", type: "attendance", lastRun: "2024-01-13", scheduled: true },
  { id: "4", name: "Training Compliance Report", type: "training", lastRun: "2024-01-12", scheduled: false },
];

export function CustomReportBuilder() {
  const [reportName, setReportName] = useState("");
  const [reportType, setReportType] = useState("tasks");
  const [columns, setColumns] = useState<ReportColumn[]>(availableColumns);
  const [chartType, setChartType] = useState("bar");
  const [dateRange, setDateRange] = useState("last_30_days");
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleFrequency, setScheduleFrequency] = useState("weekly");

  const toggleColumn = (id: string) => {
    setColumns(prev => 
      prev.map(col => 
        col.id === id ? { ...col, visible: !col.visible } : col
      )
    );
  };

  const handleSaveReport = () => {
    if (!reportName.trim()) {
      toast.error("Please enter a report name");
      return;
    }
    toast.success("Report saved successfully!");
  };

  const handleRunReport = () => {
    toast.success("Report is being generated...");
  };

  const handleExport = (format: string) => {
    toast.success(`Exporting report as ${format.toUpperCase()}...`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Custom Report Builder</h2>
          <p className="text-muted-foreground">Create, customize, and schedule reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport("pdf")}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => handleExport("excel")}>
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      <Tabs defaultValue="builder" className="space-y-4">
        <TabsList>
          <TabsTrigger value="builder">
            <Plus className="h-4 w-4 mr-2" />
            Build Report
          </TabsTrigger>
          <TabsTrigger value="saved">
            <FileText className="h-4 w-4 mr-2" />
            Saved Reports
          </TabsTrigger>
          <TabsTrigger value="scheduled">
            <Clock className="h-4 w-4 mr-2" />
            Scheduled Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Report Configuration */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Report Configuration</CardTitle>
                <CardDescription>Define your report parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="reportName">Report Name</Label>
                    <Input
                      id="reportName"
                      placeholder="Enter report name"
                      value={reportName}
                      onChange={(e) => setReportName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Report Type</Label>
                    <Select value={reportType} onValueChange={setReportType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tasks">Task Analysis</SelectItem>
                        <SelectItem value="performance">Performance Report</SelectItem>
                        <SelectItem value="attendance">Attendance Report</SelectItem>
                        <SelectItem value="training">Training Report</SelectItem>
                        <SelectItem value="coins">Coins & Rewards</SelectItem>
                        <SelectItem value="custom">Custom Query</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Date Range</Label>
                    <Select value={dateRange} onValueChange={setDateRange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                        <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                        <SelectItem value="last_quarter">Last Quarter</SelectItem>
                        <SelectItem value="year_to_date">Year to Date</SelectItem>
                        <SelectItem value="custom">Custom Range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Chart Type</Label>
                    <Select value={chartType} onValueChange={setChartType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bar">
                          <div className="flex items-center">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Bar Chart
                          </div>
                        </SelectItem>
                        <SelectItem value="pie">
                          <div className="flex items-center">
                            <PieChart className="h-4 w-4 mr-2" />
                            Pie Chart
                          </div>
                        </SelectItem>
                        <SelectItem value="line">
                          <div className="flex items-center">
                            <LineChart className="h-4 w-4 mr-2" />
                            Line Chart
                          </div>
                        </SelectItem>
                        <SelectItem value="table">
                          <div className="flex items-center">
                            <Table className="h-4 w-4 mr-2" />
                            Table Only
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Column Selection */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Columns className="h-4 w-4" />
                    Select Columns
                  </Label>
                  <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
                    {columns.map((column) => (
                      <div key={column.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={column.id}
                          checked={column.visible}
                          onCheckedChange={() => toggleColumn(column.id)}
                        />
                        <label
                          htmlFor={column.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {column.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Scheduling */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="schedule"
                      checked={isScheduled}
                      onCheckedChange={(checked) => setIsScheduled(checked as boolean)}
                    />
                    <label htmlFor="schedule" className="text-sm font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Schedule automatic email delivery
                    </label>
                  </div>
                  
                  {isScheduled && (
                    <div className="ml-6 space-y-2">
                      <Label>Frequency</Label>
                      <Select value={scheduleFrequency} onValueChange={setScheduleFrequency}>
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleRunReport} className="bg-primary">
                    <Play className="h-4 w-4 mr-2" />
                    Run Report
                  </Button>
                  <Button variant="outline" onClick={handleSaveReport}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Report
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Preview Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    {chartType === "bar" && <BarChart3 className="h-12 w-12 text-muted-foreground" />}
                    {chartType === "pie" && <PieChart className="h-12 w-12 text-muted-foreground" />}
                    {chartType === "line" && <LineChart className="h-12 w-12 text-muted-foreground" />}
                    {chartType === "table" && <Table className="h-12 w-12 text-muted-foreground" />}
                  </div>
                  <div className="text-sm text-muted-foreground text-center">
                    Run the report to see preview
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Selected Columns:</p>
                    <div className="flex flex-wrap gap-1">
                      {columns.filter(c => c.visible).map((col) => (
                        <Badge key={col.id} variant="secondary" className="text-xs">
                          {col.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="saved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Saved Reports</CardTitle>
              <CardDescription>Access and manage your saved report templates</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {savedReports.map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-primary" />
                        <div>
                          <p className="font-medium">{report.name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Last run: {report.lastRun}</span>
                            {report.scheduled && (
                              <Badge variant="outline" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                Scheduled
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
              <CardDescription>Reports configured for automatic delivery</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {savedReports.filter(r => r.scheduled).map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-primary/10">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{report.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Next run: Tomorrow at 9:00 AM
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge>Weekly</Badge>
                        <Button variant="outline" size="sm">
                          Edit Schedule
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
