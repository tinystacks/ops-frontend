import { useRouter } from 'next/router'
import { Console } from 'ops-frontend/components/console';
import { selectPage, selectPageIdFromRoute, selectPageWidgets } from 'ops-frontend/store/consoleSlice';
import { useAppSelector } from 'ops-frontend/store/hooks';
import isEmpty from 'lodash.isempty';
import Widget from 'ops-frontend/widgets/widget';
import { useTranslation } from 'react-i18next';

// A page consists of 3 things
// 1. A page-level header with the page title and actions
// 2. A rendered-out list of widgets
// 3. ???

const Page = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { page: pid } = router.query;
  const pageRoute = pidToPageRoute(pid);

  const pageId = useAppSelector(selectPageIdFromRoute(pageRoute));
  const page = useAppSelector(selectPage(pageId));
  const widgets = useAppSelector(selectPageWidgets(pageId));

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
    // Fetch data for each widget. Set widget data on each widget

    // Render widgets using the widgetId as the react key so that when the page re-renders due to promise resolution,
    //  widgets can re-render in-place
  }
  
  function renderPageHeader() {
    if (!page || !page.id) {
      return <div data-testid='page-header-page-id-undefined'></div>;
    }

    return <div data-testid='page-header-page-id'>{page.id}</div>;
  }

  function renderPageWidgets() {
    if (isEmpty(widgets)) {
      return <></>;
    }

    return widgets.map((w: Widget) => <div data-testid='widget' key={w.id}>{w.render()}</div>)
  }


  return (
    <Console pageContents={(
      <div>
        <div>{renderPage()}</div>
      </div>
    )}/>
  )
}

export function pidToPageRoute(pid: string | string[] | undefined): string {
  if (!pid) {
    return "/";
  }

  if (typeof pid === 'string') {
    return pid;
  }

  // case list
  if (isEmpty(pid)) {
    return "/";
  }

  return pid[0];
}

export default Page;