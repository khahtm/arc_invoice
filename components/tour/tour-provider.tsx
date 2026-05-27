'use client';

import { createContext, useContext, useCallback, useEffect, useRef } from 'react';
import { useJoyride, EVENTS } from 'react-joyride';
import { tourSteps } from './tour-steps';
import { TourTooltip } from './tour-tooltip';

const TOUR_STORAGE_KEY = 'arc-tour-completed';

interface TourContextValue {
  startTour: () => void;
}

const TourContext = createContext<TourContextValue>({
  startTour: () => {},
});

export const useTour = () => useContext(TourContext);

export function TourProvider({ children }: { children: React.ReactNode }) {
  const autoStarted = useRef(false);

  const { Tour, controls, on } = useJoyride({
    continuous: true,
    steps: tourSteps,
    tooltipComponent: TourTooltip,
    options: {
      overlayColor: 'rgba(0, 0, 0, 0.5)',
      primaryColor: '#005FFE',
      skipBeacon: true,
      zIndex: 10000,
    },
  });

  useEffect(() => {
    return on(EVENTS.TOUR_END, () => {
      localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    });
  }, [on]);

  useEffect(() => {
    if (autoStarted.current) return;
    autoStarted.current = true;
    const completed = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!completed) {
      const timer = setTimeout(() => controls.start(), 1000);
      return () => clearTimeout(timer);
    }
  }, [controls]);

  const startTour = useCallback(() => {
    controls.start();
  }, [controls]);

  return (
    <TourContext.Provider value={{ startTour }}>
      {children}
      {Tour}
    </TourContext.Provider>
  );
}
