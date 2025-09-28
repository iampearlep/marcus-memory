'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { MemoryState, Log, Relationship, Hobby, Place, PhaseType } from '@/types';
import { MemoryStorage, defaultUser, defaultRelationships, defaultHobbies, defaultPlaces } from '@/lib/storage';
import { v4 as uuidv4 } from 'uuid';

type MemoryAction =
  | { type: 'LOAD_STATE' }
  | { type: 'ADD_LOG'; payload: Omit<Log, 'id' | 'timestamp' | 'cycleNumber'> }
  | { type: 'ADD_RELATIONSHIP'; payload: Omit<Relationship, 'id'> }
  | { type: 'ADD_HOBBY'; payload: Omit<Hobby, 'id'> }
  | { type: 'ADD_PLACE'; payload: Omit<Place, 'id'> }
  | { type: 'UPDATE_RELATIONSHIP'; payload: Relationship }
  | { type: 'SET_PHASE'; payload: PhaseType }
  | { type: 'SET_TIME_REMAINING'; payload: number }
  | { type: 'SET_CONFUSED'; payload: boolean }
  | { type: 'SET_TIMER_ACTIVE'; payload: boolean }
  | { type: 'RESET_CYCLE' }
  | { type: 'CLEAR_DATA' };

const initialState: MemoryState = {
  user: defaultUser,
  logs: [],
  relationships: defaultRelationships,
  hobbies: defaultHobbies,
  places: defaultPlaces,
  currentPhase: 'awareness',
  timeRemaining: defaultUser.cycleLength,
  isConfused: false,
  reminderQueue: []
};

function memoryReducer(state: MemoryState, action: MemoryAction): MemoryState {
  switch (action.type) {
    case 'LOAD_STATE': {
      const saved = MemoryStorage.load();
      if (saved) {
        // Ensure all new fields exist
        return {
          ...saved,
          hobbies: saved.hobbies || defaultHobbies,
          places: saved.places || defaultPlaces,
          reminderQueue: saved.reminderQueue || [],
          user: {
            ...saved.user,
            isTimerActive: saved.user.isTimerActive ?? true,
            autoStart: saved.user.autoStart ?? true
          }
        };
      }
      return initialState;
    }

    case 'ADD_LOG': {
      const newLog: Log = {
        ...action.payload,
        id: uuidv4(),
        timestamp: Date.now(),
        cycleNumber: state.user.currentCycle
      };
      const newState = {
        ...state,
        logs: [...state.logs, newLog],
        reminderQueue: (newLog.priority === 'CRITICAL' || newLog.isPersistent)
          ? [...state.reminderQueue, newLog]
          : state.reminderQueue
      };
      MemoryStorage.save(newState);
      return newState;
    }

    case 'ADD_RELATIONSHIP': {
      const newRelationship: Relationship = {
        ...action.payload,
        id: uuidv4()
      };
      const newState = {
        ...state,
        relationships: [...state.relationships, newRelationship]
      };
      MemoryStorage.save(newState);
      return newState;
    }

    case 'UPDATE_RELATIONSHIP': {
      const newState = {
        ...state,
        relationships: state.relationships.map(r =>
          r.id === action.payload.id ? action.payload : r
        )
      };
      MemoryStorage.save(newState);
      return newState;
    }

    case 'ADD_HOBBY': {
      const newHobby: Hobby = {
        ...action.payload,
        id: uuidv4()
      };
      const newState = {
        ...state,
        hobbies: [...state.hobbies, newHobby]
      };
      MemoryStorage.save(newState);
      return newState;
    }

    case 'ADD_PLACE': {
      const newPlace: Place = {
        ...action.payload,
        id: uuidv4()
      };
      const newState = {
        ...state,
        places: [...state.places, newPlace]
      };
      MemoryStorage.save(newState);
      return newState;
    }

    case 'SET_PHASE': {
      return {
        ...state,
        currentPhase: action.payload
      };
    }

    case 'SET_TIME_REMAINING': {
      return {
        ...state,
        timeRemaining: action.payload
      };
    }

    case 'SET_CONFUSED': {
      return {
        ...state,
        isConfused: action.payload
      };
    }

    case 'SET_TIMER_ACTIVE': {
      const newState = {
        ...state,
        user: {
          ...state.user,
          isTimerActive: action.payload
        }
      };
      MemoryStorage.save(newState);
      return newState;
    }

    case 'RESET_CYCLE': {
      const newCycle = state.user.currentCycle + 1;
      const resetTime = Date.now();

      const newState = {
        ...state,
        user: {
          ...state.user,
          currentCycle: newCycle,
          lastResetTime: resetTime,
          isTimerActive: state.user.autoStart // Auto-restart if enabled
        },
        logs: state.logs.filter(log =>
          log.isPersistent || log.priority === 'CRITICAL'
        ),
        currentPhase: 'awareness' as PhaseType,
        timeRemaining: state.user.cycleLength,
        isConfused: false,
        reminderQueue: [] // Clear reminder queue after reset
      };

      MemoryStorage.save(newState);
      return newState;
    }

    case 'CLEAR_DATA': {
      MemoryStorage.clear();
      return initialState;
    }

    default:
      return state;
  }
}

interface MemoryContextType {
  state: MemoryState;
  addLog: (log: Omit<Log, 'id' | 'timestamp' | 'cycleNumber'>) => void;
  addRelationship: (relationship: Omit<Relationship, 'id'>) => void;
  updateRelationship: (relationship: Relationship) => void;
  addHobby: (hobby: Omit<Hobby, 'id'>) => void;
  addPlace: (place: Omit<Place, 'id'>) => void;
  setPhase: (phase: PhaseType) => void;
  setTimeRemaining: (time: number) => void;
  setConfused: (confused: boolean) => void;
  setTimerActive: (active: boolean) => void;
  resetCycle: () => void;
  clearData: () => void;
}

const MemoryContext = createContext<MemoryContextType | undefined>(undefined);

export function MemoryProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(memoryReducer, initialState);

  useEffect(() => {
    dispatch({ type: 'LOAD_STATE' });
  }, []);

  const value: MemoryContextType = {
    state,
    addLog: (log) => dispatch({ type: 'ADD_LOG', payload: log }),
    addRelationship: (relationship) => dispatch({ type: 'ADD_RELATIONSHIP', payload: relationship }),
    updateRelationship: (relationship) => dispatch({ type: 'UPDATE_RELATIONSHIP', payload: relationship }),
    addHobby: (hobby) => dispatch({ type: 'ADD_HOBBY', payload: hobby }),
    addPlace: (place) => dispatch({ type: 'ADD_PLACE', payload: place }),
    setPhase: (phase) => dispatch({ type: 'SET_PHASE', payload: phase }),
    setTimeRemaining: (time) => dispatch({ type: 'SET_TIME_REMAINING', payload: time }),
    setConfused: (confused) => dispatch({ type: 'SET_CONFUSED', payload: confused }),
    setTimerActive: (active) => dispatch({ type: 'SET_TIMER_ACTIVE', payload: active }),
    resetCycle: () => dispatch({ type: 'RESET_CYCLE' }),
    clearData: () => dispatch({ type: 'CLEAR_DATA' })
  };

  return (
    <MemoryContext.Provider value={value}>
      {children}
    </MemoryContext.Provider>
  );
}

export function useMemory() {
  const context = useContext(MemoryContext);
  if (context === undefined) {
    throw new Error('useMemory must be used within a MemoryProvider');
  }
  return context;
}