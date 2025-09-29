import { MemoryState, User, Log, Relationship, Hobby, Place } from '@/types';

const STORAGE_KEY = 'marcus-memory-system';

export class MemoryStorage {
  static save(state: MemoryState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save memory state:', error);
    }
  }

  static load(): MemoryState | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to load memory state:', error);
      return null;
    }
  }

  static addLog(log: Log): void {
    const state = this.load();
    if (state) {
      state.logs.push(log);
      // Add to reminder queue if critical or persistent
      if (log.priority === 'CRITICAL' || log.isPersistent) {
        state.reminderQueue.push(log);
      }
      this.save(state);
    }
  }

  static addRelationship(relationship: Relationship): void {
    const state = this.load();
    if (state) {
      state.relationships.push(relationship);
      this.save(state);
    }
  }

  static addHobby(hobby: Hobby): void {
    const state = this.load();
    if (state) {
      state.hobbies.push(hobby);
      this.save(state);
    }
  }

  static addPlace(place: Place): void {
    const state = this.load();
    if (state) {
      state.places.push(place);
      this.save(state);
    }
  }

  static updateCycle(cycleNumber: number, resetTime: number): void {
    const state = this.load();
    if (state) {
      state.user.currentCycle = cycleNumber;
      state.user.lastResetTime = resetTime;
      // Keep persistent logs and critical information
      state.logs = state.logs.filter(log =>
        log.isPersistent ||
        log.priority === 'CRITICAL' ||
        log.cycleNumber >= cycleNumber
      );
      this.save(state);
    }
  }

  static clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}

// Sample images (using placeholder service for demo)
const getPlaceholderImage = (seed: string, width = 200, height = 200) =>
  `https://picsum.photos/seed/${seed}/${width}/${height}`;

// Initialize default user data
export const defaultUser: User = {
  id: 'marcus-chen',
  name: 'Marcus Chen',
  email: 'marcus@example.com',
  condition: '48-hour episodic memory reset',
  cycleLength: 180, // 3 minutes for demo
  currentCycle: 1,
  lastResetTime: Date.now(),
  trustCode: 'SARAH2024',
  isTimerActive: true,
  autoStart: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export const defaultRelationships: Relationship[] = [
  {
    id: '1',
    userId: 'marcus-chen',
    name: 'Sarah Chen',
    relation: 'Wife',
    photo: getPlaceholderImage('sarah-wife', 150, 150),
    facts: [
      { id: 1, relationshipId: '1', fact: 'Anniversary May 15', createdAt: new Date().toISOString() },
      { id: 2, relationshipId: '1', fact: 'Allergic to shellfish', createdAt: new Date().toISOString() },
      { id: 3, relationshipId: '1', fact: 'Works at Google', createdAt: new Date().toISOString() },
      { id: 4, relationshipId: '1', fact: 'Loves hiking', createdAt: new Date().toISOString() },
      { id: 5, relationshipId: '1', fact: 'Has dimples when she smiles', createdAt: new Date().toISOString() }
    ],
    importance: 'CRITICAL',
    lastInteraction: 'Had breakfast together, discussed weekend plans',
    contactInfo: '555-0001',
    birthday: 'May 15',
    relationshipType: 'family',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Dr. Amanda Rodriguez',
    relation: 'Neurologist',
    photo: getPlaceholderImage('doctor-amanda', 150, 150),
    facts: [
      { id: 6, relationshipId: '2', fact: 'Treating your condition', createdAt: new Date().toISOString() },
      { id: 7, relationshipId: '2', fact: 'Weekly appointments Tuesdays 2PM', createdAt: new Date().toISOString() },
      { id: 8, relationshipId: '2', fact: 'Emergency contact: 555-0123', createdAt: new Date().toISOString() },
      { id: 9, relationshipId: '2', fact: 'Office on 5th floor', createdAt: new Date().toISOString() }
    ],
    importance: 'CRITICAL',
    contactInfo: '555-0123',
    userId: 'marcus-chen',
    relationshipType: 'medical',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'David Kim',
    relation: 'Best Friend & Coworker',
    photo: getPlaceholderImage('david-friend', 150, 150),
    facts: [
      { id: 10, relationshipId: '3', fact: 'Software engineer at same company', createdAt: new Date().toISOString() },
      { id: 11, relationshipId: '3', fact: 'Knows about your condition', createdAt: new Date().toISOString() },
      { id: 12, relationshipId: '3', fact: 'Helps with work tasks', createdAt: new Date().toISOString() },
      { id: 13, relationshipId: '3', fact: 'Plays guitar', createdAt: new Date().toISOString() }
    ],
    importance: 'HIGH',
    lastInteraction: 'Helped debug the login system yesterday',
    contactInfo: '555-0456',
    userId: 'marcus-chen',
    relationshipType: 'friend',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Mom (Linda Chen)',
    relation: 'Mother',
    photo: getPlaceholderImage('mom-linda', 150, 150),
    facts: [
      { id: 14, relationshipId: '4', fact: 'Calls every Sunday', createdAt: new Date().toISOString() },
      { id: 15, relationshipId: '4', fact: 'Lives in Sacramento', createdAt: new Date().toISOString() },
      { id: 16, relationshipId: '4', fact: 'Retired teacher', createdAt: new Date().toISOString() },
      { id: 17, relationshipId: '4', fact: 'Makes amazing dumplings', createdAt: new Date().toISOString() }
    ],
    importance: 'HIGH',
    contactInfo: '555-0789',
    birthday: 'March 8',
    userId: 'marcus-chen',
    relationshipType: 'family',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Dad (Robert Chen)',
    relation: 'Father',
    photo: getPlaceholderImage('dad-robert', 150, 150),
    facts: [
      { id: 18, relationshipId: '5', fact: 'Retired engineer', createdAt: new Date().toISOString() },
      { id: 19, relationshipId: '5', fact: 'Loves fishing', createdAt: new Date().toISOString() },
      { id: 20, relationshipId: '5', fact: 'Lives in Sacramento with Mom', createdAt: new Date().toISOString() },
      { id: 21, relationshipId: '5', fact: 'Built your first computer', createdAt: new Date().toISOString() }
    ],
    importance: 'HIGH',
    contactInfo: '555-0790',
    birthday: 'July 22',
    userId: 'marcus-chen',
    relationshipType: 'family',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '6',
    name: 'Buddy',
    relation: 'Golden Retriever',
    photo: getPlaceholderImage('golden-retriever', 150, 150),
    facts: [
      { id: 22, relationshipId: '6', fact: '5 years old', createdAt: new Date().toISOString() },
      { id: 23, relationshipId: '6', fact: 'Loves tennis balls', createdAt: new Date().toISOString() },
      { id: 24, relationshipId: '6', fact: 'Needs morning and evening walks', createdAt: new Date().toISOString() },
      { id: 25, relationshipId: '6', fact: 'Favorite treat: peanut butter', createdAt: new Date().toISOString() }
    ],
    importance: 'HIGH',
    lastInteraction: 'Took him to the park this morning',
    userId: 'marcus-chen',
    relationshipType: 'other',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const defaultHobbies: Hobby[] = [
  {
    id: '1',
    name: 'Photography',
    description: 'Landscape and street photography',
    image: getPlaceholderImage('photography', 200, 150),
    importance: 'HIGH',
    lastEngaged: 'Took photos at Golden Gate Park last weekend',
    details: [
      { id: 26, hobbyId: '1', detail: 'Canon EOS R camera', createdAt: new Date().toISOString() },
      { id: 27, hobbyId: '1', detail: 'Favorite subjects: cityscapes', createdAt: new Date().toISOString() },
      { id: 28, hobbyId: '1', detail: 'Instagram: @marcusshots', createdAt: new Date().toISOString() },
      { id: 29, hobbyId: '1', detail: 'Darkroom in garage', createdAt: new Date().toISOString() }
    ],
    userId: 'marcus-chen',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Rock Climbing',
    description: 'Indoor and outdoor climbing',
    image: getPlaceholderImage('climbing', 200, 150),
    importance: 'MEDIUM',
    lastEngaged: 'Went to Planet Granite yesterday',
    details: [
      { id: 30, hobbyId: '2', detail: 'Member at Planet Granite', createdAt: new Date().toISOString() },
      { id: 31, hobbyId: '2', detail: 'Favorite route: 5.9 difficulty', createdAt: new Date().toISOString() },
      { id: 32, hobbyId: '2', detail: 'Climbing shoes size 10', createdAt: new Date().toISOString() },
      { id: 33, hobbyId: '2', detail: 'Usually climbs Tuesdays/Thursdays', createdAt: new Date().toISOString() }
    ],
    userId: 'marcus-chen',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Cooking',
    description: 'Experimenting with Asian fusion',
    image: getPlaceholderImage('cooking', 200, 150),
    importance: 'MEDIUM',
    details: [
      { id: 34, hobbyId: '3', detail: 'Specialty: Korean-Italian fusion', createdAt: new Date().toISOString() },
      { id: 35, hobbyId: '3', detail: 'Favorite cookbook: "The Food Lab"', createdAt: new Date().toISOString() },
      { id: 36, hobbyId: '3', detail: 'Has spice collection from travels', createdAt: new Date().toISOString() },
      { id: 37, hobbyId: '3', detail: 'Sarah loves the kimchi pasta', createdAt: new Date().toISOString() }
    ],
    userId: 'marcus-chen',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const defaultPlaces: Place[] = [
  {
    id: '1',
    name: 'Home',
    description: 'Your apartment in Mission District',
    image: getPlaceholderImage('home-apartment', 200, 150),
    importance: 'CRITICAL',
    details: [
      { id: 38, placeId: '1', detail: 'Address: 1234 Mission St, Apt 4B', createdAt: new Date().toISOString() },
      { id: 39, placeId: '1', detail: 'Keys usually on kitchen counter', createdAt: new Date().toISOString() },
      { id: 40, placeId: '1', detail: 'Buddy\'s food in kitchen cabinet', createdAt: new Date().toISOString() },
      { id: 41, placeId: '1', detail: 'Emergency key with Sarah', createdAt: new Date().toISOString() }
    ],
    address: '1234 Mission St, Apt 4B, San Francisco, CA',
    userId: 'marcus-chen',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Golden Gate Park',
    description: 'Favorite place for walks and photography',
    image: getPlaceholderImage('golden-gate-park', 200, 150),
    importance: 'HIGH',
    lastVisited: 'Last Sunday for photography',
    details: [
      { id: 42, placeId: '2', detail: 'Best lighting in early morning', createdAt: new Date().toISOString() },
      { id: 43, placeId: '2', detail: 'Buddy loves the dog park area', createdAt: new Date().toISOString() },
      { id: 44, placeId: '2', detail: 'Japanese Tea Garden is peaceful', createdAt: new Date().toISOString() },
      { id: 45, placeId: '2', detail: 'Free parking near museum', createdAt: new Date().toISOString() }
    ],
    address: 'Golden Gate Park, San Francisco, CA',
    userId: 'marcus-chen',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Tartine Bakery',
    description: 'Favorite coffee shop for morning routine',
    image: getPlaceholderImage('coffee-shop', 200, 150),
    importance: 'MEDIUM',
    lastVisited: 'Yesterday morning',
    details: [
      { id: 46, placeId: '3', detail: 'Order: Large coffee, almond croissant', createdAt: new Date().toISOString() },
      { id: 47, placeId: '3', detail: 'Usually sit at corner table', createdAt: new Date().toISOString() },
      { id: 48, placeId: '3', detail: 'Good WiFi for work', createdAt: new Date().toISOString() },
      { id: 49, placeId: '3', detail: 'Sarah likes their sourdough', createdAt: new Date().toISOString() }
    ],
    address: '600 Guerrero St, San Francisco, CA',
    userId: 'marcus-chen',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Office - TechFlow Inc',
    description: 'Your workplace in SOMA',
    image: getPlaceholderImage('office-building', 200, 150),
    importance: 'HIGH',
    details: [
      { id: 50, placeId: '4', detail: 'Floor 12, desk by the window', createdAt: new Date().toISOString() },
      { id: 51, placeId: '4', detail: 'Badge access required', createdAt: new Date().toISOString() },
      { id: 52, placeId: '4', detail: 'David sits across from you', createdAt: new Date().toISOString() },
      { id: 53, placeId: '4', detail: 'Lunch usually at 12:30', createdAt: new Date().toISOString() }
    ],
    address: '789 Howard St, San Francisco, CA',
    userId: 'marcus-chen',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];