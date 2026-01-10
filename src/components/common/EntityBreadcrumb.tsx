import { Link } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Home, Briefcase, FolderOpen, FileText, CheckSquare } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ElementType;
}

interface EntityBreadcrumbProps {
  items: BreadcrumbItem[];
}

export function EntityBreadcrumb({ items }: EntityBreadcrumbProps) {
  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/dashboard" className="flex items-center gap-1.5">
              <Home className="h-4 w-4" />
              Dashboard
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const Icon = item.icon;
          
          return (
            <div key={index} className="flex items-center gap-1.5">
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="flex items-center gap-1.5">
                    {Icon && <Icon className="h-4 w-4" />}
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={item.href || '#'} className="flex items-center gap-1.5">
                      {Icon && <Icon className="h-4 w-4" />}
                      {item.label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

// Pre-built breadcrumb patterns for common entities
export function PortfolioBreadcrumb({ portfolioName }: { portfolioName: string }) {
  return (
    <EntityBreadcrumb
      items={[
        { label: 'Portfolios', href: '/dashboard?tab=projects', icon: Briefcase },
        { label: portfolioName, icon: Briefcase },
      ]}
    />
  );
}

export function ProgramBreadcrumb({ 
  portfolioName, 
  portfolioId, 
  programName 
}: { 
  portfolioName: string; 
  portfolioId: string; 
  programName: string;
}) {
  return (
    <EntityBreadcrumb
      items={[
        { label: 'Portfolios', href: '/dashboard?tab=projects', icon: Briefcase },
        { label: portfolioName, href: `/portfolios/${portfolioId}`, icon: Briefcase },
        { label: programName, icon: FolderOpen },
      ]}
    />
  );
}

export function ProjectBreadcrumb({ 
  portfolioName,
  portfolioId,
  programName, 
  programId, 
  projectName 
}: { 
  portfolioName?: string;
  portfolioId?: string;
  programName?: string; 
  programId?: string; 
  projectName: string;
}) {
  const items: BreadcrumbItem[] = [
    { label: 'Projects', href: '/dashboard?tab=projects', icon: FolderOpen },
  ];
  
  if (portfolioName && portfolioId) {
    items.push({ label: portfolioName, href: `/portfolios/${portfolioId}`, icon: Briefcase });
  }
  
  if (programName && programId) {
    items.push({ label: programName, href: `/programs/${programId}`, icon: FolderOpen });
  }
  
  items.push({ label: projectName, icon: FileText });
  
  return <EntityBreadcrumb items={items} />;
}

export function TaskBreadcrumb({ 
  projectName, 
  projectId, 
  taskTitle 
}: { 
  projectName?: string; 
  projectId?: string; 
  taskTitle: string;
}) {
  const items: BreadcrumbItem[] = [
    { label: 'Tasks', href: '/dashboard?tab=tasks', icon: CheckSquare },
  ];
  
  if (projectName && projectId) {
    items.push({ label: projectName, href: `/projects/${projectId}`, icon: FolderOpen });
  }
  
  items.push({ label: taskTitle, icon: CheckSquare });
  
  return <EntityBreadcrumb items={items} />;
}

export default EntityBreadcrumb;