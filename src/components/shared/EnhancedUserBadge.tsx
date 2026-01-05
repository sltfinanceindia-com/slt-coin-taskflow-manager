import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Building2, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedUserBadgeProps {
  user: {
    id?: string;
    full_name?: string;
    email?: string;
    avatar_url?: string | null;
    employee_id?: string;
    department?: {
      name?: string;
    } | null;
    department_name?: string;
  } | null;
  showDepartment?: boolean;
  showEmployeeId?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

export function EnhancedUserBadge({
  user,
  showDepartment = true,
  showEmployeeId = true,
  size = 'md',
  className,
  onClick,
}: EnhancedUserBadgeProps) {
  if (!user) return null;

  const avatarSizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const departmentName = user.department?.name || user.department_name;

  return (
    <div 
      className={cn(
        "flex items-center gap-2",
        onClick && "cursor-pointer hover:bg-muted/50 rounded-md p-1 -m-1",
        className
      )}
      onClick={onClick}
    >
      <Avatar className={avatarSizes[size]}>
        <AvatarImage src={user.avatar_url || undefined} alt={user.full_name || ''} />
        <AvatarFallback className="bg-muted">
          {user.full_name?.charAt(0)?.toUpperCase() || <User className="h-3 w-3" />}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-1.5">
          <span className={cn("font-medium truncate", textSizes[size])}>
            {user.full_name || 'Unknown User'}
          </span>
          {showEmployeeId && user.employee_id && (
            <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 shrink-0">
              {user.employee_id}
            </Badge>
          )}
        </div>
        {showDepartment && departmentName && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <Building2 className="h-3 w-3 shrink-0" />
            <span className={cn("truncate", size === 'sm' ? 'text-[10px]' : 'text-xs')}>
              {departmentName}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// Compact version for tables and lists
export function CompactUserBadge({
  user,
  className,
}: {
  user: { full_name?: string; employee_id?: string; avatar_url?: string | null } | null;
  className?: string;
}) {
  if (!user) return null;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Avatar className="h-6 w-6">
        <AvatarImage src={user.avatar_url || undefined} alt={user.full_name || ''} />
        <AvatarFallback className="text-xs bg-muted">
          {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>
      <span className="text-sm truncate">{user.full_name}</span>
      {user.employee_id && (
        <span className="text-xs text-muted-foreground">({user.employee_id})</span>
      )}
    </div>
  );
}
