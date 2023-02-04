import type { PreloadedState } from '@reduxjs/toolkit';
import { configureStore } from '@reduxjs/toolkit';
import consoleReducer from 'ops-frontend/store/consoleSlice';

const rootReducer = {
  console: consoleReducer
};


export function setupStore(preloadedState?: PreloadedState<RootState>): any {
  return configureStore({
    reducer: rootReducer,
    preloadedState
  })
};

export const store = setupStore();


export type RootStore = ReturnType<typeof store>;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;