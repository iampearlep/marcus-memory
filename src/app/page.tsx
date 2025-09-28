/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useCallback } from 'react';
import { MemoryProvider, useMemory } from '@/context/MemoryContext';
import { useMemoryTimer } from '@/hooks/useMemoryTimer';
import { CountdownTimer } from '@/components/CountdownTimer';
import { LogForm } from '@/components/LogForm';
import { LogList } from '@/components/LogList';
import { RelationshipList } from '@/components/RelationshipCard';
import { RelationshipForm } from '@/components/RelationshipForm';
import { HobbyList } from '@/components/HobbyCard';
import { PlaceList } from '@/components/PlaceCard';
import { ResetSequence } from '@/components/ResetSequence';
import { EmergencyButton } from '@/components/EmergencyButton';
import { Plus, Users, Clock, List, Menu, X, Camera, MapPin, UserPlus, Heart, Home } from 'lucide-react';

function MemoryApp() {
  const { state, resetCycle, setPhase, addLog, setTimerActive } = useMemory();
  const [showLogForm, setShowLogForm] = useState(false);
  const [showRelationshipForm, setShowRelationshipForm] = useState(false);
  const [editingRelationship, setEditingRelationship] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'timer' | 'logs' | 'relationships' | 'hobbies' | 'places'>('timer');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showResetSequence, setShowResetSequence] = useState(false);

  const handleReset = useCallback(() => {
    setShowResetSequence(true);
  }, []);

  const handlePhaseChange = useCallback((phase: 'awareness' | 'urgency' | 'critical' | 'reset') => {
    // Use setTimeout to avoid setState during render
    setTimeout(() => {
      setPhase(phase);
      if (phase === 'reset') {
        handleReset();
      }
    }, 0);
  }, [setPhase, handleReset]);

  const {
    timeRemaining,
    currentPhase,
    isActive,
    formatTime,
    progressPercentage
  } = useMemoryTimer({
    cycleLength: state.user.cycleLength,
    autoStart: state.user.autoStart,
    isTimerActive: state.user.isTimerActive,
    onReset: handleReset,
    onPhaseChange: handlePhaseChange,
    onTimerStateChange: setTimerActive
  });

  const handleResetComplete = () => {
    setShowResetSequence(false);
    resetCycle();
  };

  const getQuickLogButtons = () => {
    if (currentPhase === 'critical') {
      return [
        { text: 'SARAH IS MY WIFE', priority: 'CRITICAL' as const, category: 'relationships' as const },
        { text: 'AWS PASSWORD: temp123', priority: 'CRITICAL' as const, category: 'work' as const },
        { text: 'MEETING AT 2PM', priority: 'CRITICAL' as const, category: 'work' as const }
      ];
    }
    return [];
  };

  const handleQuickLog = (text: string, priority: 'CRITICAL', category: 'relationships' | 'work') => {
    addLog({
      content: text,
      priority,
      category,
      isEmergency: true,
      isPersistent: true // Critical logs should persist
    });
  };

  const handleAddRelationship = () => {
    setEditingRelationship(null);
    setShowRelationshipForm(true);
  };

  const handleEditRelationship = (relationship: any) => {
    setEditingRelationship(relationship);
    setShowRelationshipForm(true);
  };

  const handleRelationshipFormClose = () => {
    setShowRelationshipForm(false);
    setEditingRelationship(null);
  };

  if (showResetSequence) {
    return <ResetSequence onComplete={handleResetComplete} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Clock size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Memory Assistant
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Hello, {state.user.name} • Cycle #{state.user.currentCycle}
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-2">
              {[
                { id: 'timer', label: 'Timer', icon: Clock },
                { id: 'logs', label: 'Memories', icon: List },
                { id: 'relationships', label: 'People', icon: Users },
                { id: 'hobbies', label: 'Hobbies', icon: Camera },
                { id: 'places', label: 'Places', icon: MapPin }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-white/50 dark:text-gray-300 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-white/50 dark:text-gray-300 dark:hover:bg-gray-700/50 transition-all"
            >
              {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {showMobileMenu && (
            <div className="lg:hidden py-4 border-t border-white/20">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'timer', label: 'Timer', icon: Clock },
                  { id: 'logs', label: 'Memories', icon: List },
                  { id: 'relationships', label: 'People', icon: Users },
                  { id: 'hobbies', label: 'Hobbies', icon: Camera },
                  { id: 'places', label: 'Places', icon: MapPin }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id as any);
                        setShowMobileMenu(false);
                      }}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                          : 'text-gray-600 hover:bg-white/50 dark:text-gray-300 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <Icon size={18} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'timer' && (
          <div className="space-y-8">
            <CountdownTimer
              timeRemaining={timeRemaining}
              totalTime={state.user.cycleLength}
              currentPhase={currentPhase}
              formatTime={formatTime}
              progressPercentage={progressPercentage}
              isActive={isActive}
            />

            {/* Quick Log Buttons for Critical Phase */}
            {currentPhase === 'critical' && (
              <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200">
                <h3 className="text-lg font-bold text-red-800 dark:text-red-200 mb-4">
                  QUICK LOG - Memory Reset Imminent!
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {getQuickLogButtons().map((button, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickLog(button.text, button.priority, button.category)}
                      className="p-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all"
                    >
                      {button.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Critical Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-white/20 h-fit">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <List size={20} />
                  Critical Memories
                </h2>
                <div className="max-h-64 overflow-y-auto">
                  <LogList
                    logs={state.logs.filter(l => l.priority === 'CRITICAL')}
                    maxItems={3}
                    showTimestamps={false}
                  />
                </div>
              </div>

              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-white/20 h-fit">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Users size={20} />
                  Key People
                </h2>
                <div className="max-h-64 overflow-y-auto space-y-3">
                  {state.relationships
                    .filter(r => r.importance === 'CRITICAL')
                    .slice(0, 2)
                    .map(relationship => (
                      <div key={relationship.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/50 cursor-pointer transition-all"
                           onClick={() => handleEditRelationship(relationship)}>
                        <img src={relationship.photo} alt={relationship.name} className="w-10 h-10 rounded-full object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{relationship.name}</p>
                          <p className="text-xs text-gray-600 truncate">{relationship.relation}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-white/20 h-fit">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Camera size={20} />
                  Your Hobbies
                </h2>
                <div className="max-h-64 overflow-y-auto space-y-3">
                  {state.hobbies
                    .filter(h => h.importance === 'HIGH' || h.importance === 'CRITICAL')
                    .slice(0, 2)
                    .map(hobby => (
                      <div key={hobby.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/50 transition-all">
                        <img src={hobby.image} alt={hobby.name} className="w-10 h-10 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{hobby.name}</p>
                          <p className="text-xs text-gray-600 truncate">{hobby.description}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-white/20 h-fit">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <MapPin size={20} />
                  Important Places
                </h2>
                <div className="max-h-64 overflow-y-auto space-y-3">
                  {state.places
                    .filter(p => p.importance === 'CRITICAL' || p.importance === 'HIGH')
                    .slice(0, 2)
                    .map(place => (
                      <div key={place.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/50 transition-all">
                        <img src={place.image} alt={place.name} className="w-10 h-10 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{place.name}</p>
                          <p className="text-xs text-gray-600 truncate">{place.description}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Memory Logs
              </h2>
              <button
                onClick={() => setShowLogForm(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Plus size={20} />
                Add Memory
              </button>
            </div>

            {showLogForm && (
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
                <LogForm onClose={() => setShowLogForm(false)} />
              </div>
            )}

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
              <LogList logs={state.logs} />
            </div>
          </div>
        )}

        {activeTab === 'relationships' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Important People
              </h2>
              <button
                onClick={handleAddRelationship}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <UserPlus size={20} />
                Add Person
              </button>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
              <RelationshipList
                relationships={state.relationships}
                onRelationshipClick={handleEditRelationship}
              />
            </div>
          </div>
        )}

        {activeTab === 'hobbies' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Your Hobbies & Interests
              </h2>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {state.hobbies.length} hobbies tracked
              </div>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
              <HobbyList hobbies={state.hobbies} />
            </div>
          </div>
        )}

        {activeTab === 'places' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Important Places
              </h2>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {state.places.length} places tracked
              </div>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
              <PlaceList places={state.places} />
            </div>
          </div>
        )}
      </main>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-30 flex flex-col gap-3">
        {/* Add Memory Button */}
        {!showLogForm && activeTab !== 'logs' && (
          <button
            onClick={() => setShowLogForm(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white p-4 rounded-full shadow-xl transition-all transform hover:scale-110"
            title="Add Memory"
          >
            <Plus size={24} />
          </button>
        )}

        {/* Add Person Button */}
        {activeTab === 'relationships' && !showRelationshipForm && (
          <button
            onClick={handleAddRelationship}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white p-4 rounded-full shadow-xl transition-all transform hover:scale-110"
            title="Add Person"
          >
            <UserPlus size={24} />
          </button>
        )}
      </div>

      {/* Emergency Button */}
      <EmergencyButton />

      {/* Modal Forms */}
      {showLogForm && activeTab !== 'logs' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-2xl max-w-md w-full border border-white/20">
            <LogForm
              onClose={() => setShowLogForm(false)}
              isEmergency={currentPhase === 'critical'}
            />
          </div>
        </div>
      )}

      {showRelationshipForm && (
        <RelationshipForm
          onClose={handleRelationshipFormClose}
          editingRelationship={editingRelationship}
        />
      )}
    </div>
  );
}

export default function Page() {
  return (
    <MemoryProvider>
      <MemoryApp />
    </MemoryProvider>
  );
}
