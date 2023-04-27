import { selectDashboards, updateConsole } from 'ops-frontend/store/consoleSlice';
import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from 'ops-frontend/store/hooks';
import apis from 'ops-frontend/utils/apis';
import { Alert, AlertDescription, AlertIcon, AlertTitle, Flex, Heading, Spacer, Wrap } from '@chakra-ui/react';
import { HeaderLayout } from 'ops-frontend/components/layout/header-layout';
import isEmpty from 'lodash.isempty';
import { FullpageLayout } from 'ops-frontend/components/layout/fullpage-layout';
import { useTranslation } from 'react-i18next';
import { DashboardCard } from 'ops-frontend/components/dashboard/dashboard-card';

export function DashboardList () {
  const { t: hm } = useTranslation('home');
  const dashboards = useAppSelector(selectDashboards);
  const dispatch = useAppDispatch();
  const [consolesError, setConsolesError] = useState<string | undefined>(undefined);
  async function fetchData() {
    try {
      setConsolesError(undefined);
      const consoles = await apis.getConsoles();
      if (Array.isArray(consoles)) {
        // FIXME: we need to eventually only deal with a single console
        dispatch(updateConsole(consoles[0]));
      }
    } catch (e: any) {
      setConsolesError(e.message);
    }
  }

  useEffect(function () {
    if (isEmpty(dashboards)) {
      void fetchData();
    }
  });

  function renderHeader() {
    return (
      <Flex>
        <Heading>{hm('dashboards')}</Heading>
        <Spacer />
        {/* <Button colorScheme='blue'>{hm('addDashboard')}</Button> */}
        {/* TODO: ACTIONS */}
        {/* <button> */}
        {/* {common('settings')} */}
        {/* </button> */}
      </Flex>
    );
  }

  const cards = Object.values(dashboards).map(dashboard => (
    <Wrap key={dashboard.id}>
      <DashboardCard dashboard={dashboard} />
    </Wrap>
  ));

  if (consolesError) {
    return (
      <>
        <HeaderLayout>
          {renderHeader()}
        </HeaderLayout>
        <FullpageLayout>
          <Alert status='error'>
            <AlertIcon />
            <AlertTitle>{hm('consoleError')}</AlertTitle>
            <AlertDescription>{consolesError}</AlertDescription>
          </Alert>
        </FullpageLayout>
      </>
    );
  }


  return (
    <>
      <HeaderLayout>
        {renderHeader()}
      </HeaderLayout>
      <FullpageLayout>
        <Wrap data-testid='console-page-contents' spacing="6" maxWidth="7xl">
          {cards}
        </Wrap>
      </FullpageLayout>
    </>
  );
}
