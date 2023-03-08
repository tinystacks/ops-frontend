import { selectDashboards, updateConsole } from 'ops-frontend/store/consoleSlice';
import React, { ReactNode, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from 'ops-frontend/store/hooks';
import apis from 'ops-frontend/utils/apis';
import { Heading, Stack } from '@chakra-ui/react';
import { HeaderLayout } from 'ops-frontend/components/layout/header-layout';
import isEmpty from 'lodash.isempty';
import { FullpageLayout } from 'ops-frontend/components/layout/fullpage-layout';
import { useTranslation } from 'react-i18next';

// The Console component is a wrapper around a Page
// It currently includes the console-level header and left-nav 

export function DashboardWrapper(props: { dashboardContents: ReactNode, dashboardId: string }) {
  const { dashboardContents } = props;
  const { t: common } = useTranslation('common');
  const pages = useAppSelector(selectDashboards);

  // TODO: Change this from a component to a page, make it part of our route
  // const consoleName = useAppSelector(selectConsoleName);
  const dispatch = useAppDispatch();
  
  async function fetchData() {
    try {
      const consoles = await apis.getConsoles();
      if (Array.isArray(consoles)) {
        // FIXME: we need to eventually only deal with a single console
        dispatch(updateConsole(consoles[0]));
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
        {/* TODO: use dashboard name */}
        <Heading>{common('dashboard')}</Heading>
        {}
        {/* TODO: ACTIONS */}
        {/* <button> */}
          {/* {common('settings')} */}
        {/* </button> */}
      </>
    );
  }

  return (
    <>
      <HeaderLayout>
        {renderHeader()}
      </HeaderLayout>
      <FullpageLayout>
        {/* {renderLeftNav()} */}
        <Stack data-testid='console-page-contents'>
          {dashboardContents}
        </Stack>
      </FullpageLayout>
    </>
  );
}