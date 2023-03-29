import React, { useState } from 'react';
import isEmpty from 'lodash.isempty';
import isEqual from 'lodash.isequal';
import camelCase from 'lodash.camelcase';
import apis from 'ops-frontend/utils/apis';
import WrappedWidget from 'ops-frontend/components/widget/wrapped-widget';
import { useRouter } from 'next/router'
import { DashboardWrapper } from 'ops-frontend/components/dashboard/dashboard-wrapper';
import {
  selectConsoleName, selectConsoleWidgets, selectDependencies, selectHydratedWidgets, selectDashboard,
  selectDashboardIdFromRoute, selectDashboardWidgets, updateHydratedWidget
} from 'ops-frontend/store/consoleSlice';
import { useAppSelector } from 'ops-frontend/store/hooks';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef } from 'react';
import { useAppDispatch } from 'ops-frontend/store/hooks';
import { AppDispatch } from 'ops-frontend/store/store';
import { FullpageLayout } from 'ops-frontend/components/layout/fullpage-layout';
import { Widget } from '@tinystacks/ops-model';
import { FlatMap, WidgetMap } from 'ops-frontend/types';
import { dashboardQueryToDashboardRoute } from 'ops-frontend/utils/route';
// @ts-ignore
import * as plugins from 'ops-frontend/plugins'; // eslint-disable-line import/no-unresolved

// A dashboard consists of
// 1. A dashboard-level header with the dashboard title and actions
// 2. A rendered-out list of widgets
function Dashboard() {
  const { t: common } = useTranslation('common');
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { dashboard: dashboardQuery } = router.query;
  const dashboardRoute = dashboardQueryToDashboardRoute(dashboardQuery);

  const consoleName = useAppSelector(selectConsoleName);
  const dashboardId = useAppSelector(selectDashboardIdFromRoute(dashboardRoute));
  const dashboard = useAppSelector(selectDashboard(dashboardId));
  const dashboardWidgets = useAppSelector(selectDashboardWidgets(dashboardId));
  const previousDashboardWidgets = usePreviousValue(dashboardWidgets);
  const dependencies = useAppSelector(selectDependencies);
  const consoleWidgets = useAppSelector(selectConsoleWidgets);
  const previousConsoleWidgets = usePreviousValue(consoleWidgets);
  const hydratedWidgets = useAppSelector(selectHydratedWidgets);
  const previousHydratedWidgets = usePreviousValue(hydratedWidgets);

  const [renderedWidgets, setRenderedWidgets] = useState<{ [widgetId: string]: JSX.Element }>({});

  useEffect(() => {
    if ((!previousDashboardWidgets || isEmpty(Object.keys(previousDashboardWidgets)))
      && dashboardWidgets && !isEmpty(Object.keys(dashboardWidgets))) {
      void fetchWidgetsForDashboard(consoleName, dashboardWidgets, consoleWidgets, dispatch);
    }
  });

  useEffect(() => {
    async function importAndRenderWidgets() {
      const deepRenderedWidgets = { ...renderedWidgets };
      for (let widget of dashboardWidgets) {
        deepRenderedWidgets[widget.id || ''] = await renderWidgetAndChildren(widget, hydratedWidgets, dependencies);
      }

      setRenderedWidgets(deepRenderedWidgets);
    }

    // TODO: deep compare widget trees that are rendered on this dashboard instead
    if ((
        !isEqual(previousDashboardWidgets, dashboardWidgets) ||
        !isEqual(previousConsoleWidgets, consoleWidgets) ||
        !isEqual(previousHydratedWidgets, hydratedWidgets)
      ) && !isEmpty(dependencies)
    ) {
      void importAndRenderWidgets();
    }
  }, [
    previousDashboardWidgets, dashboardWidgets, dependencies, renderedWidgets, previousConsoleWidgets, consoleWidgets,
    hydratedWidgets, previousHydratedWidgets
  ]);

  function renderDashboard() {
    if (!dashboard) {
      return <FullpageLayout>{common('notFound')}</FullpageLayout>;
    }

    return (
      <>{renderDashboardWidgets()}</>
    );
  }

  function renderDashboardWidgets() {
    return (
      <div>
        {Object.values(renderedWidgets)}
      </div>
    );
  }

  return (
    <DashboardWrapper
      dashboardContents={renderDashboard()}
      dashboardId={dashboardId}
    />
  )
}

// dashboardWidgets only gives us the top-level widgets on the dashboard. Those widgets may have children
// because of that, we need console widgets to find and call getWidget on all of those widgets as well
// we don't have to worry about these widgets polluting dashboardWidgets because that's all selected out
export async function fetchWidgetsForDashboard(
  consoleName: string, dashboardWidgets: Widget[], consoleWidgets: WidgetMap, dispatch: AppDispatch
) {
  if (isEmpty(dashboardWidgets) || isEmpty(consoleName)) {
    // TODO: throw
    return;
  }

  const widgetsFetchList = getWidgetTreeAsList(dashboardWidgets, consoleWidgets);

  for (const widget of widgetsFetchList) {
    // TODO: dispatch a loading widget
    const renderWidget = await apis.getWidget(consoleName, widget);
    dispatch(updateHydratedWidget(renderWidget));
  }
}

function getWidgetTreeAsList(widgets: Widget[], consoleWidgets: WidgetMap): Widget[] {
  const widgetList = [];
  for (const widget of widgets) {
    widgetList.push(...getWidgetAndChildren(widget, consoleWidgets));
  }

  return widgetList;
}

function getWidgetAndChildren(widget: Widget, consoleWidgets: WidgetMap): Widget[] {
  const widgetList = [widget];
  const { childrenIds } = widget;
  if (childrenIds && !isEmpty(childrenIds)) {
    // TODO: throw if a child DNE
    // TODO: cycle detection
    for (const childId of childrenIds) {
      const child = consoleWidgets[childId];
      widgetList.push(...getWidgetAndChildren(child, consoleWidgets));
    }
  }
  return widgetList;
}

function usePreviousValue(value: any) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

async function renderWidgetAndChildren(
  widget: Widget,
  hydratedWidgets: WidgetMap,
  dependencies: FlatMap
): Promise<JSX.Element> {
  const { childrenIds } = widget;
  if (!childrenIds || isEmpty(childrenIds)) {
    return await renderWidget(widget, [], dependencies);
  }

  // TODO: Throw if missing
  // TODO: cycle detection
  const children = childrenIds.map((childId: string) => hydratedWidgets[childId]);
  const renderedChildren: (Widget & { renderedElement: JSX.Element })[] = [];
  for (const child of children) {
    renderedChildren.push({
      ...widget,
      renderedElement: await renderWidgetAndChildren(child, hydratedWidgets, dependencies)
    });
  }

  return await renderWidget(widget, renderedChildren, dependencies);
}

async function renderWidget(
  widget: Widget,
  children: (Widget & { renderedElement: JSX.Element })[],
  dependencies: FlatMap
): Promise<JSX.Element> {
  // if (!isEmpty(widget.childrenIds)) {
  // const imported = await import('@tinystacks/ops-core-widgets');
  // const imported = await import(dependencies[widget.type]);

  // @ts-ignore
  // return imported[widget.type].fromJson(widget).render(children);
  // }

  /*
  let plugin;
  if (widget.type.toLowerCase().startsWith('aws') || widget.type === 'JsonTree') {
    // @ts-ignore 
    plugin = await import('@tinystacks/ops-aws-core-widgets'); // eslint-disable-line import/no-unresolved
  } else {
    // @ts-ignore
    plugin = await import('@tinystacks/ops-core-widgets'); // eslint-disable-line import/no-unresolved
  }
  */
  const moduleName = dependencies[widget.type];
  const moduleNamespace = camelCase(moduleName);
  const plugin = (plugins as any)[moduleNamespace] as any;
  return <WrappedWidget
    key={widget.id}
    // @ts-ignore
    hydratedWidget={plugin[widget.type].fromJson(widget)}
    widget={widget}
    childrenWidgets={children}
  />;
}



export default Dashboard;