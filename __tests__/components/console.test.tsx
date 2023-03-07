import { Console } from 'components/Dashboard';
import { screen } from '@testing-library/react';
import { mockI18n } from 'ops-frontend-test/test-utils/i18n';
import { renderWithProviders } from 'ops-frontend-test/test-utils/store';

mockI18n();

describe('Console', () => {
  it('starts empty', async () => {
    renderWithProviders(<Console pageContents={<></>}/>, {
      preloadedState: {
          console: {
          pages: {},
          widgets: {}
        }
      }
    });
    expect(screen.getByTestId('console-page-contents').innerHTML).toBeEmptyDOMElement;
  });

  it('renders-left-nav', async () => {
    renderWithProviders(<Console pageContents={<div></div>}/>, {
      preloadedState: {
          console: {
          pages: {
            main: {
              id: 'main'
            }
          },
          widgets: {}
        }
      }
    });
    expect(screen.getByTestId('console-left-nav').childNodes.length).toBe(1);
    expect(screen.getByTestId('console-left-nav-item').innerHTML).toBe('main');
  });
});



