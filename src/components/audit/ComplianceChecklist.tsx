import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AuditPackConfig } from '@/hooks/useAuditPacks';
import { CheckCircle, XCircle, AlertTriangle, ArrowLeft, Shield, Loader2 } from 'lucide-react';

interface ComplianceChecklistProps {
  config: AuditPackConfig;
  onBack: () => void;
  onProceed: () => void;
}

interface ComplianceCheck {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'checking' | 'passed' | 'warning' | 'failed';
  message?: string;
}

export function ComplianceChecklist({ config, onBack, onProceed }: ComplianceChecklistProps) {
  const [checks, setChecks] = useState<ComplianceCheck[]>([
    {
      id: 'date-range',
      name: 'Date Range Validity',
      description: 'Verify date range is properly configured',
      status: 'pending'
    },
    {
      id: 'sections',
      name: 'Section Selection',
      description: 'At least one section must be selected',
      status: 'pending'
    },
    {
      id: 'data-completeness',
      name: 'Data Completeness',
      description: 'Check for potential data gaps',
      status: 'pending'
    },
    {
      id: 'time-period',
      name: 'Time Period Coverage',
      description: 'Verify reasonable audit period',
      status: 'pending'
    },
    {
      id: 'export-format',
      name: 'Export Format',
      description: 'Validate export format selection',
      status: 'pending'
    },
    {
      id: 'gdpr-compliance',
      name: 'GDPR Considerations',
      description: 'Personal data handling reminder',
      status: 'pending'
    }
  ]);

  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    runChecks();
  }, []);

  const runChecks = async () => {
    setIsRunning(true);

    for (let i = 0; i < checks.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setChecks(prev => prev.map((check, idx) => {
        if (idx !== i) return check;
        return { ...check, status: 'checking' };
      }));

      await new Promise(resolve => setTimeout(resolve, 400));

      setChecks(prev => prev.map((check, idx) => {
        if (idx !== i) return check;
        
        // Run actual check logic
        switch (check.id) {
          case 'date-range':
            const isValidRange = config.dateRange.from < config.dateRange.to;
            return {
              ...check,
              status: isValidRange ? 'passed' : 'failed',
              message: isValidRange ? 'Date range is valid' : 'Start date must be before end date'
            };

          case 'sections':
            const sectionCount = Object.values(config.includeSections).filter(Boolean).length;
            return {
              ...check,
              status: sectionCount > 0 ? 'passed' : 'failed',
              message: sectionCount > 0 ? `${sectionCount} sections selected` : 'No sections selected'
            };

          case 'data-completeness':
            // Always pass with warning for comprehensive exports
            const allSelected = Object.values(config.includeSections).every(Boolean);
            return {
              ...check,
              status: allSelected ? 'passed' : 'warning',
              message: allSelected 
                ? 'All sections included for complete audit' 
                : 'Some sections excluded - ensure intentional'
            };

          case 'time-period':
            const daysDiff = Math.ceil((config.dateRange.to.getTime() - config.dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
            if (daysDiff > 365) {
              return {
                ...check,
                status: 'warning',
                message: `${daysDiff} days selected - large exports may be slow`
              };
            }
            return {
              ...check,
              status: 'passed',
              message: `${daysDiff} days coverage`
            };

          case 'export-format':
            return {
              ...check,
              status: 'passed',
              message: config.format === 'json' ? 'JSON format selected' : 'CSV format selected (multiple files)'
            };

          case 'gdpr-compliance':
            return {
              ...check,
              status: 'warning',
              message: 'Audit packs may contain personal data - handle according to data policies'
            };

          default:
            return { ...check, status: 'passed' };
        }
      }));
    }

    setIsRunning(false);
  };

  const passedCount = checks.filter(c => c.status === 'passed').length;
  const warningCount = checks.filter(c => c.status === 'warning').length;
  const failedCount = checks.filter(c => c.status === 'failed').length;
  const canProceed = failedCount === 0 && !isRunning;

  const getStatusIcon = (status: ComplianceCheck['status']) => {
    switch (status) {
      case 'pending':
      case 'checking':
        return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />;
      case 'passed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-destructive" />;
    }
  };

  const overallProgress = ((passedCount + warningCount) / checks.length) * 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Pre-Export Compliance Check
            </CardTitle>
            <CardDescription>
              Verify configuration before generating audit pack
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Verification Progress</span>
            <div className="flex items-center gap-2">
              {passedCount > 0 && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  {passedCount} passed
                </Badge>
              )}
              {warningCount > 0 && (
                <Badge variant="outline" className="text-amber-600 border-amber-600">
                  {warningCount} warnings
                </Badge>
              )}
              {failedCount > 0 && (
                <Badge variant="destructive">
                  {failedCount} failed
                </Badge>
              )}
            </div>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        {/* Checklist */}
        <div className="space-y-3">
          {checks.map((check) => (
            <div
              key={check.id}
              className={`flex items-start gap-3 p-4 rounded-lg border transition-colors ${
                check.status === 'failed' ? 'border-destructive bg-destructive/5' :
                check.status === 'warning' ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20' :
                check.status === 'passed' ? 'border-green-500 bg-green-50/50 dark:bg-green-950/20' :
                'border-muted'
              }`}
            >
              {getStatusIcon(check.status)}
              <div className="flex-1">
                <p className="font-medium text-sm">{check.name}</p>
                <p className="text-xs text-muted-foreground">{check.description}</p>
                {check.message && (
                  <p className={`text-xs mt-1 ${
                    check.status === 'failed' ? 'text-destructive' :
                    check.status === 'warning' ? 'text-amber-600' :
                    'text-green-600'
                  }`}>
                    {check.message}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onBack}>
            Back to Configuration
          </Button>
          <Button
            onClick={onProceed}
            disabled={!canProceed}
            className="flex-1"
          >
            {failedCount > 0 ? (
              'Fix Issues to Continue'
            ) : warningCount > 0 ? (
              `Proceed with ${warningCount} Warning${warningCount > 1 ? 's' : ''}`
            ) : (
              'Generate Audit Pack'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
