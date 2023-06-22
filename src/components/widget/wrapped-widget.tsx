import {
  Heading, Flex, Spacer, Box, IconButton, Menu, MenuButton, MenuList, Center, Button, Icon, useDisclosure
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { HamburgerIcon } from '@chakra-ui/icons'
import { TbRefresh } from 'react-icons/tb';
import { Widget } from '@tinystacks/ops-model';
import EditWidgetModal from 'ops-frontend/components/widget/edit-widget-modal';
import DeleteWidgetModal from 'ops-frontend/components/widget/delete-widget-modal';
import { BaseWidget } from '@tinystacks/ops-core';
import { selectConsoleName, selectDashboard, updateHydratedWidget } from 'ops-frontend/store/consoleSlice';
import { useAppDispatch, useAppSelector } from 'ops-frontend/store/hooks';
import apis from 'ops-frontend/utils/apis';
import { FlatSchema, Json } from 'ops-frontend/types';
import LoadingWidget from 'ops-frontend/widgets/loading-widget';
import ErrorWidget from 'ops-frontend/widgets/error-widget';
import RemoveWidgetOption from 'ops-frontend/components/widget/remove-widget-option';


export type WrappedWidgetProps = {
  hydratedWidget: BaseWidget,
  widget: Widget,
  childrenWidgets: (Widget & { renderedElement: JSX.Element })[],
  onRefresh: () => void | Promise<void>,
  widgetProperties?: FlatSchema[];
  dashboardId: string,
  parameters?: Json
};

export default function WrappedWidget(props: WrappedWidgetProps) {
  // props
  const {
    hydratedWidget,
    widget,
    childrenWidgets,
    widgetProperties,
    dashboardId,
    parameters
  } = props;
  // redux
  const dispatch = useAppDispatch();
  const consoleName = useAppSelector(selectConsoleName);
  const dashboard = useAppSelector(selectDashboard(dashboardId));

  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: true });

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
      <IconButton 
        variant='link'
        size='md'
        colorScheme='black'
        onClick={onToggle}
        aria-label={isOpen ? 'downCaret' : 'upCaret'} 
        float='left'
        icon={isOpen ? <ChevronDownIcon/> : <ChevronUpIcon />} 
        />  
        <Center>    
        <Heading as='h4' size='md'>
            { widget.displayName || widget.id}
          </Heading>
        </Center>
        <Spacer />
        <Box>
        <Button 
          colorScheme="purple"
          variant="outline"
          marginRight={'8px'} 
          size='sm'
          border='0px'
          onClick={() => props.onRefresh()}
        >
          <Icon as={TbRefresh} />
        </Button>
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
                widgetProperties={widgetProperties}
                dashboardId={dashboardId}
                parameters={parameters}
              />
              <DeleteWidgetModal key={`${widget.id}-delete`} console={consoleName} widget={widget} />
              <RemoveWidgetOption
                consoleName={consoleName}
                dashboard={dashboard}
                widgetId={widget.id}
              />
            </MenuList>
          </Menu>
        </Box>
      </Flex>
    </Box>;
  return (
    <Box data-testid='widget' className='widget' key={widget.id}>
      {heading}
      <Flex className='widgetBody' hidden={!isOpen}>
        {hydratedWidget.render(
          childrenWidgets,
          updateOverrides
        )}
      </Flex>
    </Box>
  );
}