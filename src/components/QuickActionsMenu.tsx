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
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();

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

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          size={isMobile ? 'icon' : 'default'}
          className={cn(
            'gap-2 shadow-lg',
            isMobile && 'fixed bottom-20 right-4 z-50 h-14 w-14 rounded-full',
            className
          )}
        >
          <Zap className={cn('h-5 w-5', isOpen && 'rotate-45 transition-transform')} />
          {!isMobile && <span>Quick Actions</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align={isMobile ? 'end' : 'start'} 
        className="w-56"
        sideOffset={isMobile ? 8 : 4}
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
              {action.shortcut && !isMobile && (
                <kbd className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded">
                  {action.shortcut}
                </kbd>
              )}
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
