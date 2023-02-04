import { Console } from 'ops-frontend/components/console';
import { fireEvent, screen } from '@testing-library/react';
import { mockI18n } from 'ops-frontend-test/test-utils/i18n';
import { renderWithProviders } from 'ops-frontend-test/test-utils/store';

mockI18n();

describe('Console', () => {
  it('starts empty', async () => {
    const { store } = renderWithProviders(<Console />);
    expect(screen.getByTestId('pages-panel').childNodes.length).toBe(0);
  });

  it('Adding one page works', async () => {
    const { store } = renderWithProviders(<Console />);
    
    const addButton = await screen.findByTestId('add-page');
    fireEvent.click(addButton);
    await screen.findByText('+');
    await screen.findByText('new page');
    expect(screen.getByTestId('pages-panel').childNodes.length).toBe(1);
  });
});



