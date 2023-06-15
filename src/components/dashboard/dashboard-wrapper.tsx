import { dismissError, handleError, selectConsoleName, selectDashboards, selectError, updateConsole, updateDashboard } from '../../store/consoleSlice.js';
import React, { ReactNode, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import apis from '../../utils/apis.js';
import { Button, Flex, Heading, Stack, useDisclosure } from '@chakra-ui/react';
import { HeaderLayout } from '../../components/layout/header-layout.js';
import isEmpty from 'lodash.isempty';
import { FullpageLayout } from '../../components/layout/fullpage-layout.js';
import { SettingsIcon } from '@chakra-ui/icons';
import { useTranslation } from 'react-i18next';
import DashboardSettings from '../../components/dashboard/dashboard-settings.js';
import { ApiError, Dashboard } from '@tinystacks/ops-model';
import { useNavigate } from 'react-router-dom';
import DismissableErrorBanner from '../../components/common/dismissable-error-banner.js';

export function DashboardWrapper(props: { dashboardContents: ReactNode, dashboardId: string }) {
  const { dashboardContents, dashboardId } = props;
  const navigate = useNavigate();
  const dashboards = useAppSelector(selectDashboards);
  const consoleName = useAppSelector(selectConsoleName);
  const [retryCount, setRetryCount] = useState<number>(0);
  const { t } = useTranslation('dashboard');
  const error = useAppSelector(selectError);

  const dispatch = useAppDispatch();

  const {
    isOpen: settingsIsOpen,
    onOpen: settingsOnOpen,
    onClose: settingsOnClose
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
      if (retryCount >= 2) {
        const error = (e as any).body as ApiError;
        dispatch(handleError({
          title: 'Failed to fetch console!',
          error: error?.body || error
        }));
      }
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

  let errorBanner = (<></>);
  if (error) {
    errorBanner = (
      <DismissableErrorBanner
        key='dashboard-wrapper-error'
        error={error}
        dismissError={() => dispatch(dismissError())}
      />
    );
  }

  return (
    <>
      <HeaderLayout>
        {renderHeader()}
      </HeaderLayout>
      {errorBanner}
      <FullpageLayout>
        <Stack data-testid='console-page-contents'>
          {content}
        </Stack>
      </FullpageLayout>
    </>
  );
}