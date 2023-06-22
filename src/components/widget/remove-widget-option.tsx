import {
  MenuItem
} from '@chakra-ui/react';
import { useAppDispatch } from 'ops-frontend/store/hooks';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { updateDashboard } from 'ops-frontend/store/consoleSlice';
import { Dashboard } from '@tinystacks/ops-model';

export type RemoveWidgetOptionProps = {
  consoleName: string,
  dashboard: Dashboard,
  widgetId: string
}

export default function RemoveWidgetOption(props: RemoveWidgetOptionProps) {
  // i18n
  const { t: widgetMsg } = useTranslation('widget');

  // redux
  const dispatch = useAppDispatch();

  // props
  const {
    consoleName,
    dashboard,
    widgetId
  } = props;

  async function removeWidgetFromDashboard() {
    const updatedWidgetIds = dashboard.widgetIds?.filter(wId => wId !== widgetId);
    const updatedDashboard: Dashboard = {
      ...dashboard,
      widgetIds: updatedWidgetIds
    };
    dispatch(updateDashboard(consoleName, updatedDashboard, updatedDashboard.id));
  }
  return (
    <MenuItem onClick={removeWidgetFromDashboard}>
      {widgetMsg('removeWidget')}
    </MenuItem>
  );
}