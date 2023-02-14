import Page, { pidToPageRoute } from 'ops-frontend/pages/console/[page]';
import {  screen } from '@testing-library/react';
import { mockI18n } from 'ops-frontend-test/test-utils/i18n';
import { renderWithProviders } from 'ops-frontend-test/test-utils/store';

mockI18n();

function mockPageQueryRoute(page?: string | string[]) {
  const useRouter = jest.spyOn(require('next/router'), 'useRouter');
    useRouter.mockImplementation(() => ({
      query: { page },
    }));
}

describe('Page routes, headers, simple render', () => {
  afterEach(function () {
    jest.clearAllMocks();
  });
  
  it('renders not found with invalid path', async () => {
    mockPageQueryRoute('1234');
    renderWithProviders(<Page />, {
      preloadedState: {
        console: {
          name: 'test-console',
          pages:{},
          widgets: {},
          providers: {}
        }
      }
    });

    await screen.findByText('common.notFound');
  });

  it('renders correctly with valid path, page, and widgets', async () => {
    mockPageQueryRoute('main-page');
    renderWithProviders(<Page />, {
      preloadedState: {
        console: {
          pages:{
            'main-page': {
              id: 'main-page',
              route: 'main-page',
              widgetIds: [
                'simple-md-panel',
                'simple-md-panel-2'
              ]
            }
          },
          widgets: {
            'simple-md-panel': {
              type: 'Loading',
              displayName: 'markdown',
              providerId: 'nothing for now'
            },
            'simple-md-panel-2': {
              type: 'Loading',
              displayName: 'markdown',
              providerId: 'nothing for now'
            }
          },
          providers: {}
        }
      }
    });
    
    const renderedWidgets = await screen.findAllByTestId('widget');
    expect(renderedWidgets.length).toBe(2);
    expect(renderedWidgets[0].innerHTML).toBe('common.loading');
    expect(renderedWidgets[1].innerHTML).toBe('common.loading');
    expect((await screen.findByTestId('page-header-page-id')).innerText).toBeEmptyDOMElement;
  });

  it('page routes to / when no page is defined', async () => {
    mockPageQueryRoute();
    renderWithProviders(<Page />, {
      preloadedState: {
        console: {
          pages:{
            'main-page': {
              id: 'main-page',
              route: '/',
              widgetIds: [
                'simple-md-panel'
              ]
            }
          },
          widgets: {},
          providers: {}
        }
      }
    });

    expect((await screen.findByTestId('page-header-page-id')).textContent).toBe('main-page');
  });

  it('page routes to / when no page is defined', async () => {
    mockPageQueryRoute();
    renderWithProviders(<Page />, {
      preloadedState: {
        console: {
          pages:{
            'main-page': {
              id: 'main-page',
              route: '/',
              widgetIds: [
                'simple-md-panel'
              ]
            }
          },
          widgets: {},
          providers: {}
        }
      }
    });

    expect((await screen.findByTestId('page-header-page-id')).textContent).toBe('main-page');
  });

  it('page routes empty array to /', async () => {
    mockPageQueryRoute([]);
    renderWithProviders(<Page />, {
      preloadedState: {
        console: {
          pages:{
            'main-page': {
              id: 'main-page',
              route: '/',
              widgetIds: [
                'simple-md-panel'
              ]
            }
          },
          widgets: {},
          providers: {}
        }
      }
    });

    expect((await screen.findByTestId('page-header-page-id')).textContent).toBe('main-page');
  });

  it('page routes empty array to /', async () => {
    mockPageQueryRoute([]);
    renderWithProviders(<Page />, {
      preloadedState: {
        console: {
          pages:{
            'main-page': {
              id: 'main-page',
              route: '/',
              widgetIds: [
                'simple-md-panel'
              ]
            }
          },
          widgets: {},
          providers: {}
        }
      }
    });

    expect((await screen.findByTestId('page-header-page-id')).textContent).toBe('main-page');
  });

  it('page route function testing', async () => {
    expect(pidToPageRoute('')).toBe('/');
    expect(pidToPageRoute(undefined)).toBe('/');
    expect(pidToPageRoute([])).toBe('/');
    expect(pidToPageRoute('test')).toBe('test');
    expect(pidToPageRoute(['test'])).toBe('test');
    expect(pidToPageRoute(['test', 'test2'])).toBe('test');
  });
});

// const mockGetWidget = jest.fn();
// const getWidgetSpy = jest.spyOn(apis, 'getWidget').mockImplementation(mockGetWidget);
// mockGetWidget.mockRejectedValue('error');

describe('Page widget renders', () => {
  afterEach(function () {
    jest.clearAllMocks();
  });
  
  it('empty widgets list renders empty widgets div', async () => {
    mockPageQueryRoute('');
    renderWithProviders(<Page />, {
      preloadedState: {
        console: {
          pages:{
            'main': {
              id: 'main',
              route: '/',
              widgetIds: []
            }
          },
          widgets: {},
          providers: {}
        }
      }
    });

    expect((await screen.findByTestId('rendered-widgets'))).toBeEmptyDOMElement;
  });

  it('nonexistant referenced widgets render error widgets', async () => {
    mockPageQueryRoute('');
    renderWithProviders(<Page />, {
      preloadedState: {
        console: {
          pages:{
            'main': {
              id: 'main',
              route: '/',
              widgetIds: ['dne']
            }
          },
          widgets: {},
          providers: {}
        }
      }
    });

    expect((await screen.findByTestId('widget')).innerHTML).toBe('widgets.genericWidgetError');
  });

  it ('Unit test fetch failure', async () => {
    // mockGetWidget.mockRejectedValueOnce('error');
    // await fetchWidgetData('console', [new SimpleTextWidget('simple', 'text', 'SimplyTextWidget', '')]);
  });

  it ('Unit test fetch success', async () => {

  });

  // TODO: Test render with valid widget fetch
  // TODO: Test render with error'ed widget fetch
});
  