import React from 'react';
import { WidgetParser as Widget } from '@tinystacks/ops-core';
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
      w.type, w.displayName, w.providerId, w.showDisplayName, w.description, w.showDescription, w.id || ''
    );
  }
}

export default ErrorWidget;
