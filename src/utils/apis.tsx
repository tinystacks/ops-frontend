import { Dashboard, OpsApiClient, TinyStacksError, Widget } from '@tinystacks/ops-model';
import { GetWidgetArguments } from 'ops-frontend/types';
import ErrorWidget from 'ops-frontend/widgets/error-widget';

// This file mostly exists to make testing easy
const client = new OpsApiClient({ BASE: '/api' });
const apis = {
  async getWidget(args: GetWidgetArguments): Promise<Widget> {
    const {
      consoleName,
      widget,
      overrides,
      dashboardId,
      parameters
    } = args;
    
    // We want this to be synchronous so that we're not overwriting state inconsistently
    // Later, we can batch requests + writes to state for better performance

    return parseWidgetResult(
      await client.widget.getWidget(
        consoleName,
        widget.id,
        overrides,
        JSON.stringify(parameters),
        dashboardId
      ).catch(e => e.message),
      widget
    );
  },
  async deleteWidget(consoleName: string, widgetId: string) {
    const deleted = await client.widget.deleteWidget(consoleName, widgetId);
    try {
      return deleted as Widget;
    } catch (e) {
      throw deleted as TinyStacksError;
    }
  },
  async updateWidget(consoleName: string, widgetId: string, widget: Widget): Promise<Widget> {
    const updatedWidget = await client.widget.updateWidget(consoleName, widgetId, widget);
    try {
      return updatedWidget as Widget;
    } catch (e) {
      throw updatedWidget as TinyStacksError;
    }
  },
  async createWidget(consoleName: string, widget: Widget) {
    return parseWidgetResult(
      await client.widget.createWidget(consoleName, widget).catch(e => e),
      widget
    );
  },
  async getConsoles() {
    return await client.console.getConsoles();
  },
  async createDashboard (consoleName: string, dashboard: Dashboard) {
    const newDashboard = await client.dashboard.createDashboard(consoleName, dashboard);
    try {
      return newDashboard as Dashboard;
    } catch (e) {
      throw newDashboard as TinyStacksError;
    }
  },
  async updateDashboard (consoleName: string, dashboard: Dashboard, dashboardId?: string) {
    const id = dashboardId || dashboard.id;
    const updatedDashboard = await client.dashboard.updateDashboard(consoleName, id, dashboard);
    try {
      return updatedDashboard as Dashboard;
    } catch (e) {
      throw updatedDashboard as TinyStacksError;
    }
  },
  async getDashboards (consoleName: string) {
    const dashboards = await client.dashboard.getDashboards(consoleName);
    try {
      return dashboards as Dashboard[];
    } catch (e) {
      throw dashboards as TinyStacksError;
    }
  }
};


function parseWidgetResult(fetchedWidget: Widget | TinyStacksError, widget: Widget) {
  let renderWidget: Widget;
  // Widget type vs error check
  const castWidget = fetchedWidget as Widget;
  if (castWidget.type && castWidget.id && castWidget.displayName) {
    renderWidget = castWidget;
  } else {
    renderWidget = ErrorWidget.fromJson({
      ...widget,
      type: 'ErrorWidget',
      originalType: widget.type,
      error: (fetchedWidget as TinyStacksError).message || ''
    }).toJson();
  }

  return renderWidget;
}

export default apis;