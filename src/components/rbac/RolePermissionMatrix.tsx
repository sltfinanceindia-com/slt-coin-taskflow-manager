import { useState } from 'react';
import { Check, Eye, Plus, Edit, Trash2, UserCheck, Download } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type VisibilityScope = 'own' | 'team' | 'department' | 'all';

export interface ModulePermission {
  module_name: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_approve: boolean;
  can_export: boolean;
  visibility_scope: VisibilityScope;
}

interface RolePermissionMatrixProps {
  permissions: ModulePermission[];
  onChange: (permissions: ModulePermission[]) => void;
  readOnly?: boolean;
}

const MODULES = [
  { key: 'tasks', label: 'Tasks', description: 'Task management and Kanban board' },
  { key: 'projects', label: 'Projects', description: 'Project management' },
  { key: 'attendance', label: 'Attendance', description: 'Clock in/out and attendance records' },
  { key: 'leave', label: 'Leave', description: 'Leave requests and approvals' },
  { key: 'time_logs', label: 'Time Logs', description: 'Time tracking and logs' },
  { key: 'timesheets', label: 'Timesheets', description: 'Weekly/monthly timesheet submissions' },
  { key: 'employees', label: 'Employees', description: 'Employee directory and profiles' },
  { key: 'payroll', label: 'Payroll', description: 'Salary processing and payslips' },
  { key: 'expenses', label: 'Expenses', description: 'Expense claims and reimbursements' },
  { key: 'loans', label: 'Loans', description: 'Employee loan management' },
  { key: 'documents', label: 'Documents', description: 'Document management and storage' },
  { key: 'assets', label: 'Assets', description: 'Asset assignment and tracking' },
  { key: 'recruitment', label: 'Recruitment', description: 'Job postings and hiring pipeline' },
  { key: 'performance', label: 'Performance', description: 'OKRs, reviews and feedback' },
  { key: 'hr_management', label: 'HR Management', description: 'Onboarding, exit and compliance' },
  { key: 'reports', label: 'Reports', description: 'Analytics and reporting' },
  { key: 'coins', label: 'Coins', description: 'Coin rewards and transactions' },
  { key: 'training', label: 'Training', description: 'Training courses and assessments' },
  { key: 'communication', label: 'Communication', description: 'Team messaging' },
  { key: 'approvals', label: 'Approvals', description: 'Approval workflows' },
  { key: 'calendar', label: 'Calendar', description: 'Events and scheduling' },
  { key: 'service_desk', label: 'Service Desk', description: 'IT and HR service requests' },
  { key: 'benefits', label: 'Benefits', description: 'Employee benefits management' },
  { key: 'compliance', label: 'Compliance', description: 'Policy and regulatory compliance' },
  { key: 'holidays', label: 'Holidays', description: 'Holiday calendar management' },
  { key: 'settings', label: 'Settings', description: 'Organization settings' },
  { key: 'wfh', label: 'WFH', description: 'Work from home requests' },
  { key: 'shifts', label: 'Shifts', description: 'Shift scheduling' },
  { key: 'sessions', label: 'Sessions', description: 'User sessions, devices and locations' },
];

const PERMISSION_COLUMNS = [
  { key: 'can_view', label: 'View', icon: Eye },
  { key: 'can_create', label: 'Create', icon: Plus },
  { key: 'can_edit', label: 'Edit', icon: Edit },
  { key: 'can_delete', label: 'Delete', icon: Trash2 },
  { key: 'can_approve', label: 'Approve', icon: UserCheck },
  { key: 'can_export', label: 'Export', icon: Download },
];

const VISIBILITY_OPTIONS: { value: VisibilityScope; label: string }[] = [
  { value: 'own', label: 'Own' },
  { value: 'team', label: 'Team' },
  { value: 'department', label: 'Department' },
  { value: 'all', label: 'All' },
];

export function RolePermissionMatrix({
  permissions,
  onChange,
  readOnly = false,
}: RolePermissionMatrixProps) {
  const getModulePermission = (moduleName: string): ModulePermission => {
    return (
      permissions.find((p) => p.module_name === moduleName) || {
        module_name: moduleName,
        can_view: false,
        can_create: false,
        can_edit: false,
        can_delete: false,
        can_approve: false,
        can_export: false,
        visibility_scope: 'own' as VisibilityScope,
      }
    );
  };

  const updatePermission = (
    moduleName: string,
    field: keyof ModulePermission,
    value: boolean | VisibilityScope
  ) => {
    const existingIndex = permissions.findIndex((p) => p.module_name === moduleName);
    const existingPermission = getModulePermission(moduleName);
    const updatedPermission = { ...existingPermission, [field]: value };

    if (existingIndex >= 0) {
      const newPermissions = [...permissions];
      newPermissions[existingIndex] = updatedPermission;
      onChange(newPermissions);
    } else {
      onChange([...permissions, updatedPermission]);
    }
  };

  const toggleAllInColumn = (field: keyof ModulePermission) => {
    const allChecked = MODULES.every((m) => {
      const perm = getModulePermission(m.key);
      return perm[field] === true;
    });

    const newPermissions = MODULES.map((m) => {
      const existing = getModulePermission(m.key);
      return { ...existing, [field]: !allChecked };
    });
    onChange(newPermissions);
  };

  const toggleAllInRow = (moduleName: string) => {
    const perm = getModulePermission(moduleName);
    const allChecked =
      perm.can_view &&
      perm.can_create &&
      perm.can_edit &&
      perm.can_delete &&
      perm.can_approve &&
      perm.can_export;

    const updatedPermission = {
      ...perm,
      can_view: !allChecked,
      can_create: !allChecked,
      can_edit: !allChecked,
      can_delete: !allChecked,
      can_approve: !allChecked,
      can_export: !allChecked,
    };

    const existingIndex = permissions.findIndex((p) => p.module_name === moduleName);
    if (existingIndex >= 0) {
      const newPermissions = [...permissions];
      newPermissions[existingIndex] = updatedPermission;
      onChange(newPermissions);
    } else {
      onChange([...permissions, updatedPermission]);
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[200px] font-semibold">Module</TableHead>
            {PERMISSION_COLUMNS.map((col) => (
              <TableHead key={col.key} className="text-center w-[80px]">
                <button
                  onClick={() => !readOnly && toggleAllInColumn(col.key as keyof ModulePermission)}
                  className={cn(
                    'flex flex-col items-center gap-1 w-full',
                    !readOnly && 'hover:text-primary cursor-pointer'
                  )}
                  disabled={readOnly}
                >
                  <col.icon className="h-4 w-4" />
                  <span className="text-xs">{col.label}</span>
                </button>
              </TableHead>
            ))}
            <TableHead className="text-center w-[120px]">
              <span className="text-xs font-semibold">Visibility</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {MODULES.map((module) => {
            const perm = getModulePermission(module.key);
            return (
              <TableRow key={module.key} className="hover:bg-muted/30">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => !readOnly && toggleAllInRow(module.key)}
                      className={cn(
                        'font-medium',
                        !readOnly && 'hover:text-primary cursor-pointer'
                      )}
                      disabled={readOnly}
                    >
                      {module.label}
                    </button>
                  </div>
                </TableCell>
                {PERMISSION_COLUMNS.map((col) => (
                  <TableCell key={col.key} className="text-center">
                    <div className="flex justify-center">
                      <Switch
                        checked={perm[col.key as keyof ModulePermission] as boolean}
                        onCheckedChange={(checked) =>
                          updatePermission(module.key, col.key as keyof ModulePermission, checked)
                        }
                        disabled={readOnly}
                        className="data-[state=checked]:bg-primary"
                      />
                    </div>
                  </TableCell>
                ))}
                <TableCell className="text-center">
                  <Select
                    value={perm.visibility_scope}
                    onValueChange={(value: VisibilityScope) =>
                      updatePermission(module.key, 'visibility_scope', value)
                    }
                    disabled={readOnly}
                  >
                    <SelectTrigger className="w-[100px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VISIBILITY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

// Quick Templates for Permission Presets
export const PERMISSION_TEMPLATES = {
  org_admin: MODULES.map((m) => ({
    module_name: m.key,
    can_view: true,
    can_create: true,
    can_edit: true,
    can_delete: true,
    can_approve: true,
    can_export: true,
    visibility_scope: 'all' as VisibilityScope,
  })),
  hr_admin: MODULES.map((m) => ({
    module_name: m.key,
    can_view: true,
    can_create: ['employees', 'leave', 'payroll', 'recruitment', 'hr_management', 'training', 'documents', 'benefits', 'compliance', 'holidays', 'assets', 'communication'].includes(m.key),
    can_edit: ['employees', 'leave', 'payroll', 'recruitment', 'hr_management', 'training', 'documents', 'benefits', 'compliance', 'holidays', 'assets', 'attendance', 'performance'].includes(m.key),
    can_delete: ['employees', 'recruitment', 'documents', 'training'].includes(m.key),
    can_approve: ['leave', 'attendance', 'wfh', 'expenses', 'loans', 'approvals', 'documents'].includes(m.key),
    can_export: true,
    visibility_scope: 'all' as VisibilityScope,
  })),
  project_manager: MODULES.map((m) => ({
    module_name: m.key,
    can_view: true,
    can_create: ['tasks', 'projects', 'communication', 'calendar', 'timesheets'].includes(m.key),
    can_edit: ['tasks', 'projects', 'timesheets', 'time_logs'].includes(m.key),
    can_delete: ['tasks', 'projects'].includes(m.key),
    can_approve: ['leave', 'time_logs', 'timesheets', 'wfh', 'approvals'].includes(m.key),
    can_export: true,
    visibility_scope: 'department' as VisibilityScope,
  })),
  finance_manager: MODULES.map((m) => ({
    module_name: m.key,
    can_view: true,
    can_create: ['payroll', 'expenses', 'loans', 'communication'].includes(m.key),
    can_edit: ['payroll', 'expenses', 'loans'].includes(m.key),
    can_delete: false,
    can_approve: ['expenses', 'loans', 'payroll', 'approvals'].includes(m.key),
    can_export: true,
    visibility_scope: 'all' as VisibilityScope,
  })),
  manager: MODULES.map((m) => ({
    module_name: m.key,
    can_view: true,
    can_create: ['tasks', 'projects', 'communication', 'calendar'].includes(m.key),
    can_edit: ['tasks', 'projects', 'attendance', 'time_logs'].includes(m.key),
    can_delete: false,
    can_approve: ['leave', 'time_logs', 'attendance', 'approvals', 'wfh', 'expenses'].includes(m.key),
    can_export: true,
    visibility_scope: 'department' as VisibilityScope,
  })),
  team_lead: MODULES.map((m) => ({
    module_name: m.key,
    can_view: !['settings', 'sessions', 'payroll', 'loans', 'recruitment', 'compliance'].includes(m.key),
    can_create: ['tasks', 'communication', 'calendar'].includes(m.key),
    can_edit: ['tasks'].includes(m.key),
    can_delete: false,
    can_approve: ['leave', 'time_logs'].includes(m.key),
    can_export: ['tasks', 'attendance', 'time_logs'].includes(m.key),
    visibility_scope: 'team' as VisibilityScope,
  })),
  employee: MODULES.map((m) => ({
    module_name: m.key,
    can_view: !['settings', 'employees', 'sessions', 'recruitment', 'compliance', 'hr_management'].includes(m.key),
    can_create: ['tasks', 'communication', 'leave', 'wfh', 'expenses', 'documents', 'calendar', 'service_desk'].includes(m.key),
    can_edit: ['tasks', 'documents'].includes(m.key),
    can_delete: false,
    can_approve: false,
    can_export: false,
    visibility_scope: 'own' as VisibilityScope,
  })),
  intern: MODULES.map((m) => ({
    module_name: m.key,
    can_view: ['tasks', 'projects', 'attendance', 'training', 'communication', 'coins', 'calendar', 'leave'].includes(m.key),
    can_create: ['communication', 'leave'].includes(m.key),
    can_edit: false,
    can_delete: false,
    can_approve: false,
    can_export: false,
    visibility_scope: 'own' as VisibilityScope,
  })),
};
