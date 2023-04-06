import {
  Heading, Flex, Spacer, Box, IconButton, Menu, MenuButton, MenuList, Center
} from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons'
import { Widget } from '@tinystacks/ops-model';
import EditWidgetModal from 'ops-frontend/components/widget/edit-widget-modal';
import DeleteWidgetModal from 'ops-frontend/components/widget/delete-widget-modal';
import { BaseWidget } from '@tinystacks/ops-core';
import { selectConsoleName, updateHydratedWidget } from 'ops-frontend/store/consoleSlice';
import { useAppDispatch, useAppSelector } from 'ops-frontend/store/hooks';
import apis from 'ops-frontend/utils/apis';
import { Json } from 'ops-frontend/types';


export type WrappedWidgetProps = {
  hydratedWidget: BaseWidget,
  widget: Widget,
  childrenWidgets: (Widget & { renderedElement: JSX.Element })[],
  dashboardId?: string,
  parameters?: Json
};

export default function WrappedWidget(props: WrappedWidgetProps) {
  // redux
  const dispatch = useAppDispatch();
  const consoleName = useAppSelector(selectConsoleName);
  // props
  const {
    hydratedWidget,
    widget,
    childrenWidgets,
    dashboardId,
    parameters
  } = props;

  function updateOverrides (overrides: any) {
    void apis.getWidget({
      consoleName,
      widget,
      overrides: JSON.stringify(overrides),
      dashboardId,
      parameters
    })
      .then(w => dispatch(updateHydratedWidget(w)));
  };

  // undefined display options default to true
  const heading = widget.displayOptions?.showDisplayName === false ?
    <></> :
    <Box className='widgetHeader'>
      <Flex>
        <Center>
          <Heading as='h4' size='md'>
            {widget.displayName || widget.id}
          </Heading>
        </Center>
        <Spacer />
        <Box>
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label='Options'
              icon={<HamburgerIcon />}
              variant='outline'
            />
            <MenuList className='dropdown'>
              <EditWidgetModal
                key={`${widget.id}-edit`}
                console={consoleName}
                widgetId={widget.id}
                dashboardId={dashboardId}
                parameters={parameters}
              />
              <DeleteWidgetModal key={`${widget.id}-delete`} console={consoleName} widget={widget} />
            </MenuList>
          </Menu>
        </Box>
      </Flex>
    </Box>;
  return (
    <Box data-testid='widget' className='widget' key={widget.id}>
      {heading}
      <Flex className='widgetBody'>
        {hydratedWidget.render(
          childrenWidgets,
          updateOverrides
        )}
      </Flex>
    </Box>
  );
}