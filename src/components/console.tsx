import { selectPages } from 'ops-frontend/store/consoleSlice';
import React, { ReactNode } from 'react';
import { useAppSelector } from 'ops-frontend/store/hooks';

// The Console component is a wrapper around a Page
// It currently includes the console-level header and left-nav 

export function Console(props: { pageContents: ReactNode }) {
  const { pageContents } = props;
  const pages = useAppSelector(selectPages);

  
  function renderHeader() {
    return (
      <>
        {renderBreadcrumbs()}
        <div>
          {/* TODO use dashboard name */}
          <h1>Dashboard</h1>
          {/* TODO: ACTIONS */}
          <button>
            Dashboard Settings
          </button>
        </div>
      </>
    );
  }

  function renderBreadcrumbs() {
    return (
      <div>
        TODO
      </div>
    );
  }

  function renderLeftNav() {
    return (
      <div data-testid='console-left-nav'>
        {Object.keys(pages).map((page: string) => (
          <div key={page} data-testid='console-left-nav-item'>
            {page}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {renderHeader()}
      {renderLeftNav()}
      <div data-testid='console-page-contents'>
        {pageContents}
      </div>
    </div>
  );
}
