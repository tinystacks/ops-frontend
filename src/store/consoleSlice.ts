import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TinyStacksError } from '@tinystacks/ops-core';
import { ApiError, Console, Dashboard, Widget } from '@tinystacks/ops-model';
import { AppDispatch, RootState } from 'ops-frontend/store/store';
import { ShowableError, WidgetMap } from 'ops-frontend/types';
import apis from 'ops-frontend/utils/apis';

export const createNewDashboard = (consoleName: string, dashboard: Dashboard) => async (dispatch: AppDispatch) => {
  await dispatch(createTempDashboard(dashboard));

  try {
    await apis.createDashboard(consoleName, dashboard);
    return dispatch(fetchConsoles(consoleName));
  } catch (e) {
    const error = (e as any).body as ApiError;
    await dispatch(removeTempDashboard(dashboard));
    return dispatch(handleError({
      title: 'Failed to create dashboard!',
      error: error?.body || error
    }));
  }
}

export const fetchConsoles = (consoleName?: string) => async (dispatch: AppDispatch) => {
  try {
    const response = await apis.getConsoles();
    const consoles = (response || []) as Console[];
    const console = consoleName ?
      consoles.find(c => c.name === consoleName) :
      consoles.at(0);
    return dispatch(updateConsole(console || {} as Console));
  } catch (e) {
    const error = (e as any).body as ApiError;
    return handleError({
      title: 'Failed to fetch consoles!',
      error: error?.body || error
    });
  }
}

export const updateDashboard = (consoleName: string, dashboard: Dashboard, dashboardId?: string) =>
  async (dispatch: AppDispatch) => {
    try {
      await apis.updateDashboard(consoleName, dashboard, dashboardId);
      return dispatch(fetchDashboards(consoleName));
    } catch (e) {
      const error = (e as any).body as ApiError;
      return dispatch(handleError({
        title: 'Failed to update dashboard!',
        error: error?.body || error
      }));
    }
  }

export const fetchDashboards = (consoleName: string) => async (dispatch: AppDispatch) => {
  try {
    const dashboards = await apis.getDashboards(consoleName);
    return dispatch(updateDashboards(dashboards || [] as Dashboard[]));
  } catch (e) {
    const error = (e as any).body as ApiError;
    return dispatch(handleError({
      title: 'Failed to fetch dashboards!',
      error: error?.body
    }));
  }
}

type ConsoleSliceState = Console & {
  overrides: { [widgetId: string]: any; };
  hydratedWidgets: { [widgetId: string]: Widget };
  error?: ShowableError;
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
    },
    handleError: function (state: ConsoleSliceState, action: PayloadAction<{ title: string; error: any }>) {
      if (TinyStacksError.isTinyStacksError(action.payload.error)) {
        state.error = {
          title: action.payload.title,
          ...action.payload.error
        };
      } else {
        state.error = {
          title: action.payload.title,
          message: action.payload.error.message
        };
      }
    },
    dismissError: function (state: ConsoleSliceState) {
      state.error = undefined;
    },
    createTempDashboard: function (state: ConsoleSliceState, action: PayloadAction<Dashboard>) {
      const dashboard = action.payload;
      state.dashboards[dashboard.id] = dashboard;
      return state;
    },
    removeTempDashboard: function (state: ConsoleSliceState, action: PayloadAction<Dashboard>) {
      const dashboard = action.payload;
      delete state.dashboards[dashboard.id];
      return state;
    },
    updateDashboards: function (state: ConsoleSliceState, action: PayloadAction<Dashboard[]>) {
      state.dashboards = action.payload.reduce<Record<string, Dashboard>>((acc, dashboard) => {
        acc[dashboard.id] = dashboard;
        return acc;
      }, {});
      return state;
    }
  }
});

export const {
  updateConsoleName,
  updateHydratedWidget,
  deleteWidget,
  updateConsole,
  udpateWidgetOverrides,
  updateWidget,
  handleError,
  dismissError,
  createTempDashboard,
  removeTempDashboard,
  updateDashboards
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

export function selectError(state: RootState): ShowableError | undefined {
  return state.console.error;
}

export default consoleSlice.reducer;