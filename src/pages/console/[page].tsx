import React, { useState } from 'react';
import isEmpty from 'lodash.isempty';
import isEqual from 'lodash.isequal';
import apis from 'ops-frontend/utils/apis';
import { useRouter } from 'next/router'
import { Console } from 'ops-frontend/components/Dashboard';
import {
  selectConsoleName, selectConsoleWidgets, selectDependencies, selectHydratedWidgets, selectPage, selectPageIdFromRoute,
  selectPageWidgets, updateHydratedWidget
} from 'ops-frontend/store/consoleSlice';
import { useAppSelector } from 'ops-frontend/store/hooks';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef } from 'react';
import { useAppDispatch } from 'ops-frontend/store/hooks';
import { AppDispatch } from 'ops-frontend/store/store';
import { FullpageLayout } from 'ops-frontend/components/fullpage-layout';
import { Widget } from '@tinystacks/ops-model';
import { WidgetMap } from 'ops-frontend/types';
import WrappedWidget from 'ops-frontend/components/widget/wrapped-widget';

// A page consists of
// 1. A page-level header with the page title and actions
// 2. A rendered-out list of widgets
function Page() {
  const { t: common } = useTranslation('common');
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { page: pid } = router.query;
  const pageRoute = pidToPageRoute(pid);

  const consoleName = useAppSelector(selectConsoleName);
  const pageId = useAppSelector(selectPageIdFromRoute(pageRoute));
  const page = useAppSelector(selectPage(pageId));
  const pageWidgets = useAppSelector(selectPageWidgets(pageId));
  const previousPageWidgets = usePreviousValue(pageWidgets);
  const dependencies = useAppSelector(selectDependencies);
  const consoleWidgets = useAppSelector(selectConsoleWidgets);
  const previousConsoleWidgets = usePreviousValue(consoleWidgets);
  const hydratedWidgets = useAppSelector(selectHydratedWidgets);
  const previousHydratedWidgets = usePreviousValue(hydratedWidgets);

  const [renderedWidgets, setRenderedWidgets] = useState<{ [widgetId: string]: JSX.Element }>({});

  useEffect(() => {
    if ((!previousPageWidgets || isEmpty(Object.keys(previousPageWidgets)))
      && pageWidgets && !isEmpty(Object.keys(pageWidgets))) {
      void fetchWidgetsForPage(consoleName, pageWidgets, consoleWidgets, dispatch);
    }
  });

  useEffect(() => {
    async function importAndRenderWidgets() {
      const deepRenderedWidgets = { ...renderedWidgets };
      for (let widget of pageWidgets) {
        deepRenderedWidgets[widget.id || ''] = await renderWidgetAndChildren(widget, hydratedWidgets);
      }

      setRenderedWidgets(deepRenderedWidgets);
    }

    // TODO: deep compare widget trees that are rendered on this page instead
    if ((
        !isEqual(previousPageWidgets, pageWidgets) ||
        !isEqual(previousConsoleWidgets, consoleWidgets) ||
        !isEqual(previousHydratedWidgets, hydratedWidgets)
      ) && !isEmpty(dependencies)
    ) {
      void importAndRenderWidgets();
    }
  }, [
    previousPageWidgets, pageWidgets, dependencies, renderedWidgets, previousConsoleWidgets, consoleWidgets,
    hydratedWidgets, previousHydratedWidgets
  ]);

  function renderPage() {
    if (!page) {
      return <FullpageLayout>{common('notFound')}</FullpageLayout>;
    }

    return (
      <>{renderPageWidgets()}</>
    );
  }

  function renderPageWidgets() {
    // let widgetsRender = <></>;
    // if (!isEmpty(pageWidgets)) {
    // widgetsRender = pageWidgets.map((w: Widget) => {
    //   return (
    //     <Box data-testid='widget' key={w.id}>
    //       <Flex className='widgetHeader'>
    //         <Heading as='h4' size='md'>{w.id}</Heading>
    //       </Flex>
    //       <Flex className='widgetBody'>
    //         {w.render()}
    //         {/* {w.render()} */}
    //       </Flex>
    //     </Box>
    //   );
    // });
    // return <div>{widgetsRender}</div>;

    return (
      <div>
        {Object.values(renderedWidgets)}
      </div>
    );
  }

  return (
    <Console pageContents={(
      <>{renderPage()}</>
    )} />
  )
}

export function pidToPageRoute(pid: string | string[] | undefined): string {
  if (!pid) {
    return '/';
  }

  if (typeof pid === 'string') {
    return pid;
  }

  // case list
  if (isEmpty(pid)) {
    return '/';
  }

  return pid[0];
}


// pageWidgets only gives us the top-level widgets on the page. Those widgets may have children
// because of that, we need console widgets to find and call getWidget on all of those widgets as well
// we don't have to worry about these widgets polluting pageWidgets because that's all selected out
export async function fetchWidgetsForPage(
  consoleName: string, pageWidgets: Widget[], consoleWidgets: WidgetMap, dispatch: AppDispatch
) {
  if (isEmpty(pageWidgets) || isEmpty(consoleName)) {
    // TODO: throw
    return;
  }

  const widgetsFetchList = getWidgetTreeAsList(pageWidgets, consoleWidgets);

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
  widget: Widget, hydratedWidgets: WidgetMap
): Promise<JSX.Element> {
  const { childrenIds } = widget;
  if (!childrenIds || isEmpty(childrenIds)) {
    return await renderWidget(widget, []);
  }

  // TODO: Throw if missing
  // TODO: cycle detection
  const children = childrenIds.map(childId => hydratedWidgets[childId]);
  const renderedChildren: (Widget & { renderedElement: JSX.Element })[] = [];
  for (const child of children) {
    renderedChildren.push({
      ...widget,
      renderedElement: await renderWidgetAndChildren(child, hydratedWidgets)
    });
  }

  return await renderWidget(widget, renderedChildren);
}

async function renderWidget(
  widget: Widget, children: (Widget & { renderedElement: JSX.Element })[]
): Promise<JSX.Element> {
  // if (!isEmpty(widget.childrenIds)) {
  // const imported = await import('@tinystacks/ops-core-widgets');
  // const imported = await import(dependencies[widget.type]);

  // @ts-ignore
  // return imported[widget.type].fromJson(widget).render(children);
  // }

  let imported;
  if (widget.type.toLowerCase().startsWith('aws') || widget.type === 'JsonTree') {
    imported = await import('@tinystacks/ops-aws-core-plugins');
  } else {
    imported = await import('@tinystacks/ops-core-widgets');
  }
    return <WrappedWidget
    // @ts-ignore
    hydratedWidget={imported[widget.type].fromJson(widget)}
    widget={widget}
    childrenWidgets={children}
  />;
}



export default Page;