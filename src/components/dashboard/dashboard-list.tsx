import { selectDashboards, updateConsole } from 'ops-frontend/store/consoleSlice';
import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from 'ops-frontend/store/hooks';
import apis from 'ops-frontend/utils/apis';
import { Heading, Wrap } from '@chakra-ui/react';
import { HeaderLayout } from 'ops-frontend/components/layout/header-layout';
import isEmpty from 'lodash.isempty';
import { FullpageLayout } from 'ops-frontend/components/layout/fullpage-layout';
import { useTranslation } from 'react-i18next';
import { DashboardCard } from 'ops-frontend/components/dashboard/dashboard-card';

export function DashboardList () {
  const { t: cm } = useTranslation('common');
  const dashboards = useAppSelector(selectDashboards);
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
    if (isEmpty(dashboards)) {
      void fetchData();
    }
  });

  function renderHeader() {
    return (
      <>
        <Heading>{cm('dashboard')}s</Heading>
        {/* TODO: ACTIONS */}
        {/* <button> */}
        {/* {common('settings')} */}
        {/* </button> */}
      </>
    );
  }

  const cards = Object.values(dashboards).map(dashboard => (
    <Wrap key={dashboard.id}>
      <DashboardCard dashboard={dashboard} />
    </Wrap>
  ));



  return (
    <>
      <HeaderLayout>
        {renderHeader()}
      </HeaderLayout>
      <FullpageLayout>
        <Wrap data-testid='console-page-contents' spacing="6" pt="6" maxWidth="7xl">
          {cards}
        </Wrap>
      </FullpageLayout>
    </>
  );
}
