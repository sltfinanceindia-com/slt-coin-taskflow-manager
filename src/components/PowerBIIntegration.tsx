import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  ExternalLink, 
  Download, 
  Share, 
  BarChart3, 
  TrendingUp, 
  Database,
  Settings,
  X
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PowerBIIntegrationProps {
  data: any;
  onClose: () => void;
}

export function PowerBIIntegration({ data, onClose }: PowerBIIntegrationProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [powerBIConfig, setPowerBIConfig] = useState({
    workspaceId: '',
    datasetId: '',
    reportId: '',
    embedUrl: '',
  });

  // Generate Power BI compatible dataset
  const generatePowerBIDataset = () => {
    return {
      tables: [
        {
          name: 'Tasks',
          columns: [
            { name: 'TaskId', dataType: 'string' },
            { name: 'Title', dataType: 'string' },
            { name: 'Status', dataType: 'string' },
            { name: 'Priority', dataType: 'string' },
            { name: 'AssignedTo', dataType: 'string' },
            { name: 'CreatedDate', dataType: 'dateTime' },
            { name: 'UpdatedDate', dataType: 'dateTime' },
            { name: 'CoinValue', dataType: 'int64' },
            { name: 'CycleTime', dataType: 'double' },
            { name: 'LeadTime', dataType: 'double' },
          ],
          rows: data.tasks || []
        },
        {
          name: 'Analytics',
          columns: [
            { name: 'MetricName', dataType: 'string' },
            { name: 'MetricValue', dataType: 'double' },
            { name: 'MetricDate', dataType: 'dateTime' },
            { name: 'Category', dataType: 'string' },
          ],
          rows: [
            { MetricName: 'CompletionRate', MetricValue: data.completionRate, MetricDate: new Date(), Category: 'Performance' },
            { MetricName: 'AvgCycleTime', MetricValue: data.avgCycleTime, MetricDate: new Date(), Category: 'Efficiency' },
            { MetricName: 'WIPLimit', MetricValue: data.wipLimit, MetricDate: new Date(), Category: 'Flow' },
            { MetricName: 'TotalTasks', MetricValue: data.totalTasks, MetricDate: new Date(), Category: 'Volume' },
          ]
        }
      ],
      refreshPolicy: {
        refreshType: 'scheduled',
        frequency: 'daily',
        time: '06:00'
      }
    };
  };

  // Export to Power BI
  const exportToPowerBI = async () => {
    setIsExporting(true);
    try {
      // In a real implementation, this would call Power BI REST API
      const dataset = generatePowerBIDataset();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate downloadable file
      const dataStr = JSON.stringify(dataset, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `kanban-analytics-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Export Successful',
        description: 'Data has been exported for Power BI import.',
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export data to Power BI.',
        variant: 'destructive',
      });
    }
    setIsExporting(false);
  };

  // Generate Power BI embedding code
  const generateEmbedCode = () => {
    return `
<!-- Power BI Embed Code -->
<iframe 
  title="Kanban Analytics Dashboard"
  width="1140" 
  height="541.25"
  src="${powerBIConfig.embedUrl}"
  frameborder="0" 
  allowFullScreen="true">
</iframe>

<script>
  // Power BI JavaScript API integration
  const models = window['powerbi-client'].models;
  const config = {
    type: 'report',
    id: '${powerBIConfig.reportId}',
    embedUrl: '${powerBIConfig.embedUrl}',
    accessToken: 'YOUR_ACCESS_TOKEN',
    tokenType: models.TokenType.Embed,
    settings: {
      filterPaneEnabled: true,
      navContentPaneEnabled: true,
      background: models.BackgroundType.Transparent,
    }
  };
  
  const reportContainer = document.getElementById('reportContainer');
  const report = powerbi.embed(reportContainer, config);
</script>`;
  };

  // Power BI DAX queries for advanced analytics
  const daxQueries = {
    cycleTimeAnalysis: `
DEFINE
  MEASURE Tasks[AvgCycleTime] = 
    AVERAGEX(
      FILTER(Tasks, Tasks[Status] = "verified"),
      DATEDIFF(Tasks[CreatedDate], Tasks[UpdatedDate], DAY)
    )
    
  MEASURE Tasks[CycleTimeVariance] = 
    VARX(
      FILTER(Tasks, Tasks[Status] = "verified"),
      DATEDIFF(Tasks[CreatedDate], Tasks[UpdatedDate], DAY)
    )

EVALUATE
  SUMMARIZECOLUMNS(
    Tasks[AssignedTo],
    "AvgCycleTime", Tasks[AvgCycleTime],
    "CycleTimeVariance", Tasks[CycleTimeVariance]
  )`,
    
    throughputTrend: `
DEFINE
  MEASURE Tasks[WeeklyThroughput] = 
    CALCULATE(
      COUNTROWS(Tasks),
      Tasks[Status] = "verified",
      Tasks[UpdatedDate] >= TODAY() - 7
    )

EVALUATE
  ADDCOLUMNS(
    CALENDARAUTO(),
    "WeeklyThroughput", Tasks[WeeklyThroughput]
  )`,
    
    bottleneckAnalysis: `
DEFINE
  MEASURE Tasks[WIPByStatus] = 
    CALCULATE(
      COUNTROWS(Tasks),
      Tasks[Status] IN {"assigned", "in_progress", "completed"}
    )
    
  MEASURE Tasks[BottleneckScore] = 
    DIVIDE(Tasks[WIPByStatus], Tasks[WeeklyThroughput], 0)

EVALUATE
  SUMMARIZECOLUMNS(
    Tasks[Status],
    "TaskCount", COUNTROWS(Tasks),
    "BottleneckScore", Tasks[BottleneckScore]
  )`
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Power BI Integration
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Download className="h-8 w-8 text-blue-500" />
                  <div>
                    <h3 className="font-medium">Export Dataset</h3>
                    <p className="text-sm text-muted-foreground">Download data for Power BI</p>
                  </div>
                </div>
                <Button 
                  className="w-full mt-3" 
                  onClick={exportToPowerBI}
                  disabled={isExporting}
                >
                  {isExporting ? 'Exporting...' : 'Export Data'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Share className="h-8 w-8 text-green-500" />
                  <div>
                    <h3 className="font-medium">Share Dashboard</h3>
                    <p className="text-sm text-muted-foreground">Generate embed code</p>
                  </div>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full mt-3" variant="outline">
                      Get Embed Code
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Power BI Embed Code</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="embedUrl">Embed URL</Label>
                        <Input
                          id="embedUrl"
                          value={powerBIConfig.embedUrl}
                          onChange={(e) => setPowerBIConfig(prev => ({
                            ...prev,
                            embedUrl: e.target.value
                          }))}
                          placeholder="https://app.powerbi.com/reportEmbed?reportId=..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Generated Embed Code</Label>
                        <Textarea
                          value={generateEmbedCode()}
                          readOnly
                          rows={10}
                          className="font-mono text-xs"
                        />
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                  <div>
                    <h3 className="font-medium">Advanced Analytics</h3>
                    <p className="text-sm text-muted-foreground">DAX query templates</p>
                  </div>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full mt-3" variant="outline">
                      View DAX Queries
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>Advanced DAX Queries</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      {Object.entries(daxQueries).map(([title, query]) => (
                        <div key={title} className="space-y-2">
                          <h4 className="font-medium capitalize">{title.replace(/([A-Z])/g, ' $1')}</h4>
                          <Textarea
                            value={query}
                            readOnly
                            rows={8}
                            className="font-mono text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>

          {/* Data Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{data.totalTasks}</p>
                  <p className="text-sm text-muted-foreground">Total Tasks</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{data.completedTasks}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{data.completionRate.toFixed(1)}%</p>
                  <p className="text-sm text-muted-foreground">Completion Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{data.avgCycleTime.toFixed(1)}d</p>
                  <p className="text-sm text-muted-foreground">Avg Cycle Time</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Power BI Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="workspaceId">Workspace ID</Label>
                  <Input
                    id="workspaceId"
                    value={powerBIConfig.workspaceId}
                    onChange={(e) => setPowerBIConfig(prev => ({
                      ...prev,
                      workspaceId: e.target.value
                    }))}
                    placeholder="Your Power BI workspace ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="datasetId">Dataset ID</Label>
                  <Input
                    id="datasetId"
                    value={powerBIConfig.datasetId}
                    onChange={(e) => setPowerBIConfig(prev => ({
                      ...prev,
                      datasetId: e.target.value
                    }))}
                    placeholder="Your dataset ID"
                  />
                </div>
              </div>
              
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <h4 className="font-medium text-foreground mb-2">Integration Steps:</h4>
                <ol className="text-sm text-muted-foreground space-y-1">
                  <li>1. Export the dataset using the button above</li>
                  <li>2. Import the JSON file into Power BI Desktop</li>
                  <li>3. Create your visualizations and reports</li>
                  <li>4. Publish to Power BI Service</li>
                  <li>5. Use the embed code to integrate into your dashboard</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Status Indicators */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                <ExternalLink className="h-3 w-3 mr-1" />
                Power BI Ready
              </Badge>
              <Badge variant="outline">
                <Database className="h-3 w-3 mr-1" />
                {data.totalTasks} Records
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Last updated: {new Date().toLocaleString()}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}