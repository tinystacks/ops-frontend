import { selectPages, updateConsole } from 'ops-frontend/store/consoleSlice';
import React, { ReactNode, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from 'ops-frontend/store/hooks';
import apis from 'ops-frontend/utils/apis';
import { Heading, Stack } from '@chakra-ui/react';
import { HeaderLayout } from 'ops-frontend/components/header-layout';
import isEmpty from 'lodash.isempty';
import { FullpageLayout } from 'ops-frontend/components/fullpage-layout';
import { useTranslation } from 'react-i18next';

// The Console component is a wrapper around a Page
// It currently includes the console-level header and left-nav 

export function Console(props: { pageContents: ReactNode }) {
  const { pageContents } = props;
  const { t: common } = useTranslation('common');
  const pages = useAppSelector(selectPages);

  // TODO: Change this from a component to a page, make it part of our route
  // const consoleName = useAppSelector(selectConsoleName);
  const dispatch = useAppDispatch();
  
  async function fetchData() {
    try {
      const consoles = await apis.getConsoles();
      if (Array.isArray(consoles)) {
        // FIXME: when we change this to a page.
        // @ts-ignore
        dispatch(updateConsole(consoles.find(c => c.name === 'console')));
      }
    } catch (e) {

    }
  }

  useEffect(function () {
    if (isEmpty(pages)) {
      void fetchData();
    }
  });

  function renderHeader() {
    return (
      <>
        {renderBreadcrumbs()}
        {/* TODO: use dashboard name */}
        <Heading>{common('dashboard')}</Heading>
        {/* TODO: ACTIONS */}
        {/* <button> */}
          {/* {common('settings')} */}
        {/* </button> */}
      </>
    );
  }

  function renderBreadcrumbs() {
    // TODO: breadcrumbs from path
    return (
      <div>
        console &gt; main-page
      </div>
    );
  }

  // function renderLeftNav() {
  //   return (
  //     <div data-testid='console-left-nav'>
  //       {Object.keys(pages).map((page: string) => (
  //         <div key={page} data-testid='console-left-nav-item'>
  //           {page}
  //         </div>
  //       ))}
  //     </div>
  //   );
  // }

  return (
    <>
      <HeaderLayout>
        {renderHeader()}
      </HeaderLayout>
      <FullpageLayout>
        {/* {renderLeftNav()} */}
        <Stack data-testid='console-page-contents'>
          {pageContents}
        </Stack>
      </FullpageLayout>
    </>
  );
}