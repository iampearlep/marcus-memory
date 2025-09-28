export interface User {
  id: string;
  name: string;
  condition: string;
  cycleLength: number; // in seconds (180 for demo)
  currentCycle: number;
  lastResetTime: number; // timestamp
  trustCode?: string; // for verification
  isTimerActive: boolean;
  autoStart: boolean;
}

export type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type Category = 'relationships' | 'work' | 'medical' | 'personal' | 'emergency' | 'hobbies' | 'places';
export type PhaseType = 'awareness' | 'urgency' | 'critical' | 'reset';

export interface Log {
  id: string;
  content: string;
  priority: Priority;
  category: Category;
  timestamp: number;
  cycleNumber: number;
  isEmergency?: boolean;
  isPersistent?: boolean; // survives resets for critical info
}

export interface Relationship {
  id: string;
  name: string;
  relation: string;
  photo?: string;
  keyFacts: string[];
  lastInteraction?: string;
  importance: Priority;
  contactInfo?: string;
  birthday?: string;
  relationship?: 'family' | 'friend' | 'medical' | 'work' | 'other';
}

export interface Hobby {
  id: string;
  name: string;
  description: string;
  image?: string;
  importance: Priority;
  lastEngaged?: string;
  keyDetails: string[];
}

export interface Place {
  id: string;
  name: string;
  description: string;
  image?: string;
  importance: Priority;
  lastVisited?: string;
  keyDetails: string[];
  address?: string;
}

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
  priority: Priority;
  delay: number; // milliseconds before showing
}