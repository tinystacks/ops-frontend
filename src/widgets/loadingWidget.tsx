import Widget from 'ops-frontend/widgets/widget';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Widget as WidgetType} from '@tinystacks/ops-model';

class LoadingWidget extends Widget {
  public render(): JSX.Element {
    const Loading = () => {
      const { t } = useTranslation();
      return <>{t('common.loading')}</>;
    };
    return <Loading />;
  };

  static fromJson(w: WidgetType): LoadingWidget {
    return new LoadingWidget(
      w.id || '', w.displayName, w.type, w.providerId, w.showDisplayName, w.description, w.showDescription
    );
  }
}

export default LoadingWidget;