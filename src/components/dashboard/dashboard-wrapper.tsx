import { selectConsoleName, selectDashboards, updateConsole, updateDashboard } from 'ops-frontend/store/consoleSlice';
import React, { ReactNode, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from 'ops-frontend/store/hooks';
import apis from 'ops-frontend/utils/apis';
import { Button, Flex, Heading, Stack, useDisclosure } from '@chakra-ui/react';
import { HeaderLayout } from 'ops-frontend/components/layout/header-layout';
import isEmpty from 'lodash.isempty';
import { FullpageLayout } from 'ops-frontend/components/layout/fullpage-layout';
import { SettingsIcon } from '@chakra-ui/icons';
import { useTranslation } from 'react-i18next';
import DashboardSettings from 'ops-frontend/components/dashboard/dashboard-settings';
import { Dashboard } from '@tinystacks/ops-model';
import { useNavigate } from 'react-router-dom';
import CreateWidgetModal from 'ops-frontend/components/dashboard/create-widget-modal';

export function DashboardWrapper(props: { dashboardContents: ReactNode, dashboardId: string }) {
  const { dashboardContents, dashboardId } = props;
  const navigate = useNavigate();
  const dashboards = useAppSelector(selectDashboards);
  const consoleName = useAppSelector(selectConsoleName);
  const [retryCount, setRetryCount] = useState<number>(0);
  const { t } = useTranslation('dashboard');

  const dispatch = useAppDispatch();

  const {
    isOpen: settingsIsOpen,
    onOpen: settingsOnOpen,
    onClose: settingsOnClose
  } = useDisclosure();

  const {
    isOpen: createIsOpen,
    onOpen: createOnOpen
  } = useDisclosure();
  
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

  async function saveDashboardSettings (dashboard: Dashboard) {
    settingsOnClose();
    await dispatch(updateDashboard(consoleName, dashboard, dashboardId));
    const currentRoute = dashboard.route;
    const previousRoute = dashboards[dashboardId]?.route;
    if (currentRoute !== previousRoute) {
      const route = currentRoute.startsWith('/') ? currentRoute : `/${currentRoute}`;
      const redirectRoute = `/dashboards${route}`;
      navigate(redirectRoute);
    }
  }

  useEffect(function () {
    if (isEmpty(dashboards) && retryCount < 3) {
      void fetchData();
    }
  });

  const createWidgetModal = createIsOpen ? (
    <CreateWidgetModal
      isOpen={createIsOpen}
      consoleName={consoleName}
      dashboardId={dashboardId}
    />
  ) : (<></>);

  function renderHeader() {
    return (
      <>
      <Flex justify='space-between'>
        <Heading>{dashboardId}</Heading>
        <Button
          aria-label={'update-dashboard'}
          leftIcon={<SettingsIcon />}
          variant='outline'
          colorScheme='gray'
          onClick={settingsOnOpen}
        >
          {t('dashboardSettings')}
        </Button>
        <Button
          aria-label={'create-widget'}
          leftIcon={<SettingsIcon />}
          variant='outline'
          colorScheme='gray'
          onClick={createOnOpen}
        >
          {'Create Widget'}
        </Button>
      </Flex>
      </>
    );
  }

  let content = dashboardContents;
  if (settingsIsOpen) {
    content = (
      <DashboardSettings
        allDashboards={dashboards}
        dashboard={dashboards[dashboardId]}
        onClose={settingsOnClose}
        updateDashboard={saveDashboardSettings}
      />
    )
  }

  return (
    <>
      {createWidgetModal}
      <HeaderLayout>
        {renderHeader()}
      </HeaderLayout>
      <FullpageLayout>
        <Stack data-testid='console-page-contents'>
          {content}
        </Stack>
      </FullpageLayout>
    </>
  );
}