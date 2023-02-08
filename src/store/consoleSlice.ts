import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Page, Provider, Widget } from "@tinystacks/ops-model";
import { RootState } from "ops-frontend/store/store";
import Markdown from "ops-frontend/widgets/markdown";
interface ConsoleState {
  name: string;
  pages: Record<string, Page>;
  widgets: Record<string, Widget>;
  providers: Record<string, Provider>;
};
  
// TODO: Function for getting the console from API, make this empty states
export const consoleInitialState: ConsoleState = {
  name: 'test-console',
  pages:{
    "main-page": {
      route: "main-page",
      widgetIds: [
        "simple-md-panel"
      ]
    }
  },
  widgets: {
    "simple-md-panel": {
      type: "Markdown",
      displayName: 'markdown',
      providerId: 'nothing for now'
    }
  },
  providers: {}
};


export const consoleSlice = createSlice({
  name: 'counter',
  initialState: consoleInitialState,
  reducers: {
    // TODO: API Req + thunk it
    updateConsoleName: (state: ConsoleState, action: PayloadAction<string>) => {
      state.name = action.payload;
    }
  }
});

export const { updateConsoleName } = consoleSlice.actions;
export function selectName(state: RootState) { return state.console.name };
export function selectPages(state: RootState) { return state.console.pages };
export function selectPageIdFromRoute(route: string) {
  return function (state: RootState): string {
    const { pages } = state.console;
    const pageId = Object.keys(pages).find(page => pages[page].route === route);
    return pageId || "";
  }
}
export function selectPage(pageId: string) {
  return function (state: RootState) {
    return state.console.pages[pageId];
  }
}

export function selectPageWidgets(pageId: string) {
  return function (state: RootState) {
    const { pages, widgets } = state.console;
    const selectedPageWidgetIds = new Set<string>(pages[pageId]?.widgetIds || []);
    return Object.keys(widgets)
      .filter((id: string) => selectedPageWidgetIds.has(id))
      .map((id: string) => {
        const widget = widgets[id];
        if (widget.type === 'Markdown') {
          const mdWidget = Markdown.fromJson(widget);
          mdWidget.getData();
          return mdWidget;
        }

        return undefined;
      })
      .filter(mdWidget => mdWidget !== undefined);
  }
}

export default consoleSlice.reducer;