import { BaseWidget } from '@tinystacks/ops-core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Widget as WidgetType} from '@tinystacks/ops-model';

class LoadingWidget extends BaseWidget {
  public render(): JSX.Element {
    const Loading = () => {
      const { t } = useTranslation();
      return <>{t('common.loading')}</>;
    };
    return <Loading />;
  };


  static fromJson(w: WidgetType): LoadingWidget {
    return new LoadingWidget(w);
  }

  getData(): void | Promise<void> { return; }
}

export default LoadingWidget;