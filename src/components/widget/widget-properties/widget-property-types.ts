export type WidgetPropertyProps = {
  name: string;
  value: string | undefined;
  setter: (key: string, newValue: any) => void;
  isRequired?: boolean;
  isDisabled?: boolean;
};

export type WidgetListPropertyProps = Omit<WidgetPropertyProps, 'value'> & {
  value: string[] | undefined;
}

export type WidgetDropdownPropertyProps = Omit<WidgetPropertyProps, 'value'> & {
  value: string[] | undefined;
  options: string[];
}