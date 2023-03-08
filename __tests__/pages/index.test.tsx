import Home from 'ops-frontend/pages/index';
import { screen } from '@testing-library/react';
import { mockI18n } from 'ops-frontend-test/test-utils/i18n';
import { renderWithProviders } from 'ops-frontend-test/test-utils/store';

mockI18n();

describe('Home', () => {
  it('renders the ops console header', async () => {
    renderWithProviders(<Home />);

    await screen.findByText('dashboard');
  })
});
