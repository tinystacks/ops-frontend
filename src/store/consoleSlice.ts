import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "ops-frontend/store/store";

interface ConsoleState {
  pages: string[]
};
  
export const consoleInitialState = {
  pages: []
};

export const consoleSlice = createSlice({
  name: 'counter',
  initialState: consoleInitialState,
  reducers: {
    updatePage: (state: ConsoleState, action: PayloadAction<{ page: string, index: number }>) => {
      state.pages[action.payload.index] = action.payload.page;
    },
    addPage: (state: ConsoleState, action: PayloadAction<string>) => {
      state.pages.push(action.payload);
    }
  }
});

export const { updatePage, addPage } = consoleSlice.actions;
export const selectPages = (state: RootState) => state.console.pages;

export default consoleSlice.reducer;