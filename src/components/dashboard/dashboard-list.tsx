import React, { useEffect, useState } from 'react';
import isEmpty from 'lodash.isempty';
import { Dashboard } from '@tinystacks/ops-model';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Flex,
  Heading,
  Spacer,
  useDisclosure,
  Wrap
} from '@chakra-ui/react';
import apis from 'ops-frontend/utils/apis';
import {
  createNewDashboard,
  dismissError,
  selectConsoleName,
  selectDashboards,
  selectErropr,
  updateConsole
} from 'ops-frontend/store/consoleSlice';
import { useAppDispatch, useAppSelector } from 'ops-frontend/store/hooks';
import { HeaderLayout } from 'ops-frontend/components/layout/header-layout';
import { FullpageLayout } from 'ops-frontend/components/layout/fullpage-layout';
import { DashboardCard } from 'ops-frontend/components/dashboard/dashboard-card';
import CreateDashboardModal from 'ops-frontend/components/dashboard/create-dashboard-modal';
import DismissableErrorBanner from 'ops-frontend/components/common/dismissable-error-banner';

export function DashboardList () {
  const { t: hm } = useTranslation('home');
  const { t: d } = useTranslation('dashboard');
  const dashboards = useAppSelector(selectDashboards);
  const consoleName = useAppSelector(selectConsoleName);
  const error = useAppSelector(selectErropr);
  const dispatch = useAppDispatch();
  const [consolesError, setConsolesError] = useState<string | undefined>(undefined);
  const [retryCount, setRetryCount] = useState<number>(0);
  async function fetchData() {
    try {
      setConsolesError(undefined);
      const consoles = await apis.getConsoles();
      if (Array.isArray(consoles)) {
        // FIXME: we need to eventually only deal with a single console
        dispatch(updateConsole(consoles[0]));
        setRetryCount(0);
      }
    } catch (e: any) {
      setConsolesError(e.message);
      setRetryCount(retryCount + 1);
    }
  }

  useEffect(() => {
    if (isEmpty(dashboards) && retryCount < 3) {
      void fetchData();
    }
  }, [retryCount, dashboards]);

  const {
    isOpen: createIsOpen,
    onOpen: createOnOpen,
    onClose: createOnClose
  } = useDisclosure();

  function renderHeader() {
    return (
      <Flex>
        <Heading>{d('dashboards')}</Heading>
        <Spacer />
        <Button colorScheme='blue' onClick={createOnOpen}>{d('addDashboard')}</Button>
      </Flex>
    );
  }

  async function createDashboard (dashboard: Dashboard) {
    createOnClose();
    dispatch(createNewDashboard(consoleName, dashboard));
  }

  const createModal = createIsOpen ? (
    <CreateDashboardModal
      isOpen={createIsOpen}
      createDashboard={createDashboard}
      onClose={createOnClose}
      dashboards={dashboards}
    />
  ) : (<></>);

  const cards = Object.values(dashboards).map(dashboard => (
    <Wrap key={dashboard.id}>
      <DashboardCard dashboard={dashboard} />
    </Wrap>
  ));

  let errorBanner = (<></>);
  if (consolesError) {
    errorBanner = (
      <DismissableErrorBanner
        key='consoles-error'
        error={{ title: hm('consolesError'), message: consolesError }}
        dismissError={() => setConsolesError(undefined)}
      />
    );
  } else if (error) {
    errorBanner = (
      <DismissableErrorBanner
        key='consoles-error'
        error={error}
        dismissError={() => dispatch(dismissError())}
      />
    );
  }


  return (
    <>
      {createModal}
      <HeaderLayout>
        {renderHeader()}
      </HeaderLayout>
      {errorBanner}
      <FullpageLayout>
        <Wrap data-testid='console-page-contents' spacing="6" maxWidth="7xl">
          {cards}
        </Wrap>
      </FullpageLayout>
    </>
  );
}
