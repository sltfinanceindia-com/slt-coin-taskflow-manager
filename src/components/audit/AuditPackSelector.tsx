import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Clock, 
  CheckSquare, 
  GraduationCap, 
  GitPullRequest, 
  Calendar,
  Activity,
  Package
} from 'lucide-react';

interface AuditPackTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  sections: string[];
  recommendedFor: string;
}

interface AuditPackSelectorProps {
  onSelect: (template: AuditPackTemplate) => void;
}

const templates: AuditPackTemplate[] = [
  {
    id: 'full-audit',
    name: 'Full Audit Pack',
    description: 'Complete organizational audit with all data sections',
    icon: <Package className="h-6 w-6" />,
    sections: ['tasks', 'timeLogs', 'approvals', 'training', 'changeRequests', 'attendance', 'activityLogs'],
    recommendedFor: 'Annual compliance reviews'
  },
  {
    id: 'time-tracking',
    name: 'Time & Attendance Audit',
    description: 'Focus on time logs, attendance, and activity records',
    icon: <Clock className="h-6 w-6" />,
    sections: ['timeLogs', 'attendance', 'activityLogs'],
    recommendedFor: 'Payroll verification, resource billing'
  },
  {
    id: 'project-delivery',
    name: 'Project Delivery Report',
    description: 'Tasks, change requests, and approvals',
    icon: <CheckSquare className="h-6 w-6" />,
    sections: ['tasks', 'changeRequests', 'approvals'],
    recommendedFor: 'Project closeout, stakeholder reporting'
  },
  {
    id: 'training-compliance',
    name: 'Training Compliance Pack',
    description: 'Training records and assessment completions',
    icon: <GraduationCap className="h-6 w-6" />,
    sections: ['training'],
    recommendedFor: 'HR compliance, certification audits'
  },
  {
    id: 'change-control',
    name: 'Change Control Audit',
    description: 'Change requests with approval chains',
    icon: <GitPullRequest className="h-6 w-6" />,
    sections: ['changeRequests', 'approvals'],
    recommendedFor: 'Governance reviews, scope validation'
  },
  {
    id: 'activity-trail',
    name: 'Activity Audit Trail',
    description: 'Complete user activity and system logs',
    icon: <Activity className="h-6 w-6" />,
    sections: ['activityLogs'],
    recommendedFor: 'Security audits, incident investigation'
  }
];

export function AuditPackSelector({ onSelect }: AuditPackSelectorProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Quick Start Templates</h2>
        <p className="text-sm text-muted-foreground">
          Choose a pre-configured template or customize your own audit pack
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Card 
            key={template.id}
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => onSelect(template)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  {template.icon}
                </div>
                <Badge variant="secondary" className="text-xs">
                  {template.sections.length} sections
                </Badge>
              </div>
              <CardTitle className="text-base">{template.name}</CardTitle>
              <CardDescription className="text-xs">
                {template.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {template.sections.slice(0, 3).map((section) => (
                    <Badge key={section} variant="outline" className="text-xs">
                      {section}
                    </Badge>
                  ))}
                  {template.sections.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{template.sections.length - 3} more
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Recommended for:</span> {template.recommendedFor}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center pt-4">
        <Button variant="outline" onClick={() => onSelect({
          id: 'custom',
          name: 'Custom Audit Pack',
          description: 'Build your own',
          icon: <FileText className="h-6 w-6" />,
          sections: [],
          recommendedFor: 'Custom requirements'
        })}>
          <FileText className="h-4 w-4 mr-2" />
          Create Custom Pack
        </Button>
      </div>
    </div>
  );
}
