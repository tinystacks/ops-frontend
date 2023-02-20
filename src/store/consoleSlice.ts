import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Console, Page, Provider, Widget } from '@tinystacks/ops-model';
import { WidgetParser as FrontendWidget } from '@tinystacks/ops-core';
import { RootState } from 'ops-frontend/store/store';
import ErrorWidget from 'ops-frontend/widgets/errorWidget';
import { Markdown, Tabs } from '@tinystacks/ops-core-widgets';
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
  return function (state: RootState): FrontendWidget[] {
    const { pages, widgets } = state.console;
    const page: Page = pages[pageId];
    if (!page) {
      // return [new ErrorWidget('page', 'page', 'ErrorWidget', '')];
      return [];
    }

    const widgetStateMap: { [id: string]: FrontendWidget} = {};
    page.widgetIds.forEach((widgetId: string) => {
      const w = widgets[widgetId];
      const { id, displayName } = w; 
      if (!w) {
        widgetStateMap[widgetId] = new ErrorWidget(widgetId, widgetId, 'ErrorWidget', '');
      } else {
        switch (w.type) {
          case 'Tabs':
            widgetStateMap[widgetId] = Tabs.fromJson(w);
            break;
          case 'Markdown':
            widgetStateMap[widgetId] = Markdown.fromJson(w);
            break;
          default:
             widgetStateMap[widgetId] = ErrorWidget.fromJson({
                id,
                type: 'ErrorWidget',
                providerId: '',
                displayName
             });
        }
        // TODO: SWAP TO THIS WHEN I CAN GET IT WORKING
        // try {
          // const WidgetTNow = __non_webpack_require__(dependencies[w.type])
          // widgetStateMap[widgetId] = WidgetTNow.fromJson(w);
          // widgetStateMap[widgetId] = WidgetParser.fromJson(w, dependencies[w.type]);
        // }
        // catch (e) { 
          // widgetStateMap[widgetId] = new ErrorWidget(widgetId, widgetId, 'ErrorWidget', '');;
        // }
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

export default consoleSlice.reducer;