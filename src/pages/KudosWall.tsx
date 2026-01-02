import { StandalonePageLayout } from '@/layouts/StandalonePageLayout';
import { KudosWall as KudosWallComponent } from '@/components/kudos/KudosWall';

export default function KudosWallPage() {
  return (
    <StandalonePageLayout 
      activeTab="kudos"
      contentClassName="w-full max-w-none px-2 sm:px-4 lg:px-6 xl:px-8 py-2 sm:py-4 lg:py-6"
      useContainer={false}
    >
      <KudosWallComponent />
    </StandalonePageLayout>
  );
}
