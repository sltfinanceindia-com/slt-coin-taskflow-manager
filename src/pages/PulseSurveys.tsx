import { StandalonePageLayout } from '@/layouts/StandalonePageLayout';
import { PulseSurveyAdmin } from '@/components/pulse/PulseSurveyAdmin';
import { PulseSurveyWidget } from '@/components/pulse/PulseSurveyWidget';
import { useUserRole } from '@/hooks/useUserRole';

export default function PulseSurveysPage() {
  const { isAdmin } = useUserRole();

  return (
    <StandalonePageLayout 
      activeTab="pulse-surveys"
      contentClassName="w-full max-w-none px-2 sm:px-4 lg:px-6 xl:px-8 py-2 sm:py-4 lg:py-6"
      useContainer={false}
    >
      {isAdmin ? <PulseSurveyAdmin /> : <PulseSurveyWidget />}
    </StandalonePageLayout>
  );
}
