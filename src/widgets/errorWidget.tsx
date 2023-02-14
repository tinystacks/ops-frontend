import React from 'react';
import Widget from 'ops-frontend/widgets/widget';
import { useTranslation } from 'react-i18next';
import { Widget as WidgetType} from '@tinystacks/ops-model';
class ErrorWidget extends Widget {
  render(): JSX.Element {
    const id = this.id;
    function Renderer() {
      const { t } = useTranslation();
      return <>{t('widgets.genericWidgetError', { id })}</>;
    };

    return <Renderer />;
  }

  static fromJson(w: WidgetType): ErrorWidget {
    return new ErrorWidget(
      w.id || '', w.displayName, w.type, w.providerId, w.showDisplayName, w.description, w.showDescription
    );
  }
}

export default ErrorWidget;
