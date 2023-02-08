import Page, { pidToPageRoute } from "ops-frontend/pages/console/[page]";
import { screen } from "@testing-library/react";
import { mockI18n } from "ops-frontend-test/test-utils/i18n";
import { renderWithProviders } from "ops-frontend-test/test-utils/store";
// import mockRouter from 'next-router-mock';
// import nextRouter from 'next/router';

mockI18n();
// jest.mock('next/router', () => require('next-router-mock'));

function mockPageQueryRoute(page?: string | string[]) {
  const useRouter = jest.spyOn(require('next/router'), 'useRouter');
    useRouter.mockImplementationOnce(() => ({
      query: { page },
    }));
}

describe("Page", () => {
  afterEach(function () {
    jest.clearAllMocks();
  });
  it("renders not found with invalid path", async () => {
    mockPageQueryRoute();
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

    await screen.findByText("common.notFound");
  });

  it("renders correctly with valid path, page, and widgets", async () => {
    mockPageQueryRoute('main-page');
    renderWithProviders(<Page />, {
      preloadedState: {
        console: {
          pages:{
            "main-page": {
              id: "main-page",
              route: "main-page",
              widgetIds: [
                "simple-md-panel",
                "simple-md-panel-2"
              ]
            }
          },
          widgets: {
            "simple-md-panel": {
              type: "Markdown",
              displayName: 'markdown',
              providerId: 'nothing for now'
            },
            "simple-md-panel-2": {
              type: "Markdown",
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
    expect(renderedWidgets[0].innerHTML).toBe('some markdown');
    expect(renderedWidgets[1].innerHTML).toBe('some markdown');
    expect((await screen.findByTestId('page-header-page-id')).innerText).toBeEmptyDOMElement;
  });

  it('page header renders empty div when page does not have id', async () => {
    mockPageQueryRoute('main-page');
    renderWithProviders(<Page />, {
      preloadedState: {
        console: {
          pages:{
            "main-page": {
              route: "main-page",
              widgetIds: [
                "simple-md-panel"
              ]
            }
          },
          widgets: {},
          providers: {}
        }
      }
    });

    expect((await screen.findByTestId('page-header-page-id-undefined'))).toBeEmptyDOMElement;
  });

  it('page routes to / when no page is defined', async () => {
    mockPageQueryRoute();
    renderWithProviders(<Page />, {
      preloadedState: {
        console: {
          pages:{
            "main-page": {
              id: 'main-page',
              route: "/",
              widgetIds: [
                "simple-md-panel"
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
            "main-page": {
              id: 'main-page',
              route: "/",
              widgetIds: [
                "simple-md-panel"
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
            "main-page": {
              id: 'main-page',
              route: "/",
              widgetIds: [
                "simple-md-panel"
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
            "main-page": {
              id: 'main-page',
              route: "/",
              widgetIds: [
                "simple-md-panel"
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