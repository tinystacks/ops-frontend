import { useRouter } from 'next/router'
import { Console } from 'ops-frontend/components/console';
import {
  selectConsoleName, selectPage, selectPageIdFromRoute,
  selectPageWidgets, updatePageWidget
} from 'ops-frontend/store/consoleSlice';
import { useAppSelector } from 'ops-frontend/store/hooks';
import isEmpty from 'lodash.isempty';
import Widget from 'ops-frontend/widgets/widget';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef } from 'react';
import { useAppDispatch } from 'ops-frontend/store/hooks';
import { AppDispatch } from 'ops-frontend/store/store';
import ErrorWidget from 'ops-frontend/widgets/errorWidget';
import apis from 'ops-frontend/utils/apis';

// A page consists of
// 1. A page-level header with the page title and actions
// 2. A rendered-out list of widgets
const Page = () => {
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
    if (!previousPageWidgets && pageWidgets) {
      void fetchWidgetData(consoleName, pageWidgets, dispatch);
    }
  });

  function renderPage() {
    if (!page) {
      return <>{t('common.notFound')}</>;
    }

    return (
      <div>
        {renderPageHeader()}
        {renderPageWidgets()}
      </div>
    );
  }

  function renderPageHeader() {
    return <div data-testid='page-header-page-id'>{page.id}</div>;
  }

  function renderPageWidgets() {
    let widgetsRender = [<></>];
    if (!isEmpty(pageWidgets)) {
      widgetsRender = pageWidgets.map((w: Widget) => {
        return (
          <div data-testid='widget' key={w.id}>{w.render()}</div>
        );
      });
    }

    return <div data-testid='rendered-widgets'>{widgetsRender}</div>;
  }

  return (
    <Console pageContents={(
      <div>
        <div>{renderPage()}</div>
      </div>
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
      const fetchedWidget = await apis.getWidget(consoleName, widget.id)
      .catch(e => e);

      let renderWidget: Widget;
      if (fetchedWidget instanceof Widget) {
        renderWidget = fetchedWidget;
      } else {
        renderWidget = new ErrorWidget(widget.id, fetchedWidget.toString() || '', widget.type, '');        
      }

      dispatch(updatePageWidget(renderWidget.toJson()));
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