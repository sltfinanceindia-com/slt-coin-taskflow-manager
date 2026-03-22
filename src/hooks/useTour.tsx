import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { AppRole } from '@/hooks/useUserRole';

const TOUR_STORAGE_KEY = 'tenexa-tour-completed';
const TOUR_FIRST_LOGIN_KEY = 'tenexa-first-login-tour-offered';

interface TourContextType {
  isTourRunning: boolean;
  hasCompletedTour: boolean;
  shouldShowWelcome: boolean;
  startTour: () => void;
  stopTour: () => void;
  completeTour: () => void;
  resetTour: () => void;
  dismissWelcome: () => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

interface TourProviderProps {
  children: React.ReactNode;
  userId: string | undefined;
}

export function TourStateProvider({ children, userId }: TourProviderProps) {
  const [isTourRunning, setIsTourRunning] = useState(false);
  const [hasCompletedTour, setHasCompletedTour] = useState(true);
  const [shouldShowWelcome, setShouldShowWelcome] = useState(false);

  useEffect(() => {
    if (!userId) {
      setHasCompletedTour(true);
      setShouldShowWelcome(false);
      return;
    }

    const completedKey = `${TOUR_STORAGE_KEY}-${userId}`;
    const offeredKey = `${TOUR_FIRST_LOGIN_KEY}-${userId}`;

    const completed = localStorage.getItem(completedKey) === 'true';
    const offered = localStorage.getItem(offeredKey) === 'true';

    setHasCompletedTour(completed);

    if (!completed && !offered) {
      const timer = setTimeout(() => {
        setShouldShowWelcome(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [userId]);

  const startTour = useCallback(() => {
    setShouldShowWelcome(false);
    if (userId) {
      localStorage.setItem(`${TOUR_FIRST_LOGIN_KEY}-${userId}`, 'true');
    }
    setTimeout(() => setIsTourRunning(true), 300);
  }, [userId]);

  const stopTour = useCallback(() => {
    setIsTourRunning(false);
  }, []);

  const completeTour = useCallback(() => {
    setIsTourRunning(false);
    setHasCompletedTour(true);
    if (userId) {
      localStorage.setItem(`${TOUR_STORAGE_KEY}-${userId}`, 'true');
      localStorage.setItem(`${TOUR_FIRST_LOGIN_KEY}-${userId}`, 'true');
    }
  }, [userId]);

  const resetTour = useCallback(() => {
    if (userId) {
      localStorage.removeItem(`${TOUR_STORAGE_KEY}-${userId}`);
      localStorage.removeItem(`${TOUR_FIRST_LOGIN_KEY}-${userId}`);
    }
    setHasCompletedTour(false);
    setIsTourRunning(false);
    setTimeout(() => setIsTourRunning(true), 300);
  }, [userId]);

  const dismissWelcome = useCallback(() => {
    setShouldShowWelcome(false);
    if (userId) {
      localStorage.setItem(`${TOUR_FIRST_LOGIN_KEY}-${userId}`, 'true');
    }
  }, [userId]);

  return (
    <TourContext.Provider value={{
      isTourRunning,
      hasCompletedTour,
      shouldShowWelcome,
      startTour,
      stopTour,
      completeTour,
      resetTour,
      dismissWelcome,
    }}>
      {children}
    </TourContext.Provider>
  );
}

export function useTour() {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within a TourStateProvider');
  }
  return context;
}
