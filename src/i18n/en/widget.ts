import { LocaleMessageType } from 'ops-frontend/i18n/messages';

const widgets: LocaleMessageType = {
  genericWidgetError: '{{id}} was not found or inaccurately set in yml',
  editWidgetTitle: 'Edit widget {{displayName}} ({{id}})',
  deleteWidgetTitle: 'Delete widget {{displayName}} ({{id}})',
  deleteConfirmation: 'Are you sure you want to delete widget {{displayName}} ({{id}})?',
  removeWidget: 'Remove From Dashboard'
};

export default widgets;
