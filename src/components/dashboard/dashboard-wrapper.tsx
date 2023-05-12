import { selectDashboards, updateConsole } from 'ops-frontend/store/consoleSlice';
import React, { ReactNode, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from 'ops-frontend/store/hooks';
import apis from 'ops-frontend/utils/apis';
import { Heading, Stack } from '@chakra-ui/react';
import { HeaderLayout } from 'ops-frontend/components/layout/header-layout';
import isEmpty from 'lodash.isempty';
import { FullpageLayout } from 'ops-frontend/components/layout/fullpage-layout';

export function DashboardWrapper(props: { dashboardContents: ReactNode, dashboardId: string }) {
  const { dashboardContents, dashboardId } = props;
  const pages = useAppSelector(selectDashboards);
  const [retryCount, setRetryCount] = useState<number>(0);

  const dispatch = useAppDispatch();
  
  async function fetchData() {
    try {
      const consoles = await apis.getConsoles();
      if (Array.isArray(consoles)) {
        // FIXME: we need to eventually only deal with a single console
        dispatch(updateConsole(consoles[0]));
        setRetryCount(0);
      }
    } catch (e) {
      setRetryCount(retryCount + 1);
    }
  }

  useEffect(function () {
    if (isEmpty(pages) && retryCount < 3) {
      void fetchData();
    }
  });

  function renderHeader() {
    return (
      <>
        <Heading>{dashboardId}</Heading>
      </>
    );
  }

  return (
    <>
      <HeaderLayout>
        {renderHeader()}
      </HeaderLayout>
      <FullpageLayout>
        <Stack data-testid='console-page-contents'>
          {dashboardContents}
        </Stack>
      </FullpageLayout>
    </>
  );
}