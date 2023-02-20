import { useRouter } from 'next/router'
import { Console } from 'ops-frontend/components/console';
import {
  selectConsoleName, selectPage, selectPageIdFromRoute,
  selectPageWidgets, updatePageWidget
} from 'ops-frontend/store/consoleSlice';
import { useAppSelector } from 'ops-frontend/store/hooks';
import isEmpty from 'lodash.isempty';
import { WidgetParser as Widget } from '@tinystacks/ops-core';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef } from 'react';
import { useAppDispatch } from 'ops-frontend/store/hooks';
import { AppDispatch } from 'ops-frontend/store/store';
import ErrorWidget from 'ops-frontend/widgets/errorWidget';
import apis from 'ops-frontend/utils/apis';
import { Box, Flex, Heading } from '@chakra-ui/react';
import { FullpageLayout } from 'ops-frontend/components/fullpage-layout';
// import { Widget as WidgetType } from '@tinystacks/ops-model';
// import { WidgetParser } from '@tinystacks/ops-core';

// A page consists of
// 1. A page-level header with the page title and actions
// 2. A rendered-out list of widgets
function Page() {
  const { t } = useTranslation();
  const router = useRouter();
  const { page: pid } = router.query;
  const pageRoute = pidToPageRoute(pid);

  const consoleName = useAppSelector(selectConsoleName);
  const pageId = useAppSelector(selectPageIdFromRoute(pageRoute));
  const page = useAppSelector(selectPage(pageId));
  const dispatch = useAppDispatch();
  const pageWidgets = useAppSelector(selectPageWidgets(pageId));
  const previousPageWidgets = usePreviousValue(pageWidgets);

  useEffect(() => {
    if ((!previousPageWidgets || isEmpty(Object.keys(previousPageWidgets))) 
    && pageWidgets && !isEmpty(Object.keys(pageWidgets))) {
      void fetchWidgetData(consoleName, pageWidgets, dispatch);
    }
  });

  function renderPage() {
    if (!page) {
      return <FullpageLayout>{t('common.notFound')}</FullpageLayout>;
    }

    return (
      <>{renderPageWidgets()}</>
    );
  }

  function renderPageWidgets() {
    let widgetsRender = <></>;
    if (!isEmpty(pageWidgets)) {
      widgetsRender = pageWidgets.map((w: Widget) => {
        return (
          <Box data-testid='widget' key={w.id}>
            <Flex className='widgetHeader'>
              <Heading as='h4' size='md'>{w.id}</Heading>
            </Flex>
            <Flex className='widgetBody'>
              {w.render()}
              {/* {w.render()} */}
            </Flex>
          </Box>
        );
      });
    }
    return <div>{widgetsRender}</div>;
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

export async function fetchWidgetData(consoleName: string, pageWidgets: Widget[], dispatch: AppDispatch) {
  if (!isEmpty(pageWidgets) && !isEmpty(consoleName)) {
    // We want this to be synchronous so that we're not overwriting state inconsistently
    // Later, we can batch requests + writes to state for better performance
    for (let widget of pageWidgets) {
      const { id = '', displayName, providerId } = widget;
      const fetchedWidget = await apis.getWidget(consoleName, id)
      .catch(e => e);

      let renderWidget: Widget;
      // Widget type check
      if (fetchedWidget.type && fetchedWidget.id && fetchedWidget.displayName) {
        renderWidget = fetchedWidget;
      } else {
        renderWidget = ErrorWidget.fromJson({ id, displayName, type: 'ErrorWidget', providerId });
      }

      dispatch(updatePageWidget(renderWidget));
    }
  }
}

function usePreviousValue(value: any) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

export default Page;