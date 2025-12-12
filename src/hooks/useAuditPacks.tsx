import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export interface AuditPackConfig {
  name: string;
  description?: string;
  dateRange: {
    from: Date;
    to: Date;
  };
  includeSections: {
    tasks: boolean;
    timeLogs: boolean;
    approvals: boolean;
    training: boolean;
    changeRequests: boolean;
    attendance: boolean;
    activityLogs: boolean;
  };
  format: 'json' | 'csv';
}

export interface AuditPackData {
  generatedAt: string;
  dateRange: { from: string; to: string };
  organization: string;
  sections: {
    tasks?: any[];
    timeLogs?: any[];
    approvals?: any[];
    training?: any[];
    changeRequests?: any[];
    attendance?: any[];
    activityLogs?: any[];
  };
  summary: {
    totalTasks: number;
    completedTasks: number;
    totalHoursLogged: number;
    approvalsProcessed: number;
    trainingCompletions: number;
    changeRequestsCount: number;
  };
}

export function useAuditPacks() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');

  const generateAuditPack = async (config: AuditPackConfig): Promise<AuditPackData | null> => {
    setIsGenerating(true);
    setProgress(0);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('id, organization_id, organizations(name)')
        .eq('user_id', user.id)
        .single();

      if (!profile?.organization_id) throw new Error('No organization found');

      const auditData: AuditPackData = {
        generatedAt: new Date().toISOString(),
        dateRange: {
          from: config.dateRange.from.toISOString(),
          to: config.dateRange.to.toISOString()
        },
        organization: (profile.organizations as any)?.name || 'Unknown',
        sections: {},
        summary: {
          totalTasks: 0,
          completedTasks: 0,
          totalHoursLogged: 0,
          approvalsProcessed: 0,
          trainingCompletions: 0,
          changeRequestsCount: 0
        }
      };

      const totalSections = Object.values(config.includeSections).filter(Boolean).length;
      let completedSections = 0;

      // Tasks
      if (config.includeSections.tasks) {
        setCurrentStep('Fetching tasks...');
        const { data: tasks } = await supabase
          .from('tasks')
          .select('id, title, description, status, priority, created_at, updated_at, start_date, end_date')
          .eq('organization_id', profile.organization_id)
          .gte('created_at', config.dateRange.from.toISOString())
          .lte('created_at', config.dateRange.to.toISOString())
          .order('created_at', { ascending: false });

        auditData.sections.tasks = tasks || [];
        auditData.summary.totalTasks = tasks?.length || 0;
        auditData.summary.completedTasks = tasks?.filter(t => t.status === 'completed').length || 0;
        completedSections++;
        setProgress((completedSections / totalSections) * 100);
      }

      // Time Logs
      if (config.includeSections.timeLogs) {
        setCurrentStep('Fetching time logs...');
        const { data: timeLogs } = await supabase
          .from('time_logs')
          .select('id, hours_worked, description, date_logged, created_at, task_id, user_id')
          .eq('organization_id', profile.organization_id)
          .gte('date_logged', config.dateRange.from.toISOString().split('T')[0])
          .lte('date_logged', config.dateRange.to.toISOString().split('T')[0])
          .order('date_logged', { ascending: false });

        auditData.sections.timeLogs = timeLogs || [];
        auditData.summary.totalHoursLogged = timeLogs?.reduce((sum, t) => sum + (Number(t.hours_worked) || 0), 0) || 0;
        completedSections++;
        setProgress((completedSections / totalSections) * 100);
      }

      // Approvals
      if (config.includeSections.approvals) {
        setCurrentStep('Fetching approvals...');
        const { data: approvals } = await supabase
          .from('approval_instances')
          .select('id, entity_type, entity_id, status, current_step, created_at, updated_at')
          .eq('organization_id', profile.organization_id)
          .gte('created_at', config.dateRange.from.toISOString())
          .lte('created_at', config.dateRange.to.toISOString())
          .order('created_at', { ascending: false });

        auditData.sections.approvals = approvals || [];
        auditData.summary.approvalsProcessed = approvals?.filter(a => a.status !== 'pending').length || 0;
        completedSections++;
        setProgress((completedSections / totalSections) * 100);
      }

      // Training
      if (config.includeSections.training) {
        setCurrentStep('Fetching training records...');
        const { data: training } = await supabase
          .from('assessment_attempts')
          .select('id, assessment_id, status, score, is_passed, started_at, submitted_at')
          .eq('organization_id', profile.organization_id)
          .gte('started_at', config.dateRange.from.toISOString())
          .lte('started_at', config.dateRange.to.toISOString())
          .order('started_at', { ascending: false });

        auditData.sections.training = training || [];
        auditData.summary.trainingCompletions = training?.filter(t => t.status === 'completed').length || 0;
        completedSections++;
        setProgress((completedSections / totalSections) * 100);
      }

      // Change Requests
      if (config.includeSections.changeRequests) {
        setCurrentStep('Fetching change requests...');
        const { data: changeRequests } = await supabase
          .from('change_requests')
          .select('id, title, description, status, priority, created_at, approved_at, implemented_at')
          .eq('organization_id', profile.organization_id)
          .gte('created_at', config.dateRange.from.toISOString())
          .lte('created_at', config.dateRange.to.toISOString())
          .order('created_at', { ascending: false });

        auditData.sections.changeRequests = changeRequests || [];
        auditData.summary.changeRequestsCount = changeRequests?.length || 0;
        completedSections++;
        setProgress((completedSections / totalSections) * 100);
      }

      // Attendance
      if (config.includeSections.attendance) {
        setCurrentStep('Fetching attendance records...');
        const { data: attendance } = await supabase
          .from('attendance_records')
          .select('id, employee_id, attendance_date, clock_in_time, clock_out_time, total_hours, status')
          .eq('organization_id', profile.organization_id)
          .gte('attendance_date', config.dateRange.from.toISOString().split('T')[0])
          .lte('attendance_date', config.dateRange.to.toISOString().split('T')[0])
          .order('attendance_date', { ascending: false });

        auditData.sections.attendance = attendance || [];
        completedSections++;
        setProgress((completedSections / totalSections) * 100);
      }

      // Activity Logs
      if (config.includeSections.activityLogs) {
        setCurrentStep('Fetching activity logs...');
        const { data: activityLogs } = await supabase
          .from('activity_logs')
          .select('id, user_id, activity_type, timestamp, metadata')
          .eq('organization_id', profile.organization_id)
          .gte('timestamp', config.dateRange.from.toISOString())
          .lte('timestamp', config.dateRange.to.toISOString())
          .order('timestamp', { ascending: false })
          .limit(1000);

        auditData.sections.activityLogs = activityLogs || [];
        completedSections++;
        setProgress((completedSections / totalSections) * 100);
      }

      setCurrentStep('Finalizing audit pack...');
      setProgress(100);
      
      toast({ title: 'Audit pack generated successfully' });
      return auditData;

    } catch (error: any) {
      toast({ title: 'Failed to generate audit pack', description: error.message, variant: 'destructive' });
      return null;
    } finally {
      setIsGenerating(false);
      setCurrentStep('');
    }
  };

  const downloadAsJson = (data: AuditPackData, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAsCsv = (data: AuditPackData, filename: string) => {
    const sections = Object.entries(data.sections);
    
    sections.forEach(([sectionName, sectionData]) => {
      if (!sectionData || sectionData.length === 0) return;
      
      const headers = Object.keys(sectionData[0]);
      const csvContent = [
        headers.join(','),
        ...sectionData.map(row => 
          headers.map(h => {
            const value = row[h];
            if (value === null || value === undefined) return '';
            if (typeof value === 'object') return JSON.stringify(value).replace(/,/g, ';');
            return String(value).replace(/,/g, ';');
          }).join(',')
        )
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}_${sectionName}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  return {
    generateAuditPack,
    downloadAsJson,
    downloadAsCsv,
    isGenerating,
    progress,
    currentStep
  };
}
