import {
  Heading, Flex, Spacer, Box, IconButton, Menu, MenuButton, MenuList, Center
} from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons'
import { Widget as WidgetType } from '@tinystacks/ops-model';
import EditWidgetModal from '../../components/widget/edit-widget-modal.js';
import DeleteWidgetModal from '../../components/widget/delete-widget-modal.js';
import { Widget } from '@tinystacks/ops-core';
import { selectConsoleName, updateHydratedWidget } from '../../store/consoleSlice.js';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import apis from '../../utils/apis.js';
import { Json } from '../../types.js';
import LoadingWidget from '../../widgets/loading-widget.js';
import ErrorWidget from '../../widgets/error-widget.js';


export type WrappedWidgetProps = {
  hydratedWidget: Widget,
  widget: WidgetType,
  childrenWidgets: (WidgetType & { renderedElement: JSX.Element })[],
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
    dispatch(updateHydratedWidget(new LoadingWidget({ 
      ...widget,
      originalType: widget.type,
    }).toJson()));
    void apis.getWidget({
      consoleName,
      widget,
      overrides: JSON.stringify(overrides),
      dashboardId,
      parameters
    })
      .then(w => dispatch(updateHydratedWidget(w)))
      .catch((e: any) =>
        dispatch(updateHydratedWidget(new ErrorWidget({
          ...widget,
          originalType: widget.type,
          error: e.message
        }).toJson()))
      );
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