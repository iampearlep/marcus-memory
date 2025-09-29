import { useEffect, useCallback, useRef } from 'react';
import { users, logs, relationships, hobbies, places, cycles } from '@/lib/api';
import { useMemory } from '@/context/MemoryContext';
import type { MemoryState, PhaseType } from '@/types';

function phaseFromString(phase: string | undefined): PhaseType {
  switch(phase) {
    case 'awareness':
    case 'urgency':
    case 'critical':
    case 'reset':
      return phase;
    default:
      return 'awareness';
  }
}

export function useInitialData() {
  const { state, dispatch } = useMemory();
  const hasLoadedRef = useRef(false);

  const fetchData = useCallback(async (userId: string) => {
    if (hasLoadedRef.current) return;

    try {
      hasLoadedRef.current = true;

      // Fetch all user data in parallel
      const [
        userResponse,
        logsResponse,
        relationshipsResponse,
        hobbiesResponse,
        placesResponse,
        cycleResponse
      ] = await Promise.all([
        users.getCurrent(),
        logs.getAll(userId),
        relationships.getAll(userId),
        hobbies.getAll(userId),
        places.getAll(userId),
        cycles.getCurrent(userId)
      ]);

      // Check for errors in responses
      if (userResponse.error) {
        console.error('Error fetching user data:', userResponse.error);
        hasLoadedRef.current = false;
        return;
      }

      // Update state with fetched data
      const payload: Partial<MemoryState> = {
        user: userResponse.data || state.user,
        logs: logsResponse.data || [],
        relationships: relationshipsResponse.data || [],
        hobbies: hobbiesResponse.data || [],
        places: placesResponse.data || [],
        currentPhase: phaseFromString(cycleResponse.data?.phase) || 'awareness',
        timeRemaining: calculateTimeRemaining(cycleResponse.data)
      };

      dispatch({ type: 'LOAD_INITIAL_DATA', payload });
    } catch (error) {
      console.error('Error loading initial data:', error);
      hasLoadedRef.current = false;
    }
  }, [dispatch, state.user]);

  useEffect(() => {
    if (state.user.id && !hasLoadedRef.current) {
      fetchData(state.user.id);
    }
  }, [state.user.id, fetchData]);
}

interface Cycle {
  startTime?: number;
  phase?: string;
}

function calculateTimeRemaining(cycle?: Cycle): number {
  if (!cycle?.startTime) return 180 * 60 * 1000; // default 3 hours
  const elapsed = Date.now() - cycle.startTime;
  const total = 180 * 60 * 1000; // 3 hours in milliseconds
  return Math.max(0, total - elapsed);
}