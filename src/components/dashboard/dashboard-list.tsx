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
import apis from '../../utils/apis.js';
import {
  createNewDashboard,
  dismissError,
  selectConsoleName,
  selectDashboards,
  selectError,
  updateConsole
} from '../../store/consoleSlice.js';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import { HeaderLayout } from '../../components/layout/header-layout.js';
import { FullpageLayout } from '../../components/layout/fullpage-layout.js';
import { DashboardCard } from '../../components/dashboard/dashboard-card.js';
import CreateDashboardModal from '../../components/dashboard/create-dashboard-modal.js';
import DismissableErrorBanner from '../../components/common/dismissable-error-banner.js';
import { ShowableError } from '../../types.js';

export function DashboardList () {
  const { t: hm } = useTranslation('home');
  const { t: d } = useTranslation('dashboard');
  const dashboards = useAppSelector(selectDashboards);
  const consoleName = useAppSelector(selectConsoleName);
  const error = useAppSelector(selectError);
  const dispatch = useAppDispatch();
  const [consolesError, setConsolesError] = useState<ShowableError | undefined>(undefined);
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
      const {
        message,
        cause,
        context
      } = e?.body?.body || {};
      setConsolesError({
        title: hm('consolesError'),
        message,
        cause,
        context
      });
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
        <Heading>{hm('dashboards')}</Heading>
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
        error={consolesError}
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
