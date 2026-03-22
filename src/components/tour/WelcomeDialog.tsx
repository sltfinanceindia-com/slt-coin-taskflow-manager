import { useLocation } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, X } from 'lucide-react';
import { useTour } from '@/hooks/useTour';

export function WelcomeDialog() {
  const { shouldShowWelcome, startTour, dismissWelcome } = useTour();
  const location = useLocation();

  const isDashboard = location.pathname === '/dashboard';

  if (!isDashboard) return null;

  return (
    <Dialog open={shouldShowWelcome} onOpenChange={(open) => { if (!open) dismissWelcome(); }}>
      <DialogContent className="sm:max-w-md" data-testid="welcome-tour-dialog">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-7 w-7 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">Welcome to TeneXA!</DialogTitle>
          <DialogDescription className="text-center text-sm leading-relaxed">
            Take a quick guided tour to discover the key features of your workspace. It only takes about a minute and will help you get started faster.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-2">
          <Button
            variant="outline"
            onClick={dismissWelcome}
            className="w-full sm:w-auto"
            data-testid="button-skip-tour"
          >
            <X className="h-4 w-4 mr-2" />
            Skip for now
          </Button>
          <Button
            onClick={startTour}
            className="w-full sm:w-auto"
            data-testid="button-start-tour"
          >
            <ArrowRight className="h-4 w-4 mr-2" />
            Start Tour
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
