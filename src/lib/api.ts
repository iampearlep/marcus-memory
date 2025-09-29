import { User, Log, Relationship, Hobby, Place, MemoryCycle } from '../types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://marcus-memory-backend-production.up.railway.app/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function fetchApi<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include'
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Something went wrong');
    }

    return { data: data as T };
  } catch (error) {
    return { 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
}

// Auth endpoints
export const auth = {
  login: async (email: string, password: string) => {
    return fetchApi<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  register: async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    return fetchApi<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }
};

// User endpoints
export const users = {
  getCurrent: async () => {
    return fetchApi<User>('/users/me');
  },

  update: async (userId: string, userData: Partial<User>) => {
    return fetchApi<User>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  }
};

// Memory logs endpoints
export const logs = {
  getAll: async (userId: string) => {
    return fetchApi<Log[]>(`/logs/user/${userId}`);
  },

  create: async (logData: Omit<Log, 'id' | 'createdAt'>) => {
    return fetchApi<Log>('/logs', {
      method: 'POST',
      body: JSON.stringify(logData)
    });
  },

  update: async (logId: string, logData: Partial<Log>) => {
    return fetchApi<Log>(`/logs/${logId}`, {
      method: 'PUT',
      body: JSON.stringify(logData)
    });
  },

  delete: async (logId: string) => {
    return fetchApi<void>(`/logs/${logId}`, {
      method: 'DELETE'
    });
  }
};

// Relationships endpoints
export const relationships = {
  getAll: async (userId: string) => {
    return fetchApi<Relationship[]>(`/relationships/user/${userId}`);
  },

  create: async (relationshipData: Omit<Relationship, 'id' | 'createdAt' | 'updatedAt'>) => {
    return fetchApi<Relationship>('/relationships', {
      method: 'POST',
      body: JSON.stringify(relationshipData)
    });
  },

  update: async (relationshipId: string, relationshipData: Partial<Relationship>) => {
    return fetchApi<Relationship>(`/relationships/${relationshipId}`, {
      method: 'PUT',
      body: JSON.stringify(relationshipData)
    });
  },

  delete: async (relationshipId: string) => {
    return fetchApi<void>(`/relationships/${relationshipId}`, {
      method: 'DELETE'
    });
  }
};

// Hobbies endpoints
export const hobbies = {
  getAll: async (userId: string) => {
    return fetchApi<Hobby[]>(`/hobbies/user/${userId}`);
  },

  create: async (hobbyData: Omit<Hobby, 'id' | 'createdAt' | 'updatedAt'>) => {
    return fetchApi<Hobby>('/hobbies', {
      method: 'POST',
      body: JSON.stringify(hobbyData)
    });
  },

  update: async (hobbyId: string, hobbyData: Partial<Hobby>) => {
    return fetchApi<Hobby>(`/hobbies/${hobbyId}`, {
      method: 'PUT',
      body: JSON.stringify(hobbyData)
    });
  },

  delete: async (hobbyId: string) => {
    return fetchApi<void>(`/hobbies/${hobbyId}`, {
      method: 'DELETE'
    });
  }
};

// Places endpoints
export const places = {
  getAll: async (userId: string) => {
    return fetchApi<Place[]>(`/places/user/${userId}`);
  },

  create: async (placeData: Omit<Place, 'id' | 'createdAt' | 'updatedAt'>) => {
    return fetchApi<Place>('/places', {
      method: 'POST',
      body: JSON.stringify(placeData)
    });
  },

  update: async (placeId: string, placeData: Partial<Place>) => {
    return fetchApi<Place>(`/places/${placeId}`, {
      method: 'PUT',
      body: JSON.stringify(placeData)
    });
  },

  delete: async (placeId: string) => {
    return fetchApi<void>(`/places/${placeId}`, {
      method: 'DELETE'
    });
  }
};

// Memory cycles endpoints
export const cycles = {
  getCurrent: async (userId: string) => {
    return fetchApi<MemoryCycle>(`/cycles/current/${userId}`);
  },

  startNew: async (userId: string) => {
    return fetchApi<MemoryCycle>('/cycles/start', {
      method: 'POST',
      body: JSON.stringify({ userId })
    });
  },

  update: async (cycleId: number, cycleData: Partial<MemoryCycle>) => {
    return fetchApi<MemoryCycle>(`/cycles/${cycleId}`, {
      method: 'PUT',
      body: JSON.stringify(cycleData)
    });
  }
};