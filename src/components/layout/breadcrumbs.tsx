import React from 'react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, Text } from '@chakra-ui/react';
import { useRouter } from 'next/router.js';
import { selectDashboard, selectDashboardIdFromRoute } from '../../store/consoleSlice.js';
import { useAppSelector } from '../../store/hooks.js';
import { useTranslation } from 'react-i18next';
import { dashboardQueryToDashboardRoute } from '../../utils/route.js';
import { ChevronRightIcon } from '@chakra-ui/icons';

export default function Breadcrumbs() {
  const router = useRouter();


  const { dashboard: dashboardQuery } = router.query;
  const dashboardRoute = dashboardQueryToDashboardRoute(dashboardQuery);
  const dashboardId = useAppSelector(selectDashboardIdFromRoute(dashboardRoute));
  const dashboard = useAppSelector(selectDashboard(dashboardId));
  const { t: cm } = useTranslation('common');


  function createBreadcrumbs() {
    const breadcrumbs = [];

    breadcrumbs.push(createBreadcrumb(cm('dashboards'), '/', !dashboardRoute));

    if (dashboard) {
      breadcrumbs.push(createBreadcrumb(dashboard.id, dashboard.route, true));
    }

    return breadcrumbs;
  }

  return (
    <Breadcrumb
      separator={<ChevronRightIcon color='gray.500' />}
      spacing='8px'
      pb='1em'
    >
      <BreadcrumbItem>
        <Text>{cm('opsConsole')}</Text>
      </BreadcrumbItem>
      {createBreadcrumbs()}
    </Breadcrumb>
  );
}

function createBreadcrumb(name: string, href: string, isCurrentPage?: boolean): JSX.Element {
  return (
    <BreadcrumbItem isCurrentPage={isCurrentPage} key={name}>
      <BreadcrumbLink href={href}>{name}</BreadcrumbLink>
    </BreadcrumbItem>
  );
}