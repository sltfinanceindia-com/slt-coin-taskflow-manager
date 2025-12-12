import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuditPacks, AuditPackConfig, AuditPackData } from '@/hooks/useAuditPacks';
import { ExportProgress } from './ExportProgress';
import { ComplianceChecklist } from './ComplianceChecklist';
import { FileDown, Archive, FileJson, FileSpreadsheet, Calendar, CheckCircle } from 'lucide-react';
import { format, subDays, subMonths } from 'date-fns';

export function AuditPackGenerator() {
  const { generateAuditPack, downloadAsJson, downloadAsCsv, isGenerating, progress, currentStep } = useAuditPacks();
  
  const [config, setConfig] = useState<AuditPackConfig>({
    name: `Audit Pack - ${format(new Date(), 'yyyy-MM-dd')}`,
    description: '',
    dateRange: {
      from: subMonths(new Date(), 1),
      to: new Date()
    },
    includeSections: {
      tasks: true,
      timeLogs: true,
      approvals: true,
      training: true,
      changeRequests: true,
      attendance: true,
      activityLogs: true
    },
    format: 'json'
  });

  const [generatedData, setGeneratedData] = useState<AuditPackData | null>(null);
  const [showCompliance, setShowCompliance] = useState(false);

  const handleGenerate = async () => {
    const data = await generateAuditPack(config);
    if (data) {
      setGeneratedData(data);
    }
  };

  const handleDownload = () => {
    if (!generatedData) return;
    
    const filename = config.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    if (config.format === 'json') {
      downloadAsJson(generatedData, filename);
    } else {
      downloadAsCsv(generatedData, filename);
    }
  };

  const toggleSection = (section: keyof typeof config.includeSections) => {
    setConfig(prev => ({
      ...prev,
      includeSections: {
        ...prev.includeSections,
        [section]: !prev.includeSections[section]
      }
    }));
  };

  const setQuickRange = (days: number) => {
    setConfig(prev => ({
      ...prev,
      dateRange: {
        from: subDays(new Date(), days),
        to: new Date()
      }
    }));
  };

  const selectedCount = Object.values(config.includeSections).filter(Boolean).length;

  if (showCompliance) {
    return (
      <ComplianceChecklist 
        config={config} 
        onBack={() => setShowCompliance(false)}
        onProceed={() => {
          setShowCompliance(false);
          handleGenerate();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Audit Pack Generator
          </CardTitle>
          <CardDescription>
            Generate comprehensive audit packs for compliance and reporting
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Pack Name */}
          <div className="space-y-2">
            <Label htmlFor="pack-name">Pack Name</Label>
            <Input
              id="pack-name"
              value={config.name}
              onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter audit pack name"
            />
          </div>

          {/* Date Range */}
          <div className="space-y-3">
            <Label>Date Range</Label>
            <div className="flex flex-wrap gap-2 mb-3">
              <Button variant="outline" size="sm" onClick={() => setQuickRange(7)}>
                Last 7 days
              </Button>
              <Button variant="outline" size="sm" onClick={() => setQuickRange(30)}>
                Last 30 days
              </Button>
              <Button variant="outline" size="sm" onClick={() => setQuickRange(90)}>
                Last 90 days
              </Button>
              <Button variant="outline" size="sm" onClick={() => setQuickRange(365)}>
                Last year
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">From</Label>
                <Input
                  type="date"
                  value={format(config.dateRange.from, 'yyyy-MM-dd')}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, from: new Date(e.target.value) }
                  }))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">To</Label>
                <Input
                  type="date"
                  value={format(config.dateRange.to, 'yyyy-MM-dd')}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, to: new Date(e.target.value) }
                  }))}
                />
              </div>
            </div>
          </div>

          {/* Sections to Include */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Sections to Include</Label>
              <span className="text-sm text-muted-foreground">{selectedCount} selected</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { key: 'tasks', label: 'Tasks & Projects', desc: 'All tasks with status and timestamps' },
                { key: 'timeLogs', label: 'Time Logs', desc: 'Logged hours and billable time' },
                { key: 'approvals', label: 'Approvals', desc: 'Approval workflows and decisions' },
                { key: 'training', label: 'Training Records', desc: 'Assessment attempts and completions' },
                { key: 'changeRequests', label: 'Change Requests', desc: 'Scope changes and approvals' },
                { key: 'attendance', label: 'Attendance', desc: 'Clock in/out records' },
                { key: 'activityLogs', label: 'Activity Logs', desc: 'User activity and audit trail' }
              ].map(({ key, label, desc }) => (
                <div
                  key={key}
                  className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => toggleSection(key as keyof typeof config.includeSections)}
                >
                  <Checkbox
                    checked={config.includeSections[key as keyof typeof config.includeSections]}
                    onCheckedChange={() => toggleSection(key as keyof typeof config.includeSections)}
                  />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Output Format */}
          <div className="space-y-3">
            <Label>Output Format</Label>
            <RadioGroup
              value={config.format}
              onValueChange={(v) => setConfig(prev => ({ ...prev, format: v as 'json' | 'csv' }))}
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <RadioGroupItem value="json" id="json" />
                <Label htmlFor="json" className="flex items-center gap-2 cursor-pointer">
                  <FileJson className="h-4 w-4" />
                  JSON (Single file)
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="flex items-center gap-2 cursor-pointer">
                  <FileSpreadsheet className="h-4 w-4" />
                  CSV (Multiple files)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowCompliance(true)}
              disabled={selectedCount === 0}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Run Compliance Check
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || selectedCount === 0}
              className="flex-1"
            >
              <Archive className="h-4 w-4 mr-2" />
              Generate Audit Pack
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progress */}
      {isGenerating && (
        <ExportProgress progress={progress} currentStep={currentStep} />
      )}

      {/* Generated Data Summary */}
      {generatedData && !isGenerating && (
        <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <CheckCircle className="h-5 w-5" />
              Audit Pack Ready
            </CardTitle>
            <CardDescription>
              Generated {format(new Date(generatedData.generatedAt), 'PPpp')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <div className="text-center p-3 bg-background rounded-lg">
                <p className="text-2xl font-bold">{generatedData.summary.totalTasks}</p>
                <p className="text-xs text-muted-foreground">Tasks</p>
              </div>
              <div className="text-center p-3 bg-background rounded-lg">
                <p className="text-2xl font-bold">{generatedData.summary.completedTasks}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
              <div className="text-center p-3 bg-background rounded-lg">
                <p className="text-2xl font-bold">{generatedData.summary.totalHoursLogged.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Hours Logged</p>
              </div>
              <div className="text-center p-3 bg-background rounded-lg">
                <p className="text-2xl font-bold">{generatedData.summary.approvalsProcessed}</p>
                <p className="text-xs text-muted-foreground">Approvals</p>
              </div>
              <div className="text-center p-3 bg-background rounded-lg">
                <p className="text-2xl font-bold">{generatedData.summary.trainingCompletions}</p>
                <p className="text-xs text-muted-foreground">Training</p>
              </div>
              <div className="text-center p-3 bg-background rounded-lg">
                <p className="text-2xl font-bold">{generatedData.summary.changeRequestsCount}</p>
                <p className="text-xs text-muted-foreground">Changes</p>
              </div>
            </div>

            <Button onClick={handleDownload} className="w-full">
              <FileDown className="h-4 w-4 mr-2" />
              Download {config.format.toUpperCase()}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
