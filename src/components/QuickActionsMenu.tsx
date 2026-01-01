import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  Clock, 
  Calendar, 
  MessageSquare, 
  FileText, 
  Receipt, 
  Palmtree,
  Home,
  CheckSquare,
  Target,
  Heart,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickAction {
  icon: React.ElementType;
  label: string;
  shortcut?: string;
  action: () => void;
  color?: string;
}

interface QuickActionsMenuProps {
  onLogTime?: () => void;
  onCreateTask?: () => void;
  onRequestLeave?: () => void;
  onRequestWfh?: () => void;
  onAddExpense?: () => void;
  className?: string;
}

export function QuickActionsMenu({
  onLogTime,
  onCreateTask,
  onRequestLeave,
  onRequestWfh,
  onAddExpense,
  className,
}: QuickActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navigateToTab = (tab: string) => {
    window.dispatchEvent(new CustomEvent('navigate-to-tab', { detail: tab }));
  };

  const quickActions: QuickAction[] = [
    {
      icon: CheckSquare,
      label: 'New Task',
      shortcut: 'N',
      action: onCreateTask || (() => navigateToTab('tasks')),
      color: 'text-blue-500',
    },
    {
      icon: Clock,
      label: 'Log Time',
      shortcut: 'T',
      action: onLogTime || (() => navigateToTab('time')),
      color: 'text-green-500',
    },
    {
      icon: Palmtree,
      label: 'Request Leave',
      shortcut: 'L',
      action: onRequestLeave || (() => navigateToTab('leave')),
      color: 'text-yellow-500',
    },
    {
      icon: Home,
      label: 'Request WFH',
      shortcut: 'W',
      action: onRequestWfh || (() => navigateToTab('wfh')),
      color: 'text-purple-500',
    },
    {
      icon: Receipt,
      label: 'Add Expense',
      shortcut: 'E',
      action: onAddExpense || (() => navigateToTab('expenses')),
      color: 'text-orange-500',
    },
    {
      icon: Heart,
      label: 'Give Kudos',
      shortcut: 'K',
      action: () => navigateToTab('kudos'),
      color: 'text-pink-500',
    },
    {
      icon: Target,
      label: 'Add Goal',
      shortcut: 'G',
      action: () => navigateToTab('my-goals'),
      color: 'text-cyan-500',
    },
    {
      icon: MessageSquare,
      label: 'Send Message',
      shortcut: 'M',
      action: () => navigateToTab('communication'),
      color: 'text-indigo-500',
    },
  ];

  // Always render as a floating action button widget
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          className={cn(
            'fixed bottom-20 right-4 z-50 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all',
            'bg-primary hover:bg-primary/90',
            className
          )}
        >
          <Zap className={cn('h-6 w-6', isOpen && 'rotate-45 transition-transform')} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-56"
        sideOffset={8}
      >
        <DropdownMenuLabel className="flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Quick Actions
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <DropdownMenuItem
              key={action.label}
              onClick={() => {
                action.action();
                setIsOpen(false);
              }}
              className="cursor-pointer"
            >
              <Icon className={cn('h-4 w-4 mr-2', action.color)} />
              <span className="flex-1">{action.label}</span>
              <kbd className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded">
                {action.shortcut}
              </kbd>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Floating Action Button version for mobile
export function QuickActionsFAB() {
  return <QuickActionsMenu />;
}
