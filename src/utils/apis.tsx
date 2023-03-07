import { OpsApiClient, TinyStacksError, Widget } from '@tinystacks/ops-model';
import ErrorWidget from 'ops-frontend/widgets/errorWidget';

// This file mostly exists to make testing easy
const client = new OpsApiClient({ BASE: '/api' });
const apis = {
  async getWidget(consoleName: string, widget: Widget, overrides?: any): Promise<Widget> {
    // We want this to be synchronous so that we're not overwriting state inconsistently
    // Later, we can batch requests + writes to state for better performance

    return parseWidgetResult(
      await client.widget.getWidget(consoleName, widget.id, overrides).catch(e => e.message),
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
  }
};


function parseWidgetResult(fetchedWidget: Widget | TinyStacksError, widget: Widget) {
  let renderWidget: Widget;
  // Widget type vs error check
  const castWidget = fetchedWidget as Widget;
  if (castWidget.type && castWidget.id && castWidget.displayName) {
    renderWidget = castWidget;
  } else {
    // TODO: error message
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