export type WidgetPropertyProps = {
  name: string;
  value: string;
  setter: (key: string, newValue: any) => void;
  isRequired?: boolean;
  isDisabled?: boolean;
};

export type WidgetListPropertyProps = Omit<WidgetPropertyProps, 'value'> & {
  value: string[];
}

export type WidgetDropdownPropertyProps = Omit<WidgetPropertyProps, 'value'> & {
  value: string[];
  options: string[];
}