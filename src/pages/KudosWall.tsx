import { AppSidebar } from '@/components/AppSidebar';
import { AppHeader } from '@/components/AppHeader';
import { SidebarProvider } from '@/components/ui/sidebar';
import { BottomNavigation } from '@/components/BottomNavigation';
import { KudosWall as KudosWallComponent } from '@/components/kudos/KudosWall';
import { useIsMobile } from '@/hooks/use-mobile';

export default function KudosWallPage() {
  const isMobile = useIsMobile();
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-background">
        <AppSidebar activeTab="kudos" onTabChange={() => {}} />
        
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <AppHeader />
          
          <main className="flex-1 overflow-auto pb-20 md:pb-0">
            <div className="w-full max-w-none px-2 sm:px-4 lg:px-6 xl:px-8 py-2 sm:py-4 lg:py-6">
              <KudosWallComponent />
            </div>
          </main>
        </div>
        
        {isMobile && <BottomNavigation variant="private" activeTab="kudos" onTabChange={() => {}} />}
      </div>
    </SidebarProvider>
  );
}