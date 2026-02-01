/**
 * Organization Switcher Component
 * Dropdown for super admins to switch between organizations
 */

import { useState } from 'react';
import { Building2, ChevronDown, Plus, Settings, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUserRole } from '@/hooks/useUserRole';
import { useOrganization } from '@/hooks/useOrganization';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface OrganizationSwitcherProps {
  className?: string;
}

export function OrganizationSwitcher({ className }: OrganizationSwitcherProps) {
  const navigate = useNavigate();
  const { isSuperAdmin } = useUserRole();
  const { organization } = useOrganization();
  const [open, setOpen] = useState(false);

  // Fetch all organizations (only for super admin)
  const { data: organizations, isLoading } = useQuery({
    queryKey: ['all-organizations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name, slug, logo_url')
        .order('name');

      if (error) throw error;
      return data;
    },
    enabled: isSuperAdmin,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Non-super admins just see their org name
  if (!isSuperAdmin) {
    return (
      <div className={cn('flex items-center gap-2 px-2', className)}>
        <Avatar className="h-6 w-6">
          <AvatarImage src={organization?.logo_url || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            {organization?.name?.charAt(0).toUpperCase() || 'O'}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium truncate max-w-[120px]">
          {organization?.name || 'Organization'}
        </span>
      </div>
    );
  }

  const handleViewOrg = (orgId: string) => {
    navigate(`/super-admin/organizations/${orgId}`);
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'h-8 sm:h-9 gap-2 px-2 sm:px-3 rounded-lg transition-all max-w-[180px]',
            className
          )}
        >
          <Avatar className="h-5 w-5 shrink-0">
            <AvatarImage src={organization?.logo_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
              {organization?.name?.charAt(0).toUpperCase() || 'O'}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs font-medium truncate hidden sm:inline">
            {organization?.name || 'All Orgs'}
          </span>
          <ChevronDown className="h-3 w-3 opacity-50 shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Organizations
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {isLoading ? (
          <div className="p-2 space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          <div className="max-h-[300px] overflow-y-auto">
            {organizations?.map(org => (
              <DropdownMenuItem
                key={org.id}
                onClick={() => handleViewOrg(org.id)}
                className="cursor-pointer flex items-center gap-2"
              >
                <Avatar className="h-6 w-6 shrink-0">
                  <AvatarImage src={org.logo_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {org.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="flex-1 truncate">{org.name}</span>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              </DropdownMenuItem>
            ))}
          </div>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            navigate('/super-admin/organizations/new');
            setOpen(false);
          }}
          className="cursor-pointer"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Organization
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            navigate('/super-admin/organizations');
            setOpen(false);
          }}
          className="cursor-pointer"
        >
          <Settings className="mr-2 h-4 w-4" />
          Manage All Organizations
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
