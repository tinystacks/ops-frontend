import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Console, Page, Provider, Widget } from '@tinystacks/ops-model';
import FrontendWidget from 'ops-frontend/widgets/widget';
import { RootState } from 'ops-frontend/store/store';
import ErrorWidget from 'ops-frontend/widgets/errorWidget';
import LoadingWidget from 'ops-frontend/widgets/loadingWidget';
import { WidgetParser } from '@tinystacks/ops-core';

interface ConsoleState {
  name: string;
  pages: Record<string, Page>;
  widgets: Record<string, Widget>;
  providers: Record<string, Provider>;
  pageContextWidgets: { [id: string]: Widget };
};

// TODO: Function for getting the console from API, make this empty states
export const consoleInitialState: ConsoleState = {
  name: 'console',
  pages: {},
  widgets: {},
  providers: {},
  pageContextWidgets: {}
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
        pageContextWidgets: {}
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
  return function (state: RootState): FrontendWidget[] {
    const { pages, widgets } = state.console;
    const page: Page = pages[pageId];
    if (!page) {
      return [new ErrorWidget('page', 'page', 'ErrorWidget', '')];
    }

    const widgetStateMap: { [id: string]: FrontendWidget} = {};
    page.widgetIds.forEach((widgetId: string) => {
      if (!widgets[widgetId]) {
        widgetStateMap[widgetId] = new ErrorWidget(widgetId, widgetId, 'ErrorWidget', '');
      } else if (widgets[widgetId]) {
        widgetStateMap[widgetId] = new LoadingWidget(widgetId, widgetId, 'LoadingWidget', '');
      } else {
        // todo - swap this block with stuff from parser
        try {
          const parsedWidget = WidgetParser.parse(widgets[widgetId]);
          widgetStateMap[widgetId] = (parsedWidget);
        }
        catch (e) {
          widgetStateMap[widgetId] = new ErrorWidget(widgetId, widgetId, 'ErrorWidget', '');;
        }
      }
    });

    return Object.values(widgetStateMap);
  }
}
export function selectConsoleState(state: RootState): FrontendWidget[] {
  return state.console;
}

export function selectConsoleName(state: RootState): string {
  return state.console.name;
}

// accepts a pagename as action payload
// 1. use the primary widget set from the console-level (yml) config
// 2. Seed the page-level widgets state with loading items
export function populateWidgetsFromPage (
  state: ConsoleState, action: PayloadAction<string>
): { [id: string]: Widget } {

  const { pages, widgets } = state;
  const page = Object.values(pages).find(page => page.id === action.payload);
  if (!page) {
    return { errorWidget: new ErrorWidget('page', 'page', 'ErrorWidget', '') };
  }

  const widgetStateMap: { [id: string]: Widget} = {};
  page.widgetIds.forEach((widgetId: string) => {
    const widget = widgets[widgetId];
    if (!widget) {
      widgetStateMap[widgetId] = new ErrorWidget(widgetId, widgetId, 'ErrorWidget', '').toJson();
    } else if (!(widget instanceof FrontendWidget)) {
      widgetStateMap[widgetId] = new LoadingWidget(widgetId, widgetId, 'LoadingWidget', '').toJson();
    } else {
      widgetStateMap[widgetId] = widget;
    }
  });

  return widgetStateMap;
}

export default consoleSlice.reducer;