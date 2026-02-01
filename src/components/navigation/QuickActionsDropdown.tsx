/**
 * Quick Actions Dropdown
 * Role-specific shortcuts for common actions
 */

import { useState } from 'react';
import {
  Plus,
  Clock,
  CheckSquare,
  Palmtree,
  Receipt,
  Users,
  FolderOpen,
  Target,
  Wallet,
  ClipboardCheck,
  ChevronDown,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { useUserRole } from '@/hooks/useUserRole';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface QuickAction {
  id: string;
  label: string;
  icon: typeof Plus;
  shortcut?: string;
  action: () => void;
  roles?: string[];
}

interface QuickActionsDropdownProps {
  className?: string;
}

export function QuickActionsDropdown({ className }: QuickActionsDropdownProps) {
  const navigate = useNavigate();
  const { 
    isAdmin, 
    isHRAdmin, 
    isProjectManager, 
    isFinanceManager, 
    isManager, 
    isTeamLead 
  } = useUserRole();
  const [open, setOpen] = useState(false);

  // Define all quick actions
  const allActions: QuickAction[] = [
    // Actions available to all
    {
      id: 'new-task',
      label: 'New Task',
      icon: CheckSquare,
      shortcut: '⌘T',
      action: () => navigate('/dashboard?tab=tasks&action=new'),
    },
    {
      id: 'log-time',
      label: 'Log Time',
      icon: Clock,
      shortcut: '⌘L',
      action: () => navigate('/dashboard?tab=time&action=new'),
    },
    {
      id: 'apply-leave',
      label: 'Apply Leave',
      icon: Palmtree,
      action: () => navigate('/dashboard?tab=leave&action=new'),
    },
    {
      id: 'new-expense',
      label: 'New Expense',
      icon: Receipt,
      action: () => navigate('/dashboard?tab=expenses&action=new'),
    },

    // Manager+ actions
    {
      id: 'approve-leaves',
      label: 'Approve Leaves',
      icon: ClipboardCheck,
      action: () => navigate('/dashboard?tab=leave&filter=pending'),
      roles: ['admin', 'org_admin', 'super_admin', 'hr_admin', 'manager', 'team_lead'],
    },

    // HR Admin actions
    {
      id: 'add-employee',
      label: 'Add Employee',
      icon: Users,
      action: () => navigate('/dashboard?tab=interns&action=new'),
      roles: ['admin', 'org_admin', 'super_admin', 'hr_admin'],
    },
    {
      id: 'process-payroll',
      label: 'Process Payroll',
      icon: Wallet,
      action: () => navigate('/dashboard?tab=payroll'),
      roles: ['admin', 'org_admin', 'super_admin', 'hr_admin', 'finance_manager'],
    },

    // Project Manager actions
    {
      id: 'create-project',
      label: 'Create Project',
      icon: FolderOpen,
      action: () => navigate('/dashboard?tab=projects&action=new'),
      roles: ['admin', 'org_admin', 'super_admin', 'project_manager'],
    },
    {
      id: 'start-sprint',
      label: 'Start Sprint',
      icon: Target,
      action: () => navigate('/dashboard?tab=sprints&action=new'),
      roles: ['admin', 'org_admin', 'super_admin', 'project_manager'],
    },
  ];

  // Filter actions based on user role
  const availableActions = allActions.filter(action => {
    if (!action.roles) return true; // Available to all

    // Check if user has any of the required roles
    if (isAdmin) return true;
    if (action.roles.includes('hr_admin') && isHRAdmin) return true;
    if (action.roles.includes('project_manager') && isProjectManager) return true;
    if (action.roles.includes('finance_manager') && isFinanceManager) return true;
    if (action.roles.includes('manager') && isManager) return true;
    if (action.roles.includes('team_lead') && isTeamLead) return true;

    return false;
  });

  // Group actions
  const commonActions = availableActions.filter(a => !a.roles);
  const specialActions = availableActions.filter(a => a.roles);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'h-8 sm:h-9 gap-1.5 px-2 sm:px-3 rounded-lg transition-all',
            'bg-primary/5 border-primary/20 text-primary hover:bg-primary/10',
            className
          )}
        >
          <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline text-xs font-medium">Quick</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          Quick Actions
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          {commonActions.map(action => (
            <DropdownMenuItem
              key={action.id}
              onClick={() => {
                action.action();
                setOpen(false);
              }}
              className="cursor-pointer"
            >
              <action.icon className="mr-2 h-4 w-4" />
              <span className="flex-1">{action.label}</span>
              {action.shortcut && (
                <span className="text-xs text-muted-foreground">{action.shortcut}</span>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        {specialActions.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {specialActions.map(action => (
                <DropdownMenuItem
                  key={action.id}
                  onClick={() => {
                    action.action();
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <action.icon className="mr-2 h-4 w-4" />
                  <span className="flex-1">{action.label}</span>
                  {action.shortcut && (
                    <span className="text-xs text-muted-foreground">{action.shortcut}</span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
