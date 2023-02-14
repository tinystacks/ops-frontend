import LoadingWidget from 'ops-frontend/widgets/loadingWidget';
import { screen, render } from '@testing-library/react';
import { mockI18n } from 'ops-frontend-test/test-utils/i18n';

mockI18n();

describe('LoadingWidget', () => {
  it('renders loading widget', async () => {
    const loading = new LoadingWidget('id', 'displayName', 'type', '');
    render(loading.render());

    await screen.findByText('common.loading');
  })
});
