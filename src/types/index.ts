import { User, Log, Relationship, Hobby, Place } from './api';

export type PhaseType = 'awareness' | 'urgency' | 'critical' | 'reset';
export type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type Category = 'relationships' | 'work' | 'medical' | 'personal' | 'emergency' | 'hobbies' | 'places';

export interface MemoryState {
  user: User;
  logs: Log[];
  relationships: Relationship[];
  hobbies: Hobby[];
  places: Place[];
  currentPhase: PhaseType;
  timeRemaining: number;
  isConfused: boolean;
  reminderQueue: Log[]; // logs that should be shown after reset
}

export interface ResetSequenceStep {
  id: string;
  title: string;
  content: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  delay: number; // milliseconds before showing
}

// Re-export API types
export type { User, Log, Relationship, Hobby, Place };