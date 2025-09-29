import type { Dispatch } from 'react';
import { User, Log, Relationship, Hobby, Place } from './api';

export type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type Category = 'relationships' | 'work' | 'medical' | 'personal' | 'emergency' | 'hobbies' | 'places';
export type PhaseType = 'awareness' | 'transition' | 'reset';

export interface MemoryState {
  user: User;
  logs: Log[];
  relationships: Relationship[];
  hobbies: Hobby[];
  places: Place[];
  currentPhase: PhaseType;
  timeRemaining: number;
  isConfused: boolean;
  reminderQueue: Log[];
}

export interface MemoryContextType {
  state: MemoryState;
  dispatch: Dispatch<MemoryAction>;
  addLog: (log: Omit<Log, 'id' | 'timestamp' | 'cycleNumber' | 'createdAt' | 'userId'>) => void;
  addRelationship: (relationship: Omit<Relationship, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => void;
  updateRelationship: (relationship: Relationship) => void;
  addHobby: (hobby: Omit<Hobby, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'details'>) => void;
  addPlace: (place: Omit<Place, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'details'>) => void;
  setPhase: (phase: PhaseType) => void;
  setTime: (time: number) => void;
  setConfused: (isConfused: boolean) => void;
  setTimeRemaining: (time: number) => void;
  setTimerActive: (active: boolean) => void;
  resetCycle: () => void;
  clearData: () => void;
}

export type MemoryAction =
  | { type: 'LOAD_STATE'; payload: MemoryState }
  | { type: 'ADD_LOG'; payload: Omit<Log, 'id' | 'timestamp' | 'cycleNumber' | 'createdAt'> }
  | { type: 'ADD_RELATIONSHIP'; payload: Omit<Relationship, 'id' | 'createdAt' | 'updatedAt'> }
  | { type: 'UPDATE_RELATIONSHIP'; payload: Relationship }
  | { type: 'SET_PHASE'; payload: PhaseType }
  | { type: 'SET_TIME_REMAINING'; payload: number }
  | { type: 'SET_CONFUSED'; payload: boolean }
  | { type: 'SET_TIMER_ACTIVE'; payload: boolean }
  | { type: 'RESET_CYCLE' }
  | { type: 'CLEAR_DATA' };