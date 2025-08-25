import { configureStore } from '@reduxjs/toolkit';

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
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 