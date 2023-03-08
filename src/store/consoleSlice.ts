import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Console, Page, Widget } from '@tinystacks/ops-model';
import { RootState } from 'ops-frontend/store/store';
import { WidgetMap } from 'ops-frontend/types';

type ConsoleSliceState = Console & {
  overrides: { [widgetId: string]: any; };
  hydratedWidgets: { [widgetId: string]: Widget };
};

export const consoleInitialState: ConsoleSliceState = {
  // TODO: when we do console stuff, empty state this guy
  name: 'console',
  pages: {},
  widgets: {},
  providers: {},
  dependencies: {},
  hydratedWidgets: {},
  overrides: {}
};


export const consoleSlice = createSlice({
  name: 'console',
  initialState: consoleInitialState,
  reducers: {
    // TODO: API Req + thunk it
    updateConsoleName: function (state: ConsoleSliceState, action: PayloadAction<string>) {
      return {
        ...state,
        name: action.payload
      };
    },
    updateHydratedWidget: function (state: ConsoleSliceState, action: PayloadAction<Widget>) {
      const hydratedWidgets  = { ...state.hydratedWidgets };
      hydratedWidgets[action.payload.id || ''] = action.payload;
      return {
        ...state,
        hydratedWidgets
      };
    },
    updateWidget: function (state: ConsoleSliceState, action: PayloadAction<Widget>) {
      const widgets  = { ...state.widgets };
      widgets[action.payload.id || ''] = action.payload;
      return {
        ...state,
        widgets
      };
    }, 
    deleteWidget: function (state: ConsoleSliceState, action: PayloadAction<string>) {
      const widgets = { ...state.widgets };
      const hydratedWidgets = { ...state.hydratedWidgets };

      delete(widgets[action.payload]);
      delete(hydratedWidgets[action.payload]);
      return {
        ...state,
        widgets,
        hydratedWidgets
      };
    },
    updateConsole: function (state: ConsoleSliceState, action: PayloadAction<Console>) {
      const { payload } = action;
      return {
        ...state,
        name: payload.name,
        pages: payload.pages,
        widgets: payload.widgets,
        hydratedWidgets: payload.widgets,
        providers: payload.providers,
        dependencies: { ...payload.dependencies }
      };
    },
    udpateWidgetOverrides: function (
      state: ConsoleSliceState, action: PayloadAction<{ widgetId: string, widgetOverrides: any }>
    ) {
      const { widgetId, widgetOverrides } = action.payload;
      const consoleOverrides = { ...state.overrides };
      consoleOverrides[widgetId] = widgetOverrides;
      return {
        ...state,
        overrides: widgetOverrides
      }
    }
  }
});

export const {
  updateConsoleName, updateHydratedWidget, deleteWidget, updateConsole, udpateWidgetOverrides, updateWidget
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
    const { pages, hydratedWidgets } = state.console;
    const page: Page = pages[pageId];
    if (!page || !page.widgetIds) {
      return [];
    }

    return page.widgetIds.map(wid => hydratedWidgets[wid]);
  }
}
export function selectConsoleState(state: RootState): Console {
  return state.console;
}

export function selectConsoleWidgets(state: RootState): WidgetMap {
  return state.console.widgets;
}

export function selectHydratedWidgets(state: RootState): WidgetMap {
  return state.console.hydratedWidgets;
}

export function selectDependencies(state: RootState): {[id: string]: string} {
  return state.console.dependencies;
}

export function selectConsoleName(state: RootState): string {
  return state.console.name;
}

export function selectWidgetOverrides(widgetId: string) {
  return function(state: RootState): any {
    return state.console.overrides[widgetId];
  }
}

export function selectWidget(widgetId: string) {
  return function(state: RootState): Widget {
    return state.console.widgets[widgetId];
  }
}


export default consoleSlice.reducer;