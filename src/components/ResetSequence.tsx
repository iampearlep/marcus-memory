'use client';

import React, { useState, useEffect } from 'react';
import { User, Heart, AlertTriangle, Clock, Check } from 'lucide-react';
import { useMemory } from '@/context/MemoryContext';
import { ResetSequenceStep } from '@/types';

interface ResetSequenceProps {
  onComplete: () => void;
}

export function ResetSequence({ onComplete }: ResetSequenceProps) {
  const { state } = useMemory();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const steps: ResetSequenceStep[] = [
    {
      id: '1',
      title: 'Hello',
      content: `Your name is Marcus Chen`,
      priority: 'CRITICAL',
      delay: 1000
    },
    {
      id: '2',
      title: 'Your Condition',
      content: 'You have a memory condition that resets every 48 hours. This app helps you remember.',
      priority: 'CRITICAL',
      delay: 2000
    },
    {
      id: '3',
      title: 'Trust Verification',
      content: 'You left yourself a trust code: SARAH2024. This means you can trust this information.',
      priority: 'CRITICAL',
      delay: 2000
    },
    {
      id: '4',
      title: 'Most Important People',
      content: state.relationships
        .filter(r => r.importance === 'CRITICAL')
        .map(r => `${r.name} - ${r.relation}: ${r.facts?.[0]?.fact || 'Important person'}`)
        .join('\n') || 'No critical relationships saved.',
      priority: 'CRITICAL',
      delay: 3000
    },
    {
      id: '5',
      title: 'Critical Memories',
      content: state.logs
        .filter(l => l.priority === 'CRITICAL')
        .slice(0, 5)
        .map(l => `• ${l.content}`)
        .join('\n') || 'No critical memories from the last cycle.',
      priority: 'HIGH',
      delay: 3000
    },
    {
      id: '6',
      title: 'Recent Important Events',
      content: state.logs
        .filter(l => l.priority === 'HIGH')
        .slice(0, 3)
        .map(l => `• ${l.content}`)
        .join('\n') || 'No high priority memories from the last cycle.',
      priority: 'HIGH',
      delay: 2000
    },
    {
      id: '7',
      title: 'You Are Ready',
      content: 'You have access to all your memories. The timer will start when you\'re ready.',
      priority: 'MEDIUM',
      delay: 2000
    }
  ];

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    if (currentStep < steps.length && isVisible) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, steps[currentStep]?.delay || 2000);

      return () => clearTimeout(timer);
    }
  }, [currentStep, steps, isVisible]);

  const handleSkip = () => {
    setCurrentStep(steps.length);
  };

  const handleComplete = () => {
    onComplete();
  };

  if (!isVisible) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="text-white text-2xl">Initializing...</div>
      </div>
    );
  }

  if (currentStep >= steps.length) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-blue-900 to-blue-600 z-50 flex items-center justify-center text-white p-8">
        <div className="max-w-2xl text-center space-y-6">
          <Check size={64} className="mx-auto text-green-400" />
          <h1 className="text-4xl font-bold">Memory System Ready</h1>
          <p className="text-xl">
            You are Marcus Chen. You are safe. Your memory system is active.
          </p>
          <div className="bg-white/10 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Quick Access:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div>
                <strong>Emergency:</strong> Red button (bottom right)
              </div>
              <div>
                <strong>Log Memory:</strong> Blue "+" button
              </div>
              <div>
                <strong>Your Wife:</strong> Sarah Chen
              </div>
              <div>
                <strong>Doctor:</strong> Dr. Rodriguez (555-0123)
              </div>
            </div>
          </div>
          <button
            onClick={handleComplete}
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-xl hover:bg-gray-100 transition-all"
          >
            Start New Memory Cycle
          </button>
        </div>
      </div>
    );
  }

  const currentStepData = steps[currentStep];
  if (!currentStepData) return null;

  const getStepIcon = () => {
    switch (currentStepData.id) {
      case '1': return User;
      case '2': return AlertTriangle;
      case '3': return Check;
      case '4': return Heart;
      default: return Clock;
    }
  };

  const StepIcon = getStepIcon();

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-gray-900 to-black z-50 flex items-center justify-center text-white p-8">
      <div className="max-w-2xl text-center space-y-8 animate-fade-in">
        <div className="flex items-center justify-center gap-4 mb-6">
          <StepIcon size={48} className="text-blue-400" />
          <div className="text-right">
            <div className="text-sm text-gray-400">
              Step {currentStep + 1} of {steps.length}
            </div>
            <div className="w-32 bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <h1 className="text-4xl font-bold mb-6">{currentStepData.title}</h1>

        <div className="text-xl leading-relaxed whitespace-pre-line bg-white/10 p-6 rounded-lg">
          {currentStepData.content}
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={handleSkip}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-500 rounded-lg transition-all"
          >
            Skip to End
          </button>
        </div>
      </div>
    </div>
  );
}