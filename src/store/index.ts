import { configureStore } from '@reduxjs/toolkit';
import { vehiclesApi } from './api/vehiclesApi';
import { customersApi } from './api/customersApi';
import { salesApi } from './api/salesApi';
import { repairsApi } from './api/repairsApi';
import { inventoryApi } from './api/inventoryApi';
import { invoicesApi } from './api/invoicesApi';
import { uploadApi } from './api/uploadApi';

export const store = configureStore({
  reducer: {
    [vehiclesApi.reducerPath]: vehiclesApi.reducer,
    [customersApi.reducerPath]: customersApi.reducer,
    [salesApi.reducerPath]: salesApi.reducer,
    [repairsApi.reducerPath]: repairsApi.reducer,
    [inventoryApi.reducerPath]: inventoryApi.reducer,
    [invoicesApi.reducerPath]: invoicesApi.reducer,
    [uploadApi.reducerPath]: uploadApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      vehiclesApi.middleware,
      customersApi.middleware,
      salesApi.middleware,
      repairsApi.middleware,
      inventoryApi.middleware,
      invoicesApi.middleware,
      uploadApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 