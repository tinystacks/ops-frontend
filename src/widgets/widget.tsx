import { Widget as WidgetType } from '@tinystacks/ops-model';

abstract class Widget implements WidgetType {
  id: string;
  displayName: string;
  type: string;
  providerId: string;
  showDisplayName?: boolean;
  description?: string;
  showDescription?: boolean;

  constructor (
    id: string,
    displayName: string,
    type: string,
    providerId: string,
    showDisplayName?: boolean,
    description?: string,
    showDescription?: boolean
  ) {
    this.id = id;
    this.displayName = displayName;
    this.type = type;
    this.providerId = providerId;
    this.showDisplayName = showDisplayName;
    this.description = description;
    this.showDescription = showDescription; 
  }

  static fromJson(_object: WidgetType): Widget {
    throw new Error('Implement in child!');
  }

  toJson(): WidgetType {
    return {
      id: this.id,
      displayName: this.displayName,
      type: this.type,
      providerId: this.providerId,
      showDisplayName: this.showDisplayName,
      description: this.description,
      showDescription: this.showDescription
    };
  };

  public abstract render(): JSX.Element;
  
  public getData (): void {
    throw new Error('Not necessary in the frontend.')
  };
}

export default Widget;