import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@chakra-ui/react';
import React from 'react';
import { useRouter } from 'next/router';
import { selectConsoleName, selectDashboard, selectDashboardIdFromRoute } from 'ops-frontend/store/consoleSlice';
import { useAppSelector } from 'ops-frontend/store/hooks';
import { useTranslation } from 'react-i18next';
import { dashboardQueryToDashboardRoute } from 'ops-frontend/utils/route';
import { ChevronRightIcon } from '@chakra-ui/icons';

export default function Breadcrumbs() {
  const router = useRouter();


  const { dashboard: dashboardQuery } = router.query;
  const dashboardRoute = dashboardQueryToDashboardRoute(dashboardQuery);
  const consoleName = useAppSelector(selectConsoleName);
  const dashboardId = useAppSelector(selectDashboardIdFromRoute(dashboardRoute));
  const dashboard = useAppSelector(selectDashboard(dashboardId));
  const { t: cm } = useTranslation('common');


  function createBreadcrumbs() {
    const breadcrumbs = [];
    if (!consoleName) {
      return [createBreadcrumb(cm('opsConsole'), '/', true)];
    }

    breadcrumbs.push(createBreadcrumb(consoleName, '/', !dashboardRoute));

    if (dashboard) {
      breadcrumbs.push(createBreadcrumb(dashboard.id, dashboard.route, true));
    }

    return breadcrumbs;
  }

  return (
    <Breadcrumb
      separator={<ChevronRightIcon color='gray.500' />}
      spacing='8px'
      pb='s'
    >
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