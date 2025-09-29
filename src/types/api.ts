export interface User {
  id: string;
  name: string;
  email: string;
  condition: string;
  cycleLength: number;
  currentCycle: number;
  lastResetTime: number;
  trustCode?: string;
  isTimerActive: boolean;
  autoStart: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Log {
  id: string;
  userId: string;
  content: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'relationships' | 'work' | 'medical' | 'personal' | 'emergency' | 'hobbies' | 'places';
  timestamp: number;
  cycleNumber: number;
  isEmergency: boolean;
  isPersistent: boolean;
  createdAt: string;
}

export interface Relationship {
  id: string;
  userId: string;
  name: string;
  relation: string;
  photo?: string;
  contactInfo?: string;
  birthday?: string;
  relationshipType: 'family' | 'friend' | 'medical' | 'work' | 'other';
  importance: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  lastInteraction?: string;
  createdAt: string;
  updatedAt: string;
  facts?: RelationshipFact[];
}

export interface RelationshipFact {
  id: number;
  relationshipId: string;
  fact: string;
  createdAt: string;
}

export interface Hobby {
  id: string;
  userId: string;
  name: string;
  description?: string;
  image?: string;
  importance: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  lastEngaged?: string;
  createdAt: string;
  updatedAt: string;
  details?: HobbyDetail[];
}

export interface HobbyDetail {
  id: number;
  hobbyId: string;
  detail: string;
  createdAt: string;
}

export interface Place {
  id: string;
  userId: string;
  name: string;
  description?: string;
  image?: string;
  address?: string;
  importance: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  lastVisited?: string;
  createdAt: string;
  updatedAt: string;
  details?: PlaceDetail[];
}

export interface PlaceDetail {
  id: number;
  placeId: string;
  detail: string;
  createdAt: string;
}

export interface MemoryCycle {
  id: number;
  userId: string;
  cycleNumber: number;
  startTime: number;
  endTime?: number;
  phase: 'awareness' | 'transition' | 'reset';
  createdAt: string;
}