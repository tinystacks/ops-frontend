import { selectPages, updateConsole } from 'store/consoleSlice';
import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import apis from 'utils/apis';
import { Heading, Wrap } from '@chakra-ui/react';
import { HeaderLayout } from 'components/header-layout';
import isEmpty from 'lodash.isempty';
import { FullpageLayout } from 'components/fullpage-layout';
import { useTranslation } from 'react-i18next';

export const DashboardList = () => {
  const { t: cm } = useTranslation('common');
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

  useEffect(() => {
    if (isEmpty(pages)) {
      void fetchData();
    }
  });

  function renderHeader() {
    return (
      <>
        {renderBreadcrumbs()}
        <Heading>{cm('dashboard')}</Heading>
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
        {cm('opsConsole')} &gt; {cm('dashboards')}
      </div>
    );
  }


  const renderCards = () => (
    <>
    {/* FIXME type issues with page
    Object.values(pages).forEach(page => {
      return (
        <Wrap>
          <DashboardCard page={page} />
        </Wrap>
      );
    })*/}
    </>
  );


  return (
    <>
      <HeaderLayout>
        {renderHeader()}
      </HeaderLayout>
      <FullpageLayout>
        <Wrap data-testid='console-page-contents' spacing="6" pt="6" maxWidth="7xl">
          {renderCards()}
        </Wrap>
      </FullpageLayout>
    </>
  );
}
