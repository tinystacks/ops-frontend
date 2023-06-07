import { Widget } from '@tinystacks/ops-model';
import { JSONSchema7 } from 'json-schema';

export type WidgetMap = { [id: string]: Widget };
export type FlatMap = { [id: string]: string };
export type Json = { [key: string]: any };
export type GetWidgetArguments = {
  consoleName: string;
  widget: Widget;
  overrides?: any;
  dashboardId?: string;
  parameters?: Json;
};
export type ShowableError = {
  title: string;
  message: string;
}

export type FlatSchema = JSONSchema7 & {
  name: string;
  isRequired: boolean;
}