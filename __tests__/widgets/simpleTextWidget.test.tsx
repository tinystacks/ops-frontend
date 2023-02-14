import { screen, render } from '@testing-library/react';
import { mockI18n } from 'ops-frontend-test/test-utils/i18n';
import SimpleTextWidget from 'ops-frontend/widgets/simpleTextWidget';

mockI18n();

describe('SimpleTextWidet', () => {
  it('renders loading widget', async () => {
    const loading = new SimpleTextWidget('id', 'displayName', 'type', '');
    render(loading.render());

    await screen.findByText('some text');
  })
});
