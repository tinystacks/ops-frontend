import Widget from 'ops-frontend/widgets/widget';
import React from 'react';
import { Widget as WidgetType} from '@tinystacks/ops-model';

class SimpleTextWidget extends Widget {
  public render(): JSX.Element {
    return <>some text</>;
  };

  static fromJson(w: WidgetType): SimpleTextWidget {
    return new SimpleTextWidget(
      w.id || '', w.displayName, w.type, w.providerId, w.showDisplayName, w.description, w.showDescription
    );
  }
}

export default SimpleTextWidget;