import React, { useState } from 'react';
import isEmpty from 'lodash.isempty';
import isEqual from 'lodash.isequal';
import camelCase from 'lodash.camelcase';
import get from 'lodash.get';
import sortBy from 'lodash.sortby';
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
import { Parameter, Widget, TinyStacksError } from '@tinystacks/ops-model';
import { FlatMap, FlatSchema, Json, WidgetMap } from 'ops-frontend/types';
import ErrorWidget from 'ops-frontend/widgets/error-widget';
import LoadingWidget from 'ops-frontend/widgets/loading-widget';
// eslint-disable-next-line import/no-unresolved
import { useParams } from 'react-router-dom';
import { JSONSchema7, JSONSchema7Definition } from 'json-schema';

// A dashboard consists of
// 1. A dashboard-level header with the dashboard title and actions
// 2. A rendered-out list of widgets
function Dashboard() {
  const { t: common } = useTranslation('common');
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { route = '' } = useParams();

  const consoleName = useAppSelector(selectConsoleName);
  const dashboardId = useAppSelector(selectDashboardIdFromRoute(route));
  const dashboard = useAppSelector(selectDashboard(dashboardId));
  const dashboardWidgets = useAppSelector(selectDashboardWidgets(dashboardId));
  const previousDashboardWidgets = usePreviousValue(dashboardWidgets);
  const dependencies = useAppSelector(selectDependencies);
  const consoleWidgets = useAppSelector(selectConsoleWidgets);
  const previousConsoleWidgets = usePreviousValue(consoleWidgets);
  const hydratedWidgets = useAppSelector(selectHydratedWidgets);
  const previousHydratedWidgets = usePreviousValue(hydratedWidgets);

  const [renderedWidgets, setRenderedWidgets] = useState<{ [widgetId: string]: JSX.Element }>({});

  const parameters = dashboard?.parameters?.reduce((acc: Json, param: Parameter) => {
    const {
      name,
      default: defaultValue
    } = param;
    const paramValue = router.query[name] || defaultValue;
    if (paramValue) {
      acc[name] = paramValue;
    }
    return acc;
  }, {});

  useEffect(() => {
    if ((!previousDashboardWidgets || isEmpty(Object.keys(previousDashboardWidgets)))
      && dashboardWidgets && !isEmpty(Object.keys(dashboardWidgets))) {
      void fetchWidgetsForDashboard({
        consoleName,
        dashboardWidgets,
        consoleWidgets,
        dispatch,
        dashboardId,
        parameters
      });
    }
  });

  useEffect(() => {
    async function importAndRenderWidgets() {
      const deepRenderedWidgets = { ...renderedWidgets };
      for (let widget of dashboardWidgets) {
        deepRenderedWidgets[widget.id || ''] = await renderWidgetAndChildren(
          widget,
          hydratedWidgets,
          dependencies,
          dashboardId,
          parameters
        );
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
    previousDashboardWidgets,
    dashboardWidgets,
    dependencies,
    renderedWidgets,
    previousConsoleWidgets,
    consoleWidgets,
    hydratedWidgets,
    previousHydratedWidgets,
    dashboardId,
    parameters,
    router.isReady
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
export async function fetchWidgetsForDashboard(args: {
    consoleName: string;
    dashboardWidgets: Widget[];
    consoleWidgets: WidgetMap;
    dispatch: AppDispatch;
    dashboardId?: string;
    parameters?: Json
}) {
  const {
    consoleName,
    dashboardWidgets,
    consoleWidgets,
    dispatch,
    dashboardId,
    parameters
  } = args;
  if (isEmpty(dashboardWidgets) || isEmpty(consoleName)) {
    // TODO: throw
    return;
  }

  const widgetsFetchList = getWidgetTreeAsList(dashboardWidgets, consoleWidgets);

  for (const widget of widgetsFetchList) {
    // TODO: dispatch a loading widget
    dispatch(updateHydratedWidget(new LoadingWidget({ ...widget, originalType: widget.type }).toJson()));
    void apis.getWidget({
      consoleName,
      widget,
      dashboardId,
      parameters
    }).then(renderWidget => dispatch(updateHydratedWidget(renderWidget)))
    .catch((e: any) => {
      dispatch(updateHydratedWidget(new ErrorWidget({
        ...widget,
        originalType: widget.type,
        error: e.message
      }).toJson()))
    }
    );
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
  dependencies: FlatMap,
  dashboardId?: string,
  parameters?: Json
): Promise<JSX.Element> {
  const { childrenIds } = widget;
  if (!childrenIds || isEmpty(childrenIds)) {
    return await renderWidget(widget, [], dependencies, dashboardId, parameters);
  }

  // TODO: Throw if missing
  // TODO: cycle detection
  const children = childrenIds.map((childId: string) => hydratedWidgets[childId]);
  const renderedChildren: (Widget & { renderedElement: JSX.Element })[] = [];
  for (const child of children) {
    renderedChildren.push({
      ...widget,
      renderedElement: await renderWidgetAndChildren(child, hydratedWidgets, dependencies, dashboardId, parameters)
    });
  }

  return await renderWidget(widget, renderedChildren, dependencies, dashboardId, parameters);
}

function getSchemaProperties (schema: JSONSchema7, requiredProperties: string[]): FlatSchema[] {
  return Object.entries(schema.properties || {}).map(
    ([propertyName, propertySchema]: [string, JSONSchema7Definition]) => {
      const propertyDef: JSONSchema7 = typeof propertySchema === 'boolean' ? {} : propertySchema;
      return {
        ...propertyDef,
        name: propertyName,
        isRequired: requiredProperties.includes(propertyName)
      }
    }
  );
}

async function renderWidget(
  widget: Widget,
  children: (Widget & { renderedElement: JSX.Element })[],
  dependencies: FlatMap,
  dashboardId?: string,
  parameters?: Json
): Promise<JSX.Element> {
  let hydratedWidget;
  let widgetProperties: FlatSchema[] | undefined;
  if (widget.type === 'ErrorWidget') {
    hydratedWidget = ErrorWidget.fromJson(
      {
        ...widget,
        originalType: widget.type,
        error: (widget as TinyStacksError).message || ''
      }
    )
  } else if (widget.type === 'LoadingWidget') {
    hydratedWidget = LoadingWidget.fromJson({
      ...widget,
      // @ts-ignore
      originalType: widget.originalType
    });
  } else { 
    const plugins = await import('ops-frontend/plugins'); // eslint-disable-line import/no-unresolved
    const moduleName = dependencies[widget.type];
    const moduleNamespace = camelCase(moduleName);
    const plugin = (plugins as any)[moduleNamespace] as any;
    const schemaJson = (plugins as any)[`${moduleNamespace}Schema`];
    const widgetSchema = get(schemaJson, `definitions.${widget.type}`) as JSONSchema7;
    if (widgetSchema) {
      const {
        allOf = [],
        anyOf = [],
        oneOf = [],
        required = []
      } = widgetSchema;
      const widgetSchemaProperties = getSchemaProperties(widgetSchema, required);
      // FIXME: This is wrong.  Instead of spreading oneOf,
      // we should present the subSchemas under it as variants that the user can choose from.
      // Consider this when implementing typed inputs in Phase 2 or 3
      const subSchemas = [...allOf, ...anyOf, ...oneOf];
      if (subSchemas.length > 0) {
        subSchemas.forEach((subSchema: JSONSchema7Definition) => {
          const jsonSchema: JSONSchema7 = typeof subSchema === 'boolean' ? {} : subSchema;
          const subSchemaProperties = getSchemaProperties(jsonSchema, jsonSchema.required || []);
          widgetSchemaProperties.push(...subSchemaProperties);
        });
      }
      const noEditProperties = ['id', 'type', 'additionalProperties'];
      const editableProperties = widgetSchemaProperties
        .filter(p => !noEditProperties.includes(p.name));
      const requiredProperties = editableProperties.filter(p => p.isRequired);
      const optionalProperties = editableProperties.filter(p => !p.isRequired);
      widgetProperties = [
        ...sortBy(requiredProperties, 'name'),
        ...sortBy(optionalProperties, 'name')
      ];
    }
    hydratedWidget = plugin[widget.type].fromJson(widget);
  }

  return <WrappedWidget
    key={widget.id}
    // @ts-ignore
    hydratedWidget={hydratedWidget}
    widget={widget}
    childrenWidgets={children}
    widgetProperties={widgetProperties}
    dashboardId={dashboardId}
    parameters={parameters}
  />;
}



export default Dashboard;