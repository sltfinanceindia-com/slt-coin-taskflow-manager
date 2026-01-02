import { StandalonePageLayout } from '@/layouts/StandalonePageLayout';
import { PersonalGoalsWidget } from '@/components/goals/PersonalGoalsWidget';

export default function MyGoalsPage() {
  return (
    <StandalonePageLayout 
      activeTab="my-goals"
      contentClassName="w-full max-w-none px-2 sm:px-4 lg:px-6 xl:px-8 py-2 sm:py-4 lg:py-6"
      useContainer={false}
    >
      <PersonalGoalsWidget />
    </StandalonePageLayout>
  );
}
