import { FeaturePlaceholder } from '@/components/common/FeaturePlaceholder';
import {
  Target, FileBox, GitBranch, AlertTriangle, Users2, Gauge, Clock, CalendarDays,
  Home, FileText, BookOpen, Calendar
} from 'lucide-react';

// Sprint Planning
export function SprintsTab() {
  return (
    <FeaturePlaceholder
      title="Sprint Planning"
      description="Agile sprint creation, management, and tracking"
      icon={Target}
      category="agile"
      features={[
        'Sprint creation wizard',
        'Backlog prioritization',
        'Story point estimation',
        'Capacity planning',
        'Sprint goals setting',
        'Burndown charts',
        'Velocity tracking',
        'Sprint retrospectives'
      ]}
    />
  );
}

// Backlog
export function BacklogTab() {
  return (
    <FeaturePlaceholder
      title="Backlog Management"
      description="Product and sprint backlog grooming and prioritization"
      icon={FileBox}
      category="agile"
      features={[
        'User story creation',
        'Epic management',
        'Priority ordering',
        'Story breakdown',
        'Acceptance criteria',
        'Estimation sessions',
        'Backlog refinement',
        'Release planning'
      ]}
    />
  );
}

// Milestones
export function MilestonesTab() {
  return (
    <FeaturePlaceholder
      title="Milestone Tracking"
      description="Project milestone definition and progress monitoring"
      icon={Target}
      category="work"
      features={[
        'Milestone creation',
        'Due date tracking',
        'Progress indicators',
        'Dependency linking',
        'Completion criteria',
        'Status updates',
        'Milestone reports',
        'Timeline visualization'
      ]}
    />
  );
}

// Dependencies
export function DependenciesTab() {
  return (
    <FeaturePlaceholder
      title="Task Dependencies"
      description="Manage task relationships and dependency chains"
      icon={GitBranch}
      category="work"
      features={[
        'Dependency mapping',
        'Predecessor/Successor',
        'Critical path analysis',
        'Blocking issue alerts',
        'Dependency visualization',
        'Impact assessment',
        'Auto-scheduling',
        'Circular dependency detection'
      ]}
    />
  );
}

// Risk Register
export function RisksTab() {
  return (
    <FeaturePlaceholder
      title="Risk Register"
      description="Project risk identification, assessment, and mitigation"
      icon={AlertTriangle}
      category="work"
      features={[
        'Risk identification',
        'Impact assessment',
        'Probability rating',
        'Mitigation strategies',
        'Risk owners',
        'Monitoring actions',
        'Risk matrix',
        'Escalation triggers'
      ]}
    />
  );
}

// Issue Tracker
export function IssuesTab() {
  return (
    <FeaturePlaceholder
      title="Issue Tracker"
      description="Project issue logging, tracking, and resolution"
      icon={AlertTriangle}
      category="work"
      features={[
        'Issue logging',
        'Severity classification',
        'Assignment routing',
        'Resolution tracking',
        'Root cause analysis',
        'Issue trends',
        'Escalation workflow',
        'Resolution SLAs'
      ]}
    />
  );
}

// Resource Allocation
export function ResourcesTab() {
  return (
    <FeaturePlaceholder
      title="Resource Allocation"
      description="Assign and manage resources across projects"
      icon={Users2}
      category="work"
      features={[
        'Resource pool management',
        'Allocation percentage',
        'Skills matching',
        'Availability calendar',
        'Conflict detection',
        'Utilization reports',
        'Demand forecasting',
        'Resource leveling'
      ]}
    />
  );
}

// Workload
export function WorkloadTab() {
  return (
    <FeaturePlaceholder
      title="Workload Balancing"
      description="Even distribution of work across team members"
      icon={Gauge}
      category="work"
      features={[
        'Workload visualization',
        'Capacity analysis',
        'Over-allocation alerts',
        'Task redistribution',
        'Team balance view',
        'Historical patterns',
        'Forecast modeling',
        'Optimization suggestions'
      ]}
    />
  );
}

// Overtime
export function OvertimeTab() {
  return (
    <FeaturePlaceholder
      title="Overtime Tracking"
      description="Automatic overtime calculation and approval"
      icon={Clock}
      category="work"
      features={[
        'Overtime detection',
        'Rate calculation',
        'Approval workflows',
        'Policy compliance',
        'Comp-off conversion',
        'Overtime limits',
        'Cost tracking',
        'Overtime reports'
      ]}
    />
  );
}

// Comp-Off
export function CompOffTab() {
  return (
    <FeaturePlaceholder
      title="Comp-Off Management"
      description="Compensatory off for overtime and holiday work"
      icon={CalendarDays}
      category="work"
      features={[
        'Comp-off accrual',
        'Eligibility rules',
        'Expiry management',
        'Request workflow',
        'Balance tracking',
        'Policy configuration',
        'Usage reports',
        'Auto-calculation'
      ]}
    />
  );
}

// On-Call
export function OnCallTab() {
  return (
    <FeaturePlaceholder
      title="On-Call Rotation"
      description="On-call duty scheduling and management"
      icon={CalendarDays}
      category="work"
      features={[
        'Rotation scheduling',
        'Calendar integration',
        'Handoff management',
        'Escalation rules',
        'On-call allowances',
        'Coverage tracking',
        'Incident logging',
        'Availability alerts'
      ]}
    />
  );
}

// Shift Swap
export function ShiftSwapTab() {
  return (
    <FeaturePlaceholder
      title="Shift Swapping"
      description="Employee shift swap requests and approvals"
      icon={CalendarDays}
      category="work"
      features={[
        'Swap request portal',
        'Eligible shift matching',
        'Peer approval',
        'Manager override',
        'Conflict detection',
        'Notification system',
        'Swap history',
        'Policy enforcement'
      ]}
    />
  );
}

// Remote Policies
export function RemotePoliciesTab() {
  return (
    <FeaturePlaceholder
      title="Remote Work Policies"
      description="WFH policy configuration and compliance"
      icon={Home}
      category="work"
      features={[
        'Policy definition',
        'Eligibility criteria',
        'Request limits',
        'Equipment allowances',
        'Productivity tracking',
        'Communication guidelines',
        'Compliance monitoring',
        'Policy acknowledgments'
      ]}
    />
  );
}

// Project Templates
export function ProjectTemplatesTab() {
  return (
    <FeaturePlaceholder
      title="Project Templates"
      description="Reusable project templates for quick setup"
      icon={FileBox}
      category="work"
      features={[
        'Template creation',
        'Task structure',
        'Milestone presets',
        'Role assignments',
        'Document templates',
        'Clone functionality',
        'Template library',
        'Version management'
      ]}
    />
  );
}

// Task Templates
export function TaskTemplatesTab() {
  return (
    <FeaturePlaceholder
      title="Task Templates"
      description="Reusable task templates for common work items"
      icon={FileBox}
      category="work"
      features={[
        'Template builder',
        'Checklist presets',
        'Default assignments',
        'Time estimates',
        'Description templates',
        'Category organization',
        'Quick apply',
        'Template sharing'
      ]}
    />
  );
}

// Recurring Tasks
export function RecurringTasksTab() {
  return (
    <FeaturePlaceholder
      title="Recurring Tasks"
      description="Auto-create recurring tasks on schedule"
      icon={Clock}
      category="work"
      features={[
        'Recurrence patterns',
        'Schedule configuration',
        'Auto-assignment',
        'Exception handling',
        'Series management',
        'Completion tracking',
        'Reminder system',
        'Bulk operations'
      ]}
    />
  );
}

// Meeting Notes
export function MeetingNotesTab() {
  return (
    <FeaturePlaceholder
      title="Meeting Notes"
      description="Meeting minutes with action items tracking"
      icon={FileText}
      category="work"
      features={[
        'Note templates',
        'Action item extraction',
        'Attendee management',
        'Decision recording',
        'Follow-up tracking',
        'Meeting series',
        'Search functionality',
        'Export options'
      ]}
    />
  );
}

// Decision Log
export function DecisionsTab() {
  return (
    <FeaturePlaceholder
      title="Decision Log"
      description="Track and document project decisions"
      icon={FileText}
      category="work"
      features={[
        'Decision recording',
        'Context documentation',
        'Stakeholder sign-off',
        'Impact assessment',
        'Alternative options',
        'Decision ownership',
        'Audit trail',
        'Search and filter'
      ]}
    />
  );
}

// Lessons Learned
export function LessonsTab() {
  return (
    <FeaturePlaceholder
      title="Lessons Learned"
      description="Post-project retrospectives and knowledge capture"
      icon={BookOpen}
      category="work"
      features={[
        'Retrospective facilitation',
        'What went well',
        'Improvement areas',
        'Action recommendations',
        'Knowledge base',
        'Cross-project insights',
        'Trend analysis',
        'Best practice library'
      ]}
    />
  );
}

// Work Calendars
export function WorkCalendarsTab() {
  return (
    <FeaturePlaceholder
      title="Work Calendars"
      description="Team calendars and scheduling overview"
      icon={Calendar}
      category="work"
      features={[
        'Team calendar view',
        'Resource availability',
        'Meeting scheduling',
        'Deadline visualization',
        'Leave integration',
        'Holiday overlay',
        'Time zone support',
        'Calendar sharing'
      ]}
    />
  );
}
