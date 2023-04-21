import React from 'react';
import { BaseWidget } from '@tinystacks/ops-core';
import { Widget} from '@tinystacks/ops-model';
import { Spinner, Stack } from '@chakra-ui/react';

type LoadingWidgetProps = Widget & { originalType: string };
const LoadingWidgetType = 'LoadingWidget';
class LoadingWidget extends BaseWidget {
  originalType: string;
  constructor (props: LoadingWidgetProps) {
    super(props);
    this.originalType = props.originalType;
    this.type = LoadingWidgetType;
  }

  render(_childrenWidgets: any, _overrides:() => any): JSX.Element {
    return <Stack w='100%' p='4'><Spinner/></Stack>;
  }

  static fromJson(w: LoadingWidgetProps): LoadingWidget {
    return new LoadingWidget(w);
  }

  toJson() {
    return { ...super.toJson(), originalType: this.originalType };
  }

  getData(): void | Promise<void> { return; }
}

export default LoadingWidget;
