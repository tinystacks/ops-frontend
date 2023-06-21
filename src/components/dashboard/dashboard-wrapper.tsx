import { selectConsoleName, selectDashboards, selectDependencies, 
  updateConsole, updateDashboard } from 'ops-frontend/store/consoleSlice';
import React, { ReactNode, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from 'ops-frontend/store/hooks';
import apis from 'ops-frontend/utils/apis';
import { Button, Flex, Heading, Stack, useDisclosure, ButtonGroup, IconButton,
  Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';
import { HeaderLayout } from 'ops-frontend/components/layout/header-layout';
import isEmpty from 'lodash.isempty';
import { FullpageLayout } from 'ops-frontend/components/layout/fullpage-layout';
import { SettingsIcon, AddIcon } from '@chakra-ui/icons';
import { useTranslation } from 'react-i18next';
import DashboardSettings from 'ops-frontend/components/dashboard/dashboard-settings';
import { Dashboard } from '@tinystacks/ops-model';
import { useNavigate } from 'react-router-dom';
import CreateWidgetModal from 'ops-frontend/components/dashboard/create-widget-modal';
import AddExistingWidgetModal from 'ops-frontend/components/dashboard/add-existing-widget-modal';

export function DashboardWrapper(props: { dashboardContents: ReactNode, dashboardId: string }) {
  const { dashboardContents, dashboardId } = props;
  const navigate = useNavigate();
  const dashboards = useAppSelector(selectDashboards);
  const consoleName = useAppSelector(selectConsoleName);
  const dependencies = useAppSelector(selectDependencies);
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
    onOpen: createOnOpen, 
    onClose
  } = useDisclosure();

  const {
    isOpen: addExistingIsOpen,
    onOpen: addExistingOnOpen, 
    onClose: addExsitingOnClose
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
      onClose={onClose}
      consoleName={consoleName}
      dashboardId={dashboardId}
      widgetTypes={Object.keys(dependencies)}
    />
  ) : (<></>);

  const addWidgetModel = addExistingIsOpen ? ( 
    <AddExistingWidgetModal
    isOpen={addExistingIsOpen}
    onClose={addExsitingOnClose}
    consoleName={consoleName}
    dashboardId={dashboardId}
    />

  ) : (<></>);

  function renderHeader() {
    return (
      <>
      <Flex justify='space-between'>
        <Heading>{dashboardId}</Heading>
        <ButtonGroup size='md' isAttached variant='outline'>
        <Button
          aria-label={'update-dashboard'}
          leftIcon={<SettingsIcon />}
          variant='outline'
          colorScheme='gray'
          onClick={settingsOnOpen}
        >
          {t('dashboardSettings')}
        </Button>
        <Menu>
          <MenuButton as={IconButton} aria-label='Create or Add Widget' 
          icon={<AddIcon />} variant='outline' colorScheme='gray' />
          <MenuList>
            <MenuItem onClick={createOnOpen} >Create</MenuItem>
            <MenuItem onClick={addExistingOnOpen}>Add Existing</MenuItem>
          </MenuList>
        </Menu>
        </ButtonGroup>
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
      {addWidgetModel}
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