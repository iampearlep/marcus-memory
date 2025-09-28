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
  condition: '48-hour episodic memory reset',
  cycleLength: 180, // 3 minutes for demo
  currentCycle: 1,
  lastResetTime: Date.now(),
  trustCode: 'SARAH2024',
  isTimerActive: true,
  autoStart: true
};

export const defaultRelationships: Relationship[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    relation: 'Wife',
    photo: getPlaceholderImage('sarah-wife', 150, 150),
    keyFacts: ['Anniversary May 15', 'Allergic to shellfish', 'Works at Google', 'Loves hiking', 'Has dimples when she smiles'],
    importance: 'CRITICAL',
    lastInteraction: 'Had breakfast together, discussed weekend plans',
    contactInfo: '555-0001',
    birthday: 'May 15',
    relationship: 'family'
  },
  {
    id: '2',
    name: 'Dr. Amanda Rodriguez',
    relation: 'Neurologist',
    photo: getPlaceholderImage('doctor-amanda', 150, 150),
    keyFacts: ['Treating your condition', 'Weekly appointments Tuesdays 2PM', 'Emergency contact: 555-0123', 'Office on 5th floor'],
    importance: 'CRITICAL',
    contactInfo: '555-0123',
    relationship: 'medical'
  },
  {
    id: '3',
    name: 'David Kim',
    relation: 'Best Friend & Coworker',
    photo: getPlaceholderImage('david-friend', 150, 150),
    keyFacts: ['Software engineer at same company', 'Knows about your condition', 'Helps with work tasks', 'Plays guitar'],
    importance: 'HIGH',
    lastInteraction: 'Helped debug the login system yesterday',
    contactInfo: '555-0456',
    relationship: 'friend'
  },
  {
    id: '4',
    name: 'Mom (Linda Chen)',
    relation: 'Mother',
    photo: getPlaceholderImage('mom-linda', 150, 150),
    keyFacts: ['Calls every Sunday', 'Lives in Sacramento', 'Retired teacher', 'Makes amazing dumplings'],
    importance: 'HIGH',
    contactInfo: '555-0789',
    birthday: 'March 8',
    relationship: 'family'
  },
  {
    id: '5',
    name: 'Dad (Robert Chen)',
    relation: 'Father',
    photo: getPlaceholderImage('dad-robert', 150, 150),
    keyFacts: ['Retired engineer', 'Loves fishing', 'Lives in Sacramento with Mom', 'Built your first computer'],
    importance: 'HIGH',
    contactInfo: '555-0790',
    birthday: 'July 22',
    relationship: 'family'
  },
  {
    id: '6',
    name: 'Buddy',
    relation: 'Golden Retriever',
    photo: getPlaceholderImage('golden-retriever', 150, 150),
    keyFacts: ['5 years old', 'Loves tennis balls', 'Needs morning and evening walks', 'Favorite treat: peanut butter'],
    importance: 'HIGH',
    lastInteraction: 'Took him to the park this morning',
    relationship: 'other'
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
    keyDetails: ['Canon EOS R camera', 'Favorite subjects: cityscapes', 'Instagram: @marcusshots', 'Darkroom in garage']
  },
  {
    id: '2',
    name: 'Rock Climbing',
    description: 'Indoor and outdoor climbing',
    image: getPlaceholderImage('climbing', 200, 150),
    importance: 'MEDIUM',
    lastEngaged: 'Went to Planet Granite yesterday',
    keyDetails: ['Member at Planet Granite', 'Favorite route: 5.9 difficulty', 'Climbing shoes size 10', 'Usually climbs Tuesdays/Thursdays']
  },
  {
    id: '3',
    name: 'Cooking',
    description: 'Experimenting with Asian fusion',
    image: getPlaceholderImage('cooking', 200, 150),
    importance: 'MEDIUM',
    keyDetails: ['Specialty: Korean-Italian fusion', 'Favorite cookbook: "The Food Lab"', 'Has spice collection from travels', 'Sarah loves the kimchi pasta']
  }
];

export const defaultPlaces: Place[] = [
  {
    id: '1',
    name: 'Home',
    description: 'Your apartment in Mission District',
    image: getPlaceholderImage('home-apartment', 200, 150),
    importance: 'CRITICAL',
    keyDetails: ['Address: 1234 Mission St, Apt 4B', 'Keys usually on kitchen counter', 'Buddy\'s food in kitchen cabinet', 'Emergency key with Sarah'],
    address: '1234 Mission St, Apt 4B, San Francisco, CA'
  },
  {
    id: '2',
    name: 'Golden Gate Park',
    description: 'Favorite place for walks and photography',
    image: getPlaceholderImage('golden-gate-park', 200, 150),
    importance: 'HIGH',
    lastVisited: 'Last Sunday for photography',
    keyDetails: ['Best lighting in early morning', 'Buddy loves the dog park area', 'Japanese Tea Garden is peaceful', 'Free parking near museum'],
    address: 'Golden Gate Park, San Francisco, CA'
  },
  {
    id: '3',
    name: 'Tartine Bakery',
    description: 'Favorite coffee shop for morning routine',
    image: getPlaceholderImage('coffee-shop', 200, 150),
    importance: 'MEDIUM',
    lastVisited: 'Yesterday morning',
    keyDetails: ['Order: Large coffee, almond croissant', 'Usually sit at corner table', 'Good WiFi for work', 'Sarah likes their sourdough'],
    address: '600 Guerrero St, San Francisco, CA'
  },
  {
    id: '4',
    name: 'Office - TechFlow Inc',
    description: 'Your workplace in SOMA',
    image: getPlaceholderImage('office-building', 200, 150),
    importance: 'HIGH',
    keyDetails: ['Floor 12, desk by the window', 'Badge access required', 'David sits across from you', 'Lunch usually at 12:30'],
    address: '789 Howard St, San Francisco, CA'
  }
];