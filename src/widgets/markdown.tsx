import { Widget as WidgetType } from "@tinystacks/ops-model";
import React from 'react';
import Widget from "ops-frontend/widgets/widget";

class Markdown extends Widget {
  mdText: string = '';
  constructor(
    id: string,
    displayName: string,
    type: string,
    providerId: string,
    showDisplayName?: boolean,
    description?: string,
    showDescription?: boolean
  ) {
    super(id, displayName, type, providerId, showDisplayName, description, showDescription);
  }

  getData() {
    this.mdText = 'some markdown';
  }

  static fromJson(_object: WidgetType): Markdown {
    const { id, displayName, type, providerId, showDisplayName, description, showDescription } = _object;
    return new Markdown(id || "", displayName, type, providerId, showDisplayName, description, showDescription);
  };

  toJson(): WidgetType {
    throw new Error("Method not implemented.");
  }

  render(): JSX.Element {
    return <>{this.mdText}</>;
  }
}

export default Markdown;
