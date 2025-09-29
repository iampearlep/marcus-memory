'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { MemoryState, PhaseType } from '@/types';
import { Log, Relationship, Hobby, Place } from '@/types/api';
import { logs, relationships } from '@/lib/api';
import { MemoryStorage, defaultUser, defaultRelationships, defaultHobbies, defaultPlaces } from '@/lib/storage';
import { v4 as uuidv4 } from 'uuid';

import type { User } from '@/types/api';

interface HobbyInput extends Omit<Hobby, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'details'> {
  keyDetails?: string[];
}

interface PlaceInput extends Omit<Place, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'details'> {
  keyDetails?: string[];
}

type MemoryAction =
  | { type: 'SET_USER'; payload: User }
  | { type: 'ADD_LOG'; payload: Omit<Log, 'id' | 'createdAt' | 'userId' | 'timestamp' | 'cycleNumber'> }
  | { type: 'ADD_RELATIONSHIP'; payload: Omit<Relationship, 'id' | 'createdAt' | 'updatedAt'> }
  | { type: 'UPDATE_RELATIONSHIP'; payload: Relationship }
  | { type: 'ADD_HOBBY'; payload: HobbyInput }
  | { type: 'ADD_PLACE'; payload: PlaceInput }
  | { type: 'SET_PHASE'; payload: PhaseType }
  | { type: 'SET_TIME'; payload: number }
  | { type: 'SET_CONFUSED'; payload: boolean }
  | { type: 'ADD_TO_QUEUE'; payload: Log }
  | { type: 'SET_TIME_REMAINING'; payload: number }
  | { type: 'SET_TIMER_ACTIVE'; payload: boolean }
  | { type: 'RESET_CYCLE' }
  | { type: 'CLEAR_DATA' }
  | { type: 'LOAD_STATE' }
  | { type: 'LOAD_INITIAL_DATA'; payload: Partial<MemoryState> };

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
      const logData: Omit<Log, 'id' | 'createdAt'> = {
        ...action.payload,
        userId: state.user.id,
        timestamp: Date.now(),
        cycleNumber: state.user.currentCycle,
        isEmergency: action.payload.isEmergency || false,
        isPersistent: action.payload.isPersistent || false
      };
      
      logs.create(logData).then(response => {
        if (response.data) {
          const newState = {
            ...state,
            logs: [...state.logs, response.data]
          };
          MemoryStorage.save(newState);
        }
      });
      
      // Optimistic update
      const optimisticLog: Log = {
        ...logData,
        id: uuidv4(),
        createdAt: new Date().toISOString()
      };
      
      return {
        ...state,
        logs: [...state.logs, optimisticLog],
        reminderQueue: (optimisticLog.priority === 'CRITICAL' || optimisticLog.isPersistent)
          ? [...state.reminderQueue, optimisticLog]
          : state.reminderQueue
      };
    }

    case 'ADD_RELATIONSHIP': {
      const relationshipData: Omit<Relationship, 'id' | 'createdAt' | 'updatedAt'> = {
        ...action.payload,
        userId: state.user.id,
        facts: action.payload.facts?.map(f => ({
          id: 0,  // Will be assigned by backend
          relationshipId: '',  // Will be assigned by backend
          fact: f.fact,
          createdAt: new Date().toISOString()
        }))
      };
      
      relationships.create(relationshipData).then(response => {
        if (response.data) {
          const newState = {
            ...state,
            relationships: [...state.relationships, response.data]
          };
          MemoryStorage.save(newState);
        }
      });
      
      // Optimistic update
      const optimisticRelationship = { 
        ...relationshipData, 
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      return {
        ...state,
        relationships: [...state.relationships, optimisticRelationship]
      };
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
      const hobbyData: Omit<Hobby, 'id' | 'createdAt' | 'updatedAt'> = {
        ...action.payload,
        userId: state.user.id,
        details: action.payload.keyDetails?.map(detail => ({
          id: 0, // Will be assigned by backend
          hobbyId: '', // Will be assigned by backend
          detail,
          createdAt: new Date().toISOString()
        }))
      };
      
      const optimisticHobby: Hobby = {
        ...hobbyData,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const newState = {
        ...state,
        hobbies: [...state.hobbies, optimisticHobby]
      };
      MemoryStorage.save(newState);
      return newState;
    }

    case 'ADD_PLACE': {
      const placeData: Omit<Place, 'id' | 'createdAt' | 'updatedAt'> = {
        ...action.payload,
        userId: state.user.id,
        details: action.payload.keyDetails?.map(detail => ({
          id: 0, // Will be assigned by backend
          placeId: '', // Will be assigned by backend
          detail,
          createdAt: new Date().toISOString()
        }))
      };
      
      const optimisticPlace: Place = {
        ...placeData,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const newState = {
        ...state,
        places: [...state.places, optimisticPlace]
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

    case 'LOAD_INITIAL_DATA': {
      const newState = {
        ...state,
        ...action.payload
      };
      MemoryStorage.save(newState);
      return newState;
    }

    default:
      return state;
  }
}

interface MemoryContextType {
  state: MemoryState;
  dispatch: React.Dispatch<MemoryAction>;
  addLog: (log: Omit<Log, 'id' | 'timestamp' | 'cycleNumber' | 'createdAt' | 'userId'>) => void;
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
    dispatch,
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