import { configureStore } from '@reduxjs/toolkit';
import { vehiclesApi } from './api/vehiclesApi';
import { customersApi } from './api/customersApi';
import { salesApi } from './api/salesApi';

export const store = configureStore({
  reducer: {
    [vehiclesApi.reducerPath]: vehiclesApi.reducer,
    [customersApi.reducerPath]: customersApi.reducer,
    [salesApi.reducerPath]: salesApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      vehiclesApi.middleware,
      customersApi.middleware,
      salesApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 