import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Console, Dashboard, Widget } from '@tinystacks/ops-model';
import { RootState } from 'ops-frontend/store/store';
import { WidgetMap } from 'ops-frontend/types';

type ConsoleSliceState = Console & {
  overrides: { [widgetId: string]: any; };
  hydratedWidgets: { [widgetId: string]: Widget };
};

export const consoleInitialState: ConsoleSliceState = {
  // TODO: when we do console stuff, empty state this guy
  name: '',
  dashboards: {},
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
        dashboards: payload.dashboards,
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
export function selectDashboards(state: RootState): { [id: string]: Dashboard } { return state.console.dashboards };
export function selectDashboardIdFromRoute(route: string) {
  return function (state: RootState): string {
    const { dashboards } = state.console;
    const dashboardId = Object.keys(dashboards).find(dashboard => dashboards[dashboard].route === route);
    return dashboardId || '';
  }
}
export function selectDashboard(dashboardId: string) {
  return function (state: RootState): Dashboard | undefined {
    return state.console.dashboards[dashboardId];
  }
}

export function selectDashboardWidgets(dashboardId: string) {
  return function (state: RootState): Widget[] {
    const { dashboards, hydratedWidgets } = state.console;
    const dashboard: Dashboard = dashboards[dashboardId];
    if (!dashboard || !dashboard.widgetIds) {
      return [];
    }

    return dashboard.widgetIds.map(wid => hydratedWidgets[wid]);
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