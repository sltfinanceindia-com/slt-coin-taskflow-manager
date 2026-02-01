import { ReactNode } from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { AppHeader } from '@/components/AppHeader';
import { SidebarProvider } from '@/components/ui/sidebar';
import { BottomNavigation } from '@/components/BottomNavigation';
import { BreadcrumbNav, BreadcrumbItem } from '@/components/navigation/BreadcrumbNav';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface StandalonePageLayoutProps {
  activeTab: string;
  children: ReactNode;
  className?: string;
  /** Custom padding classes for the main content area */
  contentClassName?: string;
  /** Whether to use container with max-width (default: true) */
  useContainer?: boolean;
  /** Whether to show bottom navigation on mobile (default: true) */
  showBottomNav?: boolean;
  /** Breadcrumb items for navigation trail */
  breadcrumbs?: BreadcrumbItem[];
}

/**
 * Reusable layout component for standalone pages
 * Provides consistent structure with sidebar, header, and bottom navigation
 */
export function StandalonePageLayout({
  activeTab,
  children,
  className,
  contentClassName,
  useContainer = true,
  showBottomNav = true,
  breadcrumbs,
}: StandalonePageLayoutProps) {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider>
      <div className={cn("flex min-h-screen w-full bg-gradient-background", className)}>
        <AppSidebar activeTab={activeTab} />
        
        <div className="flex-1 flex flex-col min-w-0">
          <AppHeader />
          
          <main id="main-content" className="flex-1 overflow-auto pb-20 md:pb-0">
            {useContainer ? (
              <div className={cn(
                "container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-6 max-w-7xl",
                contentClassName
              )}>
                {breadcrumbs && breadcrumbs.length > 0 && (
                  <BreadcrumbNav items={breadcrumbs} className="mb-4" />
                )}
                {children}
              </div>
            ) : (
              <div className={cn("w-full", contentClassName)}>
                {children}
              </div>
            )}
          </main>

          {showBottomNav && isMobile && (
            <BottomNavigation variant="private" activeTab={activeTab} />
          )}
        </div>
      </div>
    </SidebarProvider>
  );
}
