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
  selectDashboardIdFromRoute, selectDashboardWidgets, updateHydratedWidget, handleError
} from 'ops-frontend/store/consoleSlice';
import { useAppSelector } from 'ops-frontend/store/hooks';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef } from 'react';
import { useAppDispatch } from 'ops-frontend/store/hooks';
import { AppDispatch } from 'ops-frontend/store/store';
import { FullpageLayout } from 'ops-frontend/components/layout/fullpage-layout';
import { Parameter, Widget, TinyStacksError as TinyStacksErrorType } from '@tinystacks/ops-model';
import { TinyStacksError } from '@tinystacks/ops-core';
import { FlatMap, FlatSchema, Json, WidgetMap } from 'ops-frontend/types';
import ErrorWidget from 'ops-frontend/widgets/error-widget';
import LoadingWidget from 'ops-frontend/widgets/loading-widget';
// eslint-disable-next-line import/no-unresolved
import { useParams } from 'react-router-dom';
import { JSONSchema7, JSONSchema7Definition } from 'json-schema';
import { md5 } from 'ops-frontend/utils/md5';

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
  const previousDashboardWidgets = usePreviousValue<Widget[]>(dashboardWidgets);
  const dependencies = useAppSelector(selectDependencies);
  const consoleWidgets = useAppSelector(selectConsoleWidgets);
  const previousConsoleWidgets = usePreviousValue<WidgetMap>(consoleWidgets);
  const hydratedWidgets = useAppSelector(selectHydratedWidgets);
  const previousHydratedWidgets = usePreviousValue<WidgetMap>(hydratedWidgets);

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

  const previousWidgetsWereEmpty = !previousDashboardWidgets || isEmpty(Object.keys(previousDashboardWidgets));
  const currentWidgetsAreNotEmpty = dashboardWidgets && !isEmpty(Object.keys(dashboardWidgets));
  const initialLoad = previousWidgetsWereEmpty && currentWidgetsAreNotEmpty;

  const widgetDefinitions = Object.values(consoleWidgets).filter(w => dashboard?.widgetIds?.includes(w.id));
  const widgetsHash = md5(JSON.stringify(widgetDefinitions || []));
  const previousWidgetHash: string | undefined = usePreviousValue<string>(widgetsHash);
  const widgetsHaveChanged = widgetsHash?.toString() !== previousWidgetHash?.toString();
  
  const parametersHash = md5(JSON.stringify(parameters || []));
  const previousParameterHash: string | undefined = usePreviousValue<string>(parametersHash);
  const parametersHaveChanged = parametersHash?.toString() !== previousParameterHash?.toString();
  
  const shouldCallFetch = (initialLoad || widgetsHaveChanged || parametersHaveChanged);
  useEffect(() => {
    if (shouldCallFetch) {
      void fetchWidgetsForDashboard({
        consoleName,
        dashboardWidgets,
        consoleWidgets,
        dispatch,
        dashboardId,
        parameters
      });
    }
  }, [
    shouldCallFetch,
    consoleName,
    dashboardWidgets,
    consoleWidgets,
    dispatch,
    dashboardId,
    parameters
  ]
);

  useEffect(() => {
    async function importAndRenderWidgets() {
      try {
        const deepRenderedWidgets = {
          ...Object.fromEntries(
            Object.entries(renderedWidgets)
              .filter(([key]) => dashboard?.widgetIds?.includes(key))
          )
        };
        for (let widget of dashboardWidgets) {
          deepRenderedWidgets[widget.id || ''] = await renderWidgetAndChildren(
            widget,
            hydratedWidgets,
            dependencies,
            consoleName, 
            dispatch,
            dashboardId,
            parameters
          );
        }
  
        setRenderedWidgets(deepRenderedWidgets);
      } catch (error: any) {
        dispatch(handleError({
          title: 'Could not render widgets!',
          error: error?.body || error
        }));
      }
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
    router.isReady,
    dispatch,
    dashboard?.widgetIds,
    consoleName
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
        {dashboard?.widgetIds?.map(id => renderedWidgets[id])}
      </div>
    );
  }

  return (
    <DashboardWrapper
      dashboardContents={renderDashboard()}
      dashboardId={dashboardId}
      description={dashboard?.description}
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
    await apis.getWidget({
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

function usePreviousValue<T>(value: any): T | undefined {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

async function renderWidgetAndChildren(
  widget: Widget,
  hydratedWidgets: WidgetMap,
  dependencies: FlatMap,
  dashboardId: string,
  consoleName: string, 
  dispatch: AppDispatch,
  parameters?: Json
): Promise<JSX.Element> {
  const { childrenIds } = widget;
  if (!childrenIds || isEmpty(childrenIds)) {
    return await renderWidget(widget, [], dependencies, consoleName, dispatch, dashboardId, parameters);
  }

  // TODO: Throw if missing
  // TODO: cycle detection
  const children = childrenIds.map((childId: string) => hydratedWidgets[childId]);
  const renderedChildren: (Widget & { renderedElement: JSX.Element })[] = [];
  for (const child of children) {
    renderedChildren.push({
      ...widget,
      renderedElement: await renderWidgetAndChildren(child, hydratedWidgets, dependencies, 
        consoleName, dispatch, dashboardId, parameters)
    });
  }

  return await renderWidget(widget, renderedChildren, dependencies, consoleName, dispatch, dashboardId, parameters);
}

async function getWidgetOnRefresh(args: {
  consoleName: string;
  widget: Widget;
  dispatch: AppDispatch;
  dashboardId?: string;
  parameters?: Json
}) {
  const {
    consoleName,
    widget,
    dispatch,
    dashboardId,
    parameters
  } = args;
  
  dispatch(updateHydratedWidget(new LoadingWidget({ ...widget, originalType: widget.type }).toJson()));

  await apis.getWidget({
    consoleName,
    widget,
    dashboardId,
    parameters
  }).then(renderWidget => dispatch(updateHydratedWidget(renderWidget)))
    .catch((e: any) => dispatch(updateHydratedWidget(new ErrorWidget({
      ...widget,
      originalType: widget.type,
      error: e.message
    }).toJson())));

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

export async function loadWidgetProperties(widgetType: string, dependencies: FlatMap) { 
  let widgetProperties: FlatSchema[] | undefined;

  const plugins = await import('ops-frontend/plugins'); // eslint-disable-line import/no-unresolved
    const moduleName = dependencies[widgetType];
    const moduleNamespace = camelCase(moduleName);
    const plugin = (plugins as any)[moduleNamespace] as any;
    if (!plugin) {
      throw TinyStacksError.fromJson({
        message: 'Missing dependency!',
        status: 424,
        cause: `Cannot find module ${moduleName} for widget type ${widgetType}`
      }).toJson();
    }
    const schemaJson = (plugins as any)[`${moduleNamespace}Schema`];
    const widgetSchema = get(schemaJson, `definitions.${widgetType}`) as JSONSchema7;
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

    return widgetProperties;
}

async function renderWidget(
  widget: Widget,
  children: (Widget & { renderedElement: JSX.Element })[],
  dependencies: FlatMap,
  consoleName: string, 
  dispatch: AppDispatch,
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
        error: (widget as unknown as TinyStacksErrorType).message || ''
      }
    )
  } else if (widget.type === 'LoadingWidget') {
    hydratedWidget = LoadingWidget.fromJson({
      ...widget,
      // @ts-ignore
      originalType: widget.originalType
    });
  } else { 

    widgetProperties = await loadWidgetProperties(widget.type, dependencies);
    const plugins = await import('ops-frontend/plugins'); // eslint-disable-line import/no-unresolved
    const moduleName = dependencies[widget.type];
    const moduleNamespace = camelCase(moduleName);
    const plugin = (plugins as any)[moduleNamespace] as any;
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
    onRefresh={async () => 
      {
      await  getWidgetOnRefresh({
      consoleName, 
      dispatch,
      widget,
      dashboardId, 
      parameters
    })}}
  />;
}



export default Dashboard;