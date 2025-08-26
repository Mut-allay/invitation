import { configureStore } from '@reduxjs/toolkit';
import { vehiclesApi } from './api/vehiclesApi';
import { customersApi } from './api/customersApi';
import { inventoryApi } from './api/inventoryApi';
import { invoicesApi } from './api/invoicesApi';
import { repairsApi } from './api/repairsApi';
import { salesApi } from './api/salesApi';
import { uploadApi } from './api/uploadApi';

// Basic reducer to prevent the "no valid reducer" error
const initialState = {
  app: {
    initialized: false,
  },
};

const appReducer = (state = initialState, action: { type: string; payload?: unknown }) => {
  switch (action.type) {
    case 'app/initialized':
      return {
        ...state,
        app: {
          ...state.app,
          initialized: true,
        },
      };
    default:
      return state;
  }
};

export const store = configureStore({
  reducer: {
    app: appReducer,
    [vehiclesApi.reducerPath]: vehiclesApi.reducer,
    [customersApi.reducerPath]: customersApi.reducer,
    [inventoryApi.reducerPath]: inventoryApi.reducer,
    [invoicesApi.reducerPath]: invoicesApi.reducer,
    [repairsApi.reducerPath]: repairsApi.reducer,
    [salesApi.reducerPath]: salesApi.reducer,
    [uploadApi.reducerPath]: uploadApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(
      vehiclesApi.middleware,
      customersApi.middleware,
      inventoryApi.middleware,
      invoicesApi.middleware,
      repairsApi.middleware,
      salesApi.middleware,
      uploadApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 