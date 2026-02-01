/**
 * Breadcrumb Navigation Component
 * Displays hierarchical path: Dashboard > HR > Employees > John Doe
 */

import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function BreadcrumbNav({ items, className }: BreadcrumbNavProps) {
  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center text-sm text-muted-foreground', className)}
    >
      <ol className="flex items-center flex-wrap gap-1">
        {/* Home link */}
        <li className="flex items-center">
          <Link
            to="/dashboard"
            className="flex items-center hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
          >
            <Home className="h-3.5 w-3.5" />
            <span className="sr-only">Dashboard</span>
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center">
              <ChevronRight className="h-3.5 w-3.5 mx-1 text-muted-foreground/50" />
              {item.href && !isLast ? (
                <Link
                  to={item.href}
                  className="hover:text-foreground transition-colors px-1.5 py-0.5 rounded-md hover:bg-muted truncate max-w-[150px]"
                  title={item.label}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    'truncate max-w-[200px] px-1.5 py-0.5',
                    isLast && 'text-foreground font-medium'
                  )}
                  title={item.label}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
