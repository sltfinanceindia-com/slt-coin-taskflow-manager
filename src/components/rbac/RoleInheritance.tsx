import { useState, useEffect } from 'react';
import {
  GitBranch,
  ChevronRight,
  Shield,
  Users,
  UserCheck,
  User,
  GraduationCap,
  Info,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useCustomRoles } from '@/hooks/useCustomRoles';

const ROLE_HIERARCHY = [
  { role: 'org_admin', label: 'Organization Admin', icon: Shield, level: 5, color: 'bg-purple-500' },
  { role: 'manager', label: 'Manager', icon: Users, level: 4, color: 'bg-blue-500' },
  { role: 'team_lead', label: 'Team Lead', icon: UserCheck, level: 3, color: 'bg-emerald-500' },
  { role: 'employee', label: 'Employee', icon: User, level: 2, color: 'bg-amber-500' },
  { role: 'intern', label: 'Intern', icon: GraduationCap, level: 1, color: 'bg-gray-500' },
];

interface InheritanceSettings {
  enabled: boolean;
  inheritFromParent: Record<string, boolean>;
}

export function RoleInheritance() {
  const { roles } = useCustomRoles();
  
  const [settings, setSettings] = useState<InheritanceSettings>({
    enabled: true,
    inheritFromParent: {
      manager: true,
      team_lead: true,
      employee: true,
      intern: true,
    },
  });

  const toggleInheritance = (role: string) => {
    setSettings((prev) => ({
      ...prev,
      inheritFromParent: {
        ...prev.inheritFromParent,
        [role]: !prev.inheritFromParent[role],
      },
    }));
  };

  const getParentRole = (roleKey: string) => {
    const currentIndex = ROLE_HIERARCHY.findIndex((r) => r.role === roleKey);
    if (currentIndex > 0) {
      return ROLE_HIERARCHY[currentIndex - 1];
    }
    return null;
  };

  const getInheritedPermissions = (roleKey: string): string[] => {
    const inherited: string[] = [];
    let currentRole = roleKey;
    
    while (true) {
      const parent = getParentRole(currentRole);
      if (!parent || !settings.inheritFromParent[currentRole]) break;
      inherited.push(parent.label);
      currentRole = parent.role;
    }
    
    return inherited;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            <CardTitle>Role Inheritance</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Enable Inheritance</span>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({ ...prev, enabled: checked }))
              }
            />
          </div>
        </div>
        <CardDescription>
          Configure how roles inherit permissions from parent roles in the hierarchy
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Hierarchy Visualization */}
          <div className="relative">
            {ROLE_HIERARCHY.map((role, index) => {
              const Icon = role.icon;
              const isFirst = index === 0;
              const inherits = settings.enabled && settings.inheritFromParent[role.role];
              const inheritedFrom = getInheritedPermissions(role.role);
              
              return (
                <div key={role.role} className="relative">
                  {/* Connection Line */}
                  {!isFirst && (
                    <div
                      className={cn(
                        'absolute left-6 -top-3 w-0.5 h-6',
                        inherits ? 'bg-primary' : 'bg-border'
                      )}
                    />
                  )}
                  
                  <div
                    className={cn(
                      'flex items-center gap-4 p-4 rounded-lg border mb-3 transition-all',
                      inherits && !isFirst ? 'border-primary/50 bg-primary/5' : 'bg-card'
                    )}
                  >
                    <div className={cn('p-2 rounded-lg', role.color)}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{role.label}</span>
                        <Badge variant="outline">Level {role.level}</Badge>
                      </div>
                      
                      {settings.enabled && inheritedFrom.length > 0 && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                          <span>Inherits from:</span>
                          {inheritedFrom.map((parent, i) => (
                            <span key={parent}>
                              <span className="text-primary">{parent}</span>
                              {i < inheritedFrom.length - 1 && ' → '}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {!isFirst && (
                      <div className="flex items-center gap-3">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-sm">
                                When enabled, this role automatically inherits all
                                permissions from {getParentRole(role.role)?.label}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <Switch
                          checked={settings.enabled && settings.inheritFromParent[role.role]}
                          onCheckedChange={() => toggleInheritance(role.role)}
                          disabled={!settings.enabled}
                        />
                      </div>
                    )}
                    
                    {isFirst && (
                      <Badge className="bg-primary/20 text-primary">
                        Root Role
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Info Box */}
          <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-foreground mb-1">How Role Inheritance Works</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Child roles automatically receive all permissions from parent roles</li>
                  <li>You can still add role-specific permissions on top of inherited ones</li>
                  <li>Disabling inheritance only affects that specific role</li>
                  <li>Changes are applied immediately to all users with the affected role</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}