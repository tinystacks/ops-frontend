import React from 'react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, Text } from '@chakra-ui/react';
import { selectDashboard, selectDashboardIdFromRoute } from 'ops-frontend/store/consoleSlice';
import { useAppSelector } from 'ops-frontend/store/hooks';
import { useTranslation } from 'react-i18next';
import { ChevronRightIcon } from '@chakra-ui/icons';
import { useParams } from 'react-router-dom';

export default function Breadcrumbs() {
  const { route = '' } = useParams();

  const dashboardId = useAppSelector(selectDashboardIdFromRoute(route));
  const dashboard = useAppSelector(selectDashboard(dashboardId));
  const { t: cm } = useTranslation('common');


  function createBreadcrumbs() {
    const breadcrumbs = [];

    breadcrumbs.push(createBreadcrumb(cm('dashboards'), '/', !route));

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