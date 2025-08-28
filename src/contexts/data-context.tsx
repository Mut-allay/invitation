import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';

// Define data types
interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  [key: string]: unknown;
}

interface Vehicle {
  id: string;
  make: string;
  model?: string;
  [key: string]: unknown;
}

// State interface
interface DataState {
  customers: Customer[];
  vehicles: Vehicle[];
  repairs: unknown[];
  sales: unknown[];
  invoices: unknown[];
  inventory: unknown[];
}

// Action types
type DataAction =
  | { type: 'SET_CUSTOMERS'; payload: Customer[] }
  | { type: 'SET_VEHICLES'; payload: Vehicle[] }
  | { type: 'SET_REPAIRS'; payload: unknown[] }
  | { type: 'SET_SALES'; payload: unknown[] }
  | { type: 'SET_INVOICES'; payload: unknown[] }
  | { type: 'SET_INVENTORY'; payload: unknown[] }
  | { type: 'ADD_CUSTOMER'; payload: Customer }
  | { type: 'UPDATE_CUSTOMER'; payload: Customer }
  | { type: 'DELETE_CUSTOMER'; payload: string }
  | { type: 'ADD_VEHICLE'; payload: Vehicle }
  | { type: 'UPDATE_VEHICLE'; payload: Vehicle }
  | { type: 'DELETE_VEHICLE'; payload: string }
  | { type: 'ADD_REPAIR'; payload: unknown }
  | { type: 'UPDATE_REPAIR'; payload: unknown }
  | { type: 'DELETE_REPAIR'; payload: string }
  | { type: 'ADD_SALE'; payload: unknown }
  | { type: 'UPDATE_SALE'; payload: unknown }
  | { type: 'DELETE_SALE'; payload: string }
  | { type: 'ADD_INVOICE'; payload: unknown }
  | { type: 'UPDATE_INVOICE'; payload: unknown }
  | { type: 'DELETE_INVOICE'; payload: string }
  | { type: 'ADD_INVENTORY_ITEM'; payload: unknown }
  | { type: 'UPDATE_INVENTORY_ITEM'; payload: unknown }
  | { type: 'DELETE_INVENTORY_ITEM'; payload: string };

// Initial state
const initialState: DataState = {
  customers: [],
  vehicles: [],
  repairs: [],
  sales: [],
  invoices: [],
  inventory: [],
};

// Reducer function
const dataReducer = (state: DataState, action: DataAction): DataState => {
  switch (action.type) {
    case 'SET_CUSTOMERS':
      return { ...state, customers: action.payload };
    case 'SET_VEHICLES':
      return { ...state, vehicles: action.payload };
    case 'SET_REPAIRS':
      return { ...state, repairs: action.payload };
    case 'SET_SALES':
      return { ...state, sales: action.payload };
    case 'SET_INVOICES':
      return { ...state, invoices: action.payload };
    case 'SET_INVENTORY':
      return { ...state, inventory: action.payload };
    case 'ADD_CUSTOMER':
      return { ...state, customers: [...state.customers, action.payload] };
    case 'UPDATE_CUSTOMER':
      return {
        ...state,
        customers: state.customers.map(customer =>
          customer.id === action.payload.id ? action.payload : customer
        ),
      };
    case 'DELETE_CUSTOMER':
      return {
        ...state,
        customers: state.customers.filter(customer => customer.id !== action.payload),
      };
    case 'ADD_VEHICLE':
      return { ...state, vehicles: [...state.vehicles, action.payload] };
    case 'UPDATE_VEHICLE':
      return {
        ...state,
        vehicles: state.vehicles.map(vehicle =>
          vehicle.id === action.payload.id ? action.payload : vehicle
        ),
      };
    case 'DELETE_VEHICLE':
      return {
        ...state,
        vehicles: state.vehicles.filter(vehicle => vehicle.id !== action.payload),
      };
    case 'ADD_REPAIR':
      return { ...state, repairs: [...state.repairs, action.payload] };
    case 'UPDATE_REPAIR':
      return {
        ...state,
        repairs: state.repairs.map((repair, index) =>
          index === 0 ? action.payload : repair
        ),
      };
    case 'DELETE_REPAIR':
      return {
        ...state,
        repairs: state.repairs.filter((_, index) => index !== 0),
      };
    case 'ADD_SALE':
      return { ...state, sales: [...state.sales, action.payload] };
    case 'UPDATE_SALE':
      return {
        ...state,
        sales: state.sales.map((sale, index) =>
          index === 0 ? action.payload : sale
        ),
      };
    case 'DELETE_SALE':
      return {
        ...state,
        sales: state.sales.filter((_, index) => index !== 0),
      };
    case 'ADD_INVOICE':
      return { ...state, invoices: [...state.invoices, action.payload] };
    case 'UPDATE_INVOICE':
      return {
        ...state,
        invoices: state.invoices.map((invoice, index) =>
          index === 0 ? action.payload : invoice
        ),
      };
    case 'DELETE_INVOICE':
      return {
        ...state,
        invoices: state.invoices.filter((_, index) => index !== 0),
      };
    case 'ADD_INVENTORY_ITEM':
      return { ...state, inventory: [...state.inventory, action.payload] };
    case 'UPDATE_INVENTORY_ITEM':
      return {
        ...state,
        inventory: state.inventory.map((item, index) =>
          index === 0 ? action.payload : item
        ),
      };
    case 'DELETE_INVENTORY_ITEM':
      return {
        ...state,
        inventory: state.inventory.filter((_, index) => index !== 0),
      };
    default:
      return state;
  }
};

// Context interface
interface DataContextType {
  state: DataState;
  dispatch: React.Dispatch<DataAction>;
}

// Create context
const DataContext = createContext<DataContextType | undefined>(undefined);

// Provider component
export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  useEffect(() => {
    // Cleanup function
    return () => {
      // Any cleanup logic here
    };
  }, []);

  const value: DataContextType = {
    state,
    dispatch,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

// Hook to use the context
export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}; 