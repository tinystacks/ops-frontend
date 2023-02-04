import { addPage, selectPages, updatePage } from 'ops-frontend/store/consoleSlice';
import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from 'ops-frontend/store/hooks';

export function Console() {
  const pages = useAppSelector(selectPages);
  const dispatch = useAppDispatch();
  const [pageText, setPageText] = useState('updated');

  function renderPages() {
    const pagesRender = pages.map((p: string, index: number) => {
      return (
        <div key={`page${index}`}>
          {p}
        </div>
      );
    });

    return (
      <div data-testid='pages-panel'>
        {pagesRender}
      </div>
    );
  }

  return (
    <div>
      Hello
      <div>
        <button
            data-testid='add-page'
            onClick={() => dispatch(addPage('new page'))}
          >
            +
        </button>
        <button
            onClick={() => dispatch(updatePage({page: pageText, index: 0}))}
          >
            ~
        </button>
        <input
            value={pageText}
            onChange={e => setPageText(e.target.value)}
          />
        </div>
        <div>Pages: {renderPages()}</div>
    </div>
  );
}
