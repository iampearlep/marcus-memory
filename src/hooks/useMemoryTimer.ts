'use client';

import { useState, useEffect, useCallback } from 'react';
import { PhaseType } from '@/types';

interface UseMemoryTimerProps {
  cycleLength: number; // in seconds
  autoStart?: boolean;
  isTimerActive?: boolean;
  onReset: () => void;
  onPhaseChange: (phase: PhaseType) => void;
  onTimerStateChange?: (active: boolean) => void;
}

export function useMemoryTimer({
  cycleLength,
  autoStart = true,
  isTimerActive = true,
  onReset,
  onPhaseChange,
  onTimerStateChange
}: UseMemoryTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(cycleLength);
  const [currentPhase, setCurrentPhase] = useState<PhaseType>('awareness');
  const [isActive, setIsActive] = useState(autoStart && isTimerActive);

  const calculatePhase = useCallback((remaining: number): PhaseType => {
    const total = cycleLength;
    const elapsed = total - remaining;

    if (remaining <= 0) return 'reset';
    if (remaining <= total * 0.17) return 'critical'; // Last 30 seconds of 180
    if (remaining <= total * 0.44) return 'urgency'; // Last 80 seconds of 180
    return 'awareness';
  }, [cycleLength]);

  // Sync with external timer state
  useEffect(() => {
    if (!isTimerActive && isActive) {
      setIsActive(false);
    } else if (isTimerActive && autoStart && !isActive && timeRemaining === cycleLength) {
      setIsActive(true);
    }
  }, [isTimerActive, autoStart, isActive, timeRemaining, cycleLength]);

  const startTimer = useCallback(() => {
    setIsActive(true);
    setTimeRemaining(cycleLength);
    setCurrentPhase('awareness');
    onTimerStateChange?.(true);
  }, [cycleLength, onTimerStateChange]);

  const pauseTimer = useCallback(() => {
    setIsActive(false);
    onTimerStateChange?.(false);
  }, [onTimerStateChange]);

  const resetTimer = useCallback(() => {
    setTimeRemaining(cycleLength);
    setCurrentPhase('awareness');
    setIsActive(autoStart && isTimerActive);
    onReset();
  }, [cycleLength, autoStart, isTimerActive, onReset]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((time) => {
          const newTime = time - 1;
          const newPhase = calculatePhase(newTime);

          if (newPhase !== currentPhase) {
            setCurrentPhase(newPhase);
            onPhaseChange(newPhase);
          }

          if (newTime <= 0) {
            setIsActive(false);
            setTimeout(() => {
              resetTimer();
            }, 3000); // Show reset phase for 3 seconds
            return 0;
          }

          return newTime;
        });
      }, 1000);
    } else if (timeRemaining <= 0) {
      setIsActive(false);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, timeRemaining, currentPhase, calculatePhase, onPhaseChange, resetTimer]);

  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  const getProgressPercentage = useCallback((): number => {
    return ((cycleLength - timeRemaining) / cycleLength) * 100;
  }, [cycleLength, timeRemaining]);

  return {
    timeRemaining,
    currentPhase,
    isActive,
    formatTime: formatTime(timeRemaining),
    progressPercentage: getProgressPercentage(),
    startTimer,
    pauseTimer,
    resetTimer
  };
}