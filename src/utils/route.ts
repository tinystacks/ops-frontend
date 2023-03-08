import isEmpty from 'lodash.isempty';

export function dashboardQueryToDashboardRoute(dq: string | string[] | undefined): string {
  if (!dq) {
    return '/';
  }

  if (typeof dq === 'string') {
    return dq;
  }

  // case list
  if (isEmpty(dq)) {
    return '/';
  }

  return dq[0];
}