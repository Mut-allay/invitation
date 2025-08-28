import React, { createContext, useReducer, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './auth-hooks';
import type { Vehicle } from '../types/vehicle';

// Data state interface
interface DataState {
  vehicles: {
    data: Vehicle[];
    loading: boolean;
    error: string | null;
    lastUpdated: Date | null;
  };
  cache: {
    [key: string]: {
      data: unknown;
      timestamp: number;
      ttl: number; // Time to live in milliseconds
    };
  };
  realTimeSubscriptions: {
    [key: string]: () => void;
  };
}

// Action types
type DataAction =
  | { type: 'SET_VEHICLES_LOADING'; payload: boolean }
  | { type: 'SET_VEHICLES_DATA'; payload: Vehicle[] }
  | { type: 'SET_VEHICLES_ERROR'; payload: string | null }
  | { type: 'UPDATE_VEHICLE'; payload: Vehicle }
  | { type: 'ADD_VEHICLE'; payload: Vehicle }
  | { type: 'REMOVE_VEHICLE'; payload: string }
  | { type: 'SET_CACHE'; payload: { key: string; data: unknown; ttl?: number } }
  | { type: 'CLEAR_CACHE'; payload?: string }
  | { type: 'ADD_SUBSCRIPTION'; payload: { key: string; unsubscribe: () => void } }
  | { type: 'REMOVE_SUBSCRIPTION'; payload: string }
  | { type: 'CLEAR_ALL_SUBSCRIPTIONS' };

// Initial state
const initialState: DataState = {
  vehicles: {
    data: [],
    loading: false,
    error: null,
    lastUpdated: null,
  },
  cache: {},
  realTimeSubscriptions: {},
};

// Reducer function
function dataReducer(state: DataState, action: DataAction): DataState {
  switch (action.type) {
    case 'SET_VEHICLES_LOADING':
      return {
        ...state,
        vehicles: {
          ...state.vehicles,
          loading: action.payload,
        },
      };

    case 'SET_VEHICLES_DATA':
      return {
        ...state,
        vehicles: {
          data: action.payload,
          loading: false,
          error: null,
          lastUpdated: new Date(),
        },
      };

    case 'SET_VEHICLES_ERROR':
      return {
        ...state,
        vehicles: {
          ...state.vehicles,
          loading: false,
          error: action.payload,
        },
      };

    case 'UPDATE_VEHICLE':
      return {
        ...state,
        vehicles: {
          ...state.vehicles,
          data: state.vehicles.data.map(vehicle =>
            vehicle.id === action.payload.id ? action.payload : vehicle
          ),
          lastUpdated: new Date(),
        },
      };

    case 'ADD_VEHICLE':
      return {
        ...state,
        vehicles: {
          ...state.vehicles,
          data: [...state.vehicles.data, action.payload],
          lastUpdated: new Date(),
        },
      };

    case 'REMOVE_VEHICLE':
      return {
        ...state,
        vehicles: {
          ...state.vehicles,
          data: state.vehicles.data.filter(vehicle => vehicle.id !== action.payload),
          lastUpdated: new Date(),
        },
      };

    case 'SET_CACHE':
      return {
        ...state,
        cache: {
          ...state.cache,
          [action.payload.key]: {
            data: action.payload.data,
            timestamp: Date.now(),
            ttl: action.payload.ttl || 5 * 60 * 1000, // Default 5 minutes
          },
        },
      };

    case 'CLEAR_CACHE':
      if (action.payload) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [action.payload]: _, ...rest } = state.cache;
        return {
          ...state,
          cache: rest,
        };
      }
      return {
        ...state,
        cache: {},
      };

    case 'ADD_SUBSCRIPTION':
      return {
        ...state,
        realTimeSubscriptions: {
          ...state.realTimeSubscriptions,
          [action.payload.key]: action.payload.unsubscribe,
        },
      };

    case 'REMOVE_SUBSCRIPTION': {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [action.payload]: _, ...rest } = state.realTimeSubscriptions;
      return {
        ...state,
        realTimeSubscriptions: rest,
      };
    }

    case 'CLEAR_ALL_SUBSCRIPTIONS':
      return {
        ...state,
        realTimeSubscriptions: {},
      };

    default:
      return state;
  }
}

// Context interface
interface DataContextType {
  state: DataState;
  dispatch: React.Dispatch<DataAction>;
  // Cache utilities
  getCachedData: <T>(key: string) => T | null;
  setCachedData: <T>(key: string, data: T, ttl?: number) => void;
  clearCache: (key?: string) => void;
  // Subscription utilities
  addSubscription: (key: string, unsubscribe: () => void) => void;
  removeSubscription: (key: string) => void;
  clearAllSubscriptions: () => void;
  // Vehicle utilities
  updateVehicle: (vehicle: Vehicle) => void;
  addVehicle: (vehicle: Vehicle) => void;
  removeVehicle: (vehicleId: string) => void;
}

// Create context
const DataContext = createContext<DataContextType | undefined>(undefined);

// Provider component
export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(dataReducer, initialState);
  const { userProfile } = useAuth();

  // Cache utilities
  const getCachedData = <T,>(key: string): T | null => {
    const cached = state.cache[key];
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > cached.ttl;
    if (isExpired) {
      dispatch({ type: 'CLEAR_CACHE', payload: key });
      return null;
    }

    return cached.data as T;
  };

  const setCachedData = <T,>(key: string, data: T, ttl?: number) => {
    dispatch({ type: 'SET_CACHE', payload: { key, data, ttl } });
  };

  const clearCache = (key?: string) => {
    dispatch({ type: 'CLEAR_CACHE', payload: key });
  };

  // Subscription utilities
  const addSubscription = (key: string, unsubscribe: () => void) => {
    dispatch({ type: 'ADD_SUBSCRIPTION', payload: { key, unsubscribe } });
  };

  const removeSubscription = (key: string) => {
    const unsubscribe = state.realTimeSubscriptions[key];
    if (unsubscribe) {
      unsubscribe();
      dispatch({ type: 'REMOVE_SUBSCRIPTION', payload: key });
    }
  };

  const clearAllSubscriptions = useCallback(() => {
    Object.values(state.realTimeSubscriptions).forEach(unsubscribe => unsubscribe());
    dispatch({ type: 'CLEAR_ALL_SUBSCRIPTIONS' });
  }, [state.realTimeSubscriptions, dispatch]);

  // Vehicle utilities
  const updateVehicle = (vehicle: Vehicle) => {
    dispatch({ type: 'UPDATE_VEHICLE', payload: vehicle });
  };

  const addVehicle = (vehicle: Vehicle) => {
    dispatch({ type: 'ADD_VEHICLE', payload: vehicle });
  };

  const removeVehicle = (vehicleId: string) => {
    dispatch({ type: 'REMOVE_VEHICLE', payload: vehicleId });
  };

  // Cleanup subscriptions on unmount
  useEffect(() => {
    return () => {
      clearAllSubscriptions();
    };
  }, [clearAllSubscriptions]);

  // Clear cache when user changes
  useEffect(() => {
    if (userProfile?.tenantId) {
      clearCache();
    }
  }, [userProfile?.tenantId]);

  const value: DataContextType = {
    state,
    dispatch,
    getCachedData,
    setCachedData,
    clearCache,
    addSubscription,
    removeSubscription,
    clearAllSubscriptions,
    updateVehicle,
    addVehicle,
    removeVehicle,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export type { DataContextType };
export default DataContext; 