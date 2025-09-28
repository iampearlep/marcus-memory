'use client';

import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useMemory } from '@/context/MemoryContext';

export function EmergencyButton() {
  const { setConfused, state } = useMemory();
  const [showConfused, setShowConfused] = useState(false);

  const handleEmergencyClick = () => {
    setConfused(true);
    setShowConfused(true);
  };

  const handleCloseConfused = () => {
    setConfused(false);
    setShowConfused(false);
  };

  if (showConfused || state.isConfused) {
    return (
      <div className="fixed inset-0 bg-red-600 z-50 p-8 flex flex-col items-center justify-center text-white">
        <AlertTriangle size={64} className="mb-6 animate-pulse" />

        <h1 className="text-4xl font-bold mb-6 text-center">
          YOU ARE SAFE
        </h1>

        <div className="max-w-lg text-center space-y-4 text-lg">
          <p><strong>Your name is Marcus Chen</strong></p>
          <p>You have a memory condition that resets every 48 hours</p>
          <p><strong>Sarah is your wife</strong> - she loves you</p>
          <p>This app helps you remember important things</p>
          <p><strong>Dr. Rodriguez</strong> is your doctor: 555-0123</p>
        </div>

        <div className="mt-8 space-y-4 w-full max-w-md">
          <div className="bg-white/20 p-4 rounded-lg">
            <h3 className="font-bold mb-2">Critical Relationships:</h3>
            {state.relationships
              .filter(r => r.importance === 'CRITICAL')
              .map(r => (
                <div key={r.id} className="mb-2">
                  <strong>{r.name}</strong> - {r.relation}
                  <br />
                  <small>{r.keyFacts[0]}</small>
                </div>
              ))}
          </div>

          <div className="bg-white/20 p-4 rounded-lg">
            <h3 className="font-bold mb-2">Recent Critical Memories:</h3>
            {state.logs
              .filter(l => l.priority === 'CRITICAL')
              .slice(0, 3)
              .map(l => (
                <div key={l.id} className="mb-2 text-sm">
                  {l.content}
                </div>
              ))}
          </div>
        </div>

        <button
          onClick={handleCloseConfused}
          className="mt-8 px-8 py-4 bg-white text-red-600 rounded-lg font-bold text-xl hover:bg-gray-100"
        >
          I Remember Now
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleEmergencyClick}
      className="fixed bottom-6 right-6 bg-red-500 hover:bg-red-600 text-white p-4 rounded-full shadow-lg z-40 transition-all"
      title="I'm Confused - Show Critical Info"
    >
      <AlertTriangle size={24} />
    </button>
  );
}