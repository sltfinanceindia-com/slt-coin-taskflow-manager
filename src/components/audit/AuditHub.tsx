import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AuditPackGenerator } from './AuditPackGenerator';
import { AuditPackSelector } from './AuditPackSelector';
import { ComplianceChecklist } from './ComplianceChecklist';
import { ExportProgress } from './ExportProgress';
import { Package, FileCheck, ClipboardCheck, Download } from 'lucide-react';
import { AuditPackConfig } from '@/hooks/useAuditPacks';

interface AuditPackTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  sections: string[];
  recommendedFor: string;
}

export function AuditHub() {
  const [activeTab, setActiveTab] = useState('generator');
  const [selectedTemplate, setSelectedTemplate] = useState<AuditPackTemplate | null>(null);
  const [auditConfig, setAuditConfig] = useState<AuditPackConfig | null>(null);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStep, setExportStep] = useState('Preparing...');

  const handleSelectTemplate = (template: AuditPackTemplate) => {
    setSelectedTemplate(template);
    // Create a config from the template
    const config: AuditPackConfig = {
      name: template.name,
      dateRange: { from: new Date(), to: new Date() },
      includeSections: {
        tasks: template.sections.includes('Tasks & Progress'),
        timeLogs: template.sections.includes('Time Logs'),
        approvals: template.sections.includes('Approvals'),
        training: template.sections.includes('Training Records'),
        changeRequests: template.sections.includes('Change Requests'),
        attendance: template.sections.includes('Attendance'),
        activityLogs: template.sections.includes('Activity Logs'),
      },
      format: 'json',
    };
    setAuditConfig(config);
    setActiveTab('checklist');
  };

  const handleBack = () => {
    setActiveTab('templates');
  };

  const handleProceed = () => {
    setExportProgress(0);
    setExportStep('Initializing export...');
    setActiveTab('export');
    // Simulate export progress
    let progress = 0;
    const steps = ['Fetching data...', 'Processing records...', 'Generating documents...', 'Finalizing...'];
    const interval = setInterval(() => {
      progress += 10;
      setExportProgress(progress);
      setExportStep(steps[Math.floor(progress / 30)] || 'Finalizing...');
      if (progress >= 100) {
        clearInterval(interval);
        setExportStep('Complete!');
      }
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Enterprise Audit Packs</h1>
        <p className="text-muted-foreground">
          Generate compliance documentation and audit-ready export bundles
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="generator" className="gap-2">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Generator</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <FileCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Templates</span>
          </TabsTrigger>
          <TabsTrigger value="checklist" className="gap-2">
            <ClipboardCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Checklist</span>
          </TabsTrigger>
          <TabsTrigger value="export" className="gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="mt-0">
          <AuditPackGenerator />
        </TabsContent>

        <TabsContent value="templates" className="mt-0">
          <AuditPackSelector onSelect={handleSelectTemplate} />
        </TabsContent>

        <TabsContent value="checklist" className="mt-0">
          {auditConfig ? (
            <ComplianceChecklist config={auditConfig} onBack={handleBack} onProceed={handleProceed} />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Select a template first from the Templates tab
            </div>
          )}
        </TabsContent>

        <TabsContent value="export" className="mt-0">
          <ExportProgress progress={exportProgress} currentStep={exportStep} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
