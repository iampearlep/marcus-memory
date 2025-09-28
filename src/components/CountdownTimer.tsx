'use client';

import React from 'react';
import { Clock, AlertTriangle, Zap } from 'lucide-react';
import { PhaseType } from '@/types';

interface CountdownTimerProps {
  timeRemaining: number;
  totalTime: number;
  currentPhase: PhaseType;
  formatTime: string;
  progressPercentage: number;
  onStart: () => void;
  onPause: () => void;
  isActive: boolean;
}

export function CountdownTimer({
  timeRemaining,
  totalTime,
  currentPhase,
  formatTime,
  progressPercentage,
  isActive
}: Omit<CountdownTimerProps, 'onStart' | 'onPause'>) {
  const getPhaseConfig = () => {
    switch (currentPhase) {
      case 'critical':
        return {
          bgColor: 'bg-gradient-to-r from-red-500 to-red-600',
          textColor: 'text-white',
          pulseClass: 'animate-pulse',
          icon: AlertTriangle,
          message: 'MEMORY RESET IMMINENT',
          progressColor: 'bg-red-300'
        };
      case 'urgency':
        return {
          bgColor: 'bg-gradient-to-r from-orange-500 to-orange-600',
          textColor: 'text-white',
          pulseClass: 'animate-bounce',
          icon: Zap,
          message: 'Memory degradation beginning',
          progressColor: 'bg-orange-300'
        };
      case 'reset':
        return {
          bgColor: 'bg-gradient-to-r from-gray-800 to-black',
          textColor: 'text-white',
          pulseClass: 'animate-pulse',
          icon: AlertTriangle,
          message: 'RESETTING...',
          progressColor: 'bg-gray-300'
        };
      default: // awareness
        return {
          bgColor: 'bg-gradient-to-r from-blue-500 to-blue-600',
          textColor: 'text-white',
          pulseClass: '',
          icon: Clock,
          message: 'Awareness Phase - Memory Safe',
          progressColor: 'bg-blue-300'
        };
    }
  };

  const config = getPhaseConfig();
  const IconComponent = config.icon;

  const getTimeUrgency = () => {
    if (timeRemaining <= 30) return 'text-6xl font-black';
    if (timeRemaining <= 60) return 'text-5xl font-bold';
    return 'text-4xl font-semibold';
  };

  return (
    <div className={`rounded-2xl p-8 text-center ${config.bgColor} ${config.textColor} ${config.pulseClass}`}>
      <div className="flex items-center justify-center gap-3 mb-4">
        <IconComponent size={32} />
        <h2 className="text-xl font-bold">{config.message}</h2>
      </div>

      <div className={`${getTimeUrgency()} mb-6 font-mono flex items-center justify-center gap-4`}>
        <div className="text-center">
          <div className="text-lg opacity-75">Time Remaining</div>
          <div className="text-current">{formatTime}</div>
        </div>
        <div className="text-center">
          <div className="text-lg opacity-75">Seconds</div>
          <div className="text-current">{timeRemaining}s</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-white/20 rounded-full h-4 mb-6 overflow-hidden">
        <div
          className={`h-full ${config.progressColor} transition-all duration-1000 ease-linear`}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Phase Info */}
      <div className="text-sm opacity-90 mb-4">
        Phase: {currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)}
        {currentPhase === 'critical' && (
          <div className="mt-2 text-yellow-200 font-semibold">
            LOG CRITICAL INFO NOW!
          </div>
        )}
      </div>

      {/* Timer Status */}
      <div className="text-center">
        <div className="text-sm opacity-90">
          {isActive ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              Timer Active
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-white/50 rounded-full"></div>
              Timer Paused
            </span>
          )}
        </div>
      </div>
    </div>
  );
}