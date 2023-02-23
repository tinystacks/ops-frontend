import React from 'react';
import { BaseWidget } from '@tinystacks/ops-core';
import { useTranslation } from 'react-i18next';
import { Widget as WidgetType} from '@tinystacks/ops-model';

class ErrorWidget extends BaseWidget {
  render(): JSX.Element {
    const id = this.id;
    function Renderer() {
      const { t } = useTranslation();
      return <>{t('widgets.genericWidgetError', { id })}</>;
    };

    return <Renderer />;
  }

  static fromJson(w: WidgetType): ErrorWidget {
    return new ErrorWidget(w);
  }

  getData(): void | Promise<void> { return; }
}

export default ErrorWidget;
