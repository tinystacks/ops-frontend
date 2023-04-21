import React from 'react';
import { BaseWidget } from '@tinystacks/ops-core';
import { Widget} from '@tinystacks/ops-model';
import { Stack, Alert } from '@chakra-ui/react';

type ErrorWidgetProps = Widget & { originalType: string, error: string};
export const ErrorWidgetType = 'ErrorWidget';
class ErrorWidget extends BaseWidget {
  originalType: string;
  error: string;
  constructor (props: ErrorWidgetProps) {
    super(props);
    this.originalType = props.originalType;
    this.error = props.error;
    this.type = ErrorWidgetType;
  }
  render(): JSX.Element {
    // const id = this.id;
    const error = this.error;
    return <Stack w='100%' p='4'><Alert status='error'>{error}</Alert></Stack>;
  }

  static fromJson(w: ErrorWidgetProps): ErrorWidget {
    return new ErrorWidget(w);
  }

  toJson() {
    return { ...super.toJson(), originalType: this.originalType, error: this.error };
  }

  getData(): void | Promise<void> { return; }
}

export default ErrorWidget;
