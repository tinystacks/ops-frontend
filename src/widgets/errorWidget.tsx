import React from 'react';
import { BaseWidget } from '@tinystacks/ops-core';
import { Widget} from '@tinystacks/ops-model';

type ErrorWidgetProps = Widget & { originalType: string, error: string};

class ErrorWidget extends BaseWidget {
  originalType: string;
  error: string;
  constructor (props: ErrorWidgetProps) {
    super(props);
    this.originalType = props.originalType;
    this.error = props.error;
  }
  render(): JSX.Element {
    // const id = this.id;
    const error = this.error;
    function Renderer() {
      return <>{error}</>;
    };

    return <Renderer />;
  }

  static fromJson(w: ErrorWidgetProps): ErrorWidget {
    return new ErrorWidget(w);
  }

  getData(): void | Promise<void> { return; }
}

export default ErrorWidget;
