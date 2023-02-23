import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Console, Page, Provider, Widget } from '@tinystacks/ops-model';
import { WidgetParser as FrontendWidget } from '@tinystacks/ops-core';
import { RootState } from 'ops-frontend/store/store';

interface ConsoleState {
  name: string;
  pages: Record<string, Page>;
  widgets: Record<string, Widget>;
  providers: Record<string, Provider>;
  dependencies: { [id: string]: string };
};

export const consoleInitialState: ConsoleState = {
  // TODO: when we do console stuff, empty state this guy
  name: 'console',
  pages: {},
  widgets: {},
  providers: {},
  dependencies: {}
};


export const consoleSlice = createSlice({
  name: 'console',
  initialState: consoleInitialState,
  reducers: {
    // TODO: API Req + thunk it
    updateConsoleName: function (state: ConsoleState, action: PayloadAction<string>) {
      return {
        ...state,
        name: action.payload
      };
    },
    updatePageWidget: function (state: ConsoleState, action: PayloadAction<Widget>) {
      const widgets = { ...state.widgets };
      widgets[action.payload.id || ''] = action.payload;
      return {
        ...state,
        widgets
      };
    },
    updateConsole: function (state: ConsoleState, action: PayloadAction<Console>) {
      const { payload } = action;
      return {
        name: payload.name,
        pages: payload.pages,
        widgets: payload.widgets,
        providers: payload.providers,
        dependencies: { ...payload.dependencies }
      };
    }
  }
});

export const {
  updateConsoleName, updatePageWidget, updateConsole
} = consoleSlice.actions;

export function selectName(state: RootState) { return state.console.name };
export function selectPages(state: RootState) { return state.console.pages };
export function selectPageIdFromRoute(route: string) {
  return function (state: RootState): string {
    const { pages } = state.console;
    const pageId = Object.keys(pages).find(page => pages[page].route === route);
    return pageId || '';
  }
}
export function selectPage(pageId: string) {
  return function (state: RootState) {
    return state.console.pages[pageId];
  }
}

export function selectPageWidgets(pageId: string) {
  return function (state: RootState): Widget[] {
    const { pages, widgets } = state.console;
    const page: Page = pages[pageId];
    if (!page || !page.widgetIds) {
      return [];
    }
  
    return page.widgetIds.map(wid => widgets[wid]);
  }
}
export function selectConsoleState(state: RootState): FrontendWidget[] {
  return state.console;
}

export function selectDependencies(state: RootState): {[id: string]: string} {
  return state.console.dependencies;
}

export function selectConsoleName(state: RootState): string {
  return state.console.name;
}

export default consoleSlice.reducer;