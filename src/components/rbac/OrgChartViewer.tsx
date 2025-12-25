import { useState, useMemo } from 'react';
import {
  ChevronDown,
  ChevronRight,
  User,
  Users,
  UserCheck,
  Shield,
  GraduationCap,
  MoreVertical,
  Mail,
  Phone,
  Building2,
  Search,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { cn } from '@/lib/utils';
import { useOrgChart } from '@/hooks/useReportingStructure';

interface OrgNode {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  role?: string;
  department_name?: string;
  job_title?: string;
  children?: OrgNode[];
}

const ROLE_ICONS: Record<string, React.ElementType> = {
  org_admin: Shield,
  admin: Shield,
  manager: Users,
  team_lead: UserCheck,
  employee: User,
  intern: GraduationCap,
};

const ROLE_COLORS: Record<string, string> = {
  org_admin: 'border-purple-500 bg-purple-50 dark:bg-purple-950',
  admin: 'border-purple-500 bg-purple-50 dark:bg-purple-950',
  manager: 'border-blue-500 bg-blue-50 dark:bg-blue-950',
  team_lead: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950',
  employee: 'border-amber-500 bg-amber-50 dark:bg-amber-950',
  intern: 'border-gray-400 bg-gray-50 dark:bg-gray-900',
};

interface OrgNodeCardProps {
  node: OrgNode;
  isExpanded: boolean;
  onToggle: () => void;
  hasChildren: boolean;
  onSelectUser?: (userId: string) => void;
}

function OrgNodeCard({ node, isExpanded, onToggle, hasChildren, onSelectUser }: OrgNodeCardProps) {
  const Icon = ROLE_ICONS[node.role || 'employee'] || User;
  const colorClass = ROLE_COLORS[node.role || 'employee'] || ROLE_COLORS.employee;

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Card
          className={cn(
            'w-[200px] cursor-pointer transition-all hover:shadow-md border-l-4',
            colorClass
          )}
        >
          <CardContent className="p-3">
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage src={node.avatar_url} alt={node.full_name} />
                <AvatarFallback className="bg-muted">
                  {node.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{node.full_name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {node.job_title || node.role}
                </p>
                {node.department_name && (
                  <Badge variant="outline" className="text-xs mt-1">
                    {node.department_name}
                  </Badge>
                )}
              </div>
              {hasChildren && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggle();
                  }}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </HoverCardTrigger>
      <HoverCardContent className="w-80" side="right">
        <div className="flex gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={node.avatar_url} alt={node.full_name} />
            <AvatarFallback className="text-lg">
              {node.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h4 className="font-semibold">{node.full_name}</h4>
            <p className="text-sm text-muted-foreground">{node.job_title || node.role}</p>
            {node.department_name && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Building2 className="h-3 w-3" />
                {node.department_name}
              </div>
            )}
            {node.email && (
              <div className="flex items-center gap-1 text-sm">
                <Mail className="h-3 w-3 text-muted-foreground" />
                <a href={`mailto:${node.email}`} className="text-primary hover:underline">
                  {node.email}
                </a>
              </div>
            )}
            {node.phone && (
              <div className="flex items-center gap-1 text-sm">
                <Phone className="h-3 w-3 text-muted-foreground" />
                {node.phone}
              </div>
            )}
            <div className="pt-2">
              <Badge>
                <Icon className="h-3 w-3 mr-1" />
                {node.role}
              </Badge>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

interface OrgTreeNodeProps {
  node: OrgNode;
  expandedNodes: Set<string>;
  toggleNode: (id: string) => void;
  onSelectUser?: (userId: string) => void;
  level?: number;
}

function OrgTreeNode({ node, expandedNodes, toggleNode, onSelectUser, level = 0 }: OrgTreeNodeProps) {
  const isExpanded = expandedNodes.has(node.id);
  const hasChildren = (node.children?.length || 0) > 0;

  return (
    <div className="flex flex-col items-center">
      <OrgNodeCard
        node={node}
        isExpanded={isExpanded}
        onToggle={() => toggleNode(node.id)}
        hasChildren={hasChildren}
        onSelectUser={onSelectUser}
      />
      
      {hasChildren && isExpanded && (
        <>
          {/* Vertical connector */}
          <div className="w-px h-6 bg-border" />
          
          {/* Horizontal connector line */}
          {node.children!.length > 1 && (
            <div
              className="h-px bg-border"
              style={{
                width: `${(node.children!.length - 1) * 220}px`,
              }}
            />
          )}
          
          {/* Children */}
          <div className="flex gap-5 pt-6">
            {node.children!.map((child, index) => (
              <div key={child.id} className="flex flex-col items-center">
                {/* Vertical connector to child */}
                <div className="w-px h-6 bg-border -mt-6" />
                <OrgTreeNode
                  node={child}
                  expandedNodes={expandedNodes}
                  toggleNode={toggleNode}
                  onSelectUser={onSelectUser}
                  level={level + 1}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

interface OrgChartViewerProps {
  onSelectUser?: (userId: string) => void;
}

export function OrgChartViewer({ onSelectUser }: OrgChartViewerProps) {
  const { data: orgData, isLoading } = useOrgChart();
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  // Build tree structure from flat data
  const orgTree = useMemo(() => {
    if (!orgData) return null;

    const nodesMap = new Map<string, OrgNode>();
    const rootNodes: OrgNode[] = [];

    // First pass: create all nodes
    orgData.forEach((user: any) => {
      nodesMap.set(user.id, {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        avatar_url: user.avatar_url,
        role: user.role,
        department_name: user.departments?.name,
        job_title: user.job_title,
        children: [],
      });
    });

    // Second pass: build tree structure
    orgData.forEach((user: any) => {
      const node = nodesMap.get(user.id)!;
      if (user.reporting_manager_id && nodesMap.has(user.reporting_manager_id)) {
        const parent = nodesMap.get(user.reporting_manager_id)!;
        parent.children = parent.children || [];
        parent.children.push(node);
      } else {
        rootNodes.push(node);
      }
    });

    // Sort children by role hierarchy
    const roleOrder = ['org_admin', 'admin', 'manager', 'team_lead', 'employee', 'intern'];
    const sortChildren = (nodes: OrgNode[]) => {
      nodes.sort((a, b) => {
        const aIndex = roleOrder.indexOf(a.role || 'employee');
        const bIndex = roleOrder.indexOf(b.role || 'employee');
        return aIndex - bIndex;
      });
      nodes.forEach((node) => {
        if (node.children?.length) {
          sortChildren(node.children);
        }
      });
    };
    sortChildren(rootNodes);

    return rootNodes;
  }, [orgData]);

  const toggleNode = (id: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    if (!orgData) return;
    setExpandedNodes(new Set(orgData.map((u: any) => u.id)));
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  // Filter nodes by search
  const filteredTree = useMemo(() => {
    if (!searchQuery || !orgTree) return orgTree;

    const filterNodes = (nodes: OrgNode[]): OrgNode[] => {
      return nodes
        .map((node) => {
          const matchesSearch =
            node.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            node.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            node.department_name?.toLowerCase().includes(searchQuery.toLowerCase());

          const filteredChildren = node.children ? filterNodes(node.children) : [];

          if (matchesSearch || filteredChildren.length > 0) {
            return { ...node, children: filteredChildren };
          }
          return null;
        })
        .filter(Boolean) as OrgNode[];
    };

    return filterNodes(orgTree);
  }, [orgTree, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!filteredTree || filteredTree.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="text-center py-16">
          <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="text-lg font-semibold mb-2">No Organization Structure Found</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {searchQuery 
              ? `No employees match "${searchQuery}". Try a different search term.`
              : "Your organization chart is empty. Start building your team hierarchy by assigning reporting managers to employees."
            }
          </p>
          
          {!searchQuery && (
            <div className="bg-muted/50 rounded-lg p-6 max-w-lg mx-auto text-left space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-primary" />
                How to Build Your Org Chart
              </h4>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">1</span>
                  <span>Go to <strong className="text-foreground">Settings → Roles & Permissions</strong></span>
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">2</span>
                  <span>Click <strong className="text-foreground">"Assign Manager"</strong> next to each employee</span>
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">3</span>
                  <span>Select their reporting manager from the dropdown</span>
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">4</span>
                  <span>The org chart will automatically display the hierarchy</span>
                </li>
              </ol>
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  <strong>Tip:</strong> Start from the top by first assigning department heads, then their direct reports.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={expandAll}>
            Expand All
          </Button>
          <Button variant="outline" size="sm" onClick={collapseAll}>
            Collapse All
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-sm">
        {Object.entries(ROLE_ICONS).map(([role, Icon]) => (
          <div key={role} className="flex items-center gap-1.5">
            <div className={cn('w-3 h-3 rounded-full', ROLE_COLORS[role]?.split(' ')[0]?.replace('border-', 'bg-'))} />
            <span className="capitalize">{role.replace('_', ' ')}</span>
          </div>
        ))}
      </div>

      {/* Tree View */}
      <div className="overflow-auto pb-8">
        <div className="inline-flex flex-col items-center min-w-full pt-4">
          {filteredTree.map((root) => (
            <OrgTreeNode
              key={root.id}
              node={root}
              expandedNodes={expandedNodes}
              toggleNode={toggleNode}
              onSelectUser={onSelectUser}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
