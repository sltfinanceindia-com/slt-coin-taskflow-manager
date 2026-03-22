import Joyride, { CallBackProps, STATUS, ACTIONS } from 'react-joyride';
import { useLocation } from 'react-router-dom';
import { useTour } from '@/hooks/useTour';
import { useUserRole } from '@/hooks/useUserRole';
import { useIsMobile } from '@/hooks/use-mobile';
import { getTourStepsForRole } from '@/config/tourSteps';
import { useMemo } from 'react';

export function GuidedTour() {
  const { isTourRunning, completeTour } = useTour();
  const { role } = useUserRole();
  const location = useLocation();
  const isMobile = useIsMobile();

  const isDashboard = location.pathname === '/dashboard';

  const steps = useMemo(() => {
    return getTourStepsForRole(role || 'employee');
  }, [role]);

  const handleCallback = (data: CallBackProps) => {
    const { status, action } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED || action === ACTIONS.CLOSE) {
      completeTour();
    }
  };

  if (!isTourRunning || !isDashboard || isMobile || steps.length === 0) return null;

  return (
    <Joyride
      steps={steps}
      run={isTourRunning}
      continuous
      showSkipButton
      showProgress
      scrollToFirstStep
      disableOverlayClose
      callback={handleCallback}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Done',
        next: 'Next',
        skip: 'Skip Tour',
      }}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: 'hsl(var(--primary))',
          textColor: 'hsl(var(--foreground))',
          backgroundColor: 'hsl(var(--card))',
          arrowColor: 'hsl(var(--card))',
          overlayColor: 'rgba(0, 0, 0, 0.5)',
        },
        tooltip: {
          borderRadius: '0.75rem',
          padding: '1.25rem',
          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
          fontSize: '0.875rem',
        },
        tooltipTitle: {
          fontSize: '1rem',
          fontWeight: 600,
          marginBottom: '0.5rem',
        },
        tooltipContent: {
          lineHeight: 1.6,
          padding: '0.5rem 0',
        },
        buttonNext: {
          borderRadius: '0.5rem',
          padding: '0.5rem 1rem',
          fontSize: '0.875rem',
          fontWeight: 500,
        },
        buttonBack: {
          borderRadius: '0.5rem',
          padding: '0.5rem 1rem',
          fontSize: '0.875rem',
          fontWeight: 500,
          color: 'hsl(var(--muted-foreground))',
          marginRight: '0.5rem',
        },
        buttonSkip: {
          borderRadius: '0.5rem',
          padding: '0.5rem 1rem',
          fontSize: '0.8125rem',
          color: 'hsl(var(--muted-foreground))',
        },
        spotlight: {
          borderRadius: '0.75rem',
        },
        tooltipFooter: {
          marginTop: '0.75rem',
        },
      }}
      floaterProps={{
        disableAnimation: false,
      }}
    />
  );
}
