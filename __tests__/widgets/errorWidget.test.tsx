import ErrorWidget from 'ops-frontend/widgets/errorWidget';
import { screen, render } from '@testing-library/react';
import { mockI18n } from 'ops-frontend-test/test-utils/i18n';

mockI18n();

describe('ErrorWidget', () => {
  it('renders error widget with correct ID', async () => {
    const errorWidget = new ErrorWidget('id', 'displayName', 'type', '');
    render(errorWidget.render());

    await screen.findByText('widgets.genericWidgetError');
  })
});
