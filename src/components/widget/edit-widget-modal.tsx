import React from 'react';
import { useAppDispatch } from 'ops-frontend/store/hooks';
import { useTranslation } from 'react-i18next';
import {
  Button, MenuItem, Modal, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Textarea,
  useDisclosure
} from '@chakra-ui/react';
import apis from 'ops-frontend/utils/apis';
import { selectWidget, updateHydratedWidget, updateWidget } from 'ops-frontend/store/consoleSlice';
import DynamicModalBody from 'ops-frontend/components/modal/dynamic-modal-body';
import { useSelector } from 'react-redux';
import { Json } from 'ops-frontend/types';

export default function EditWidgetModal(props: {
  console: string;
  widgetId: string;
  dashboardId?: string;
  parameters?: Json;
}) {
  // i18n
  const { t: commonMsg } = useTranslation('common');
  const { t: widgetMsg } = useTranslation('widget');

  // props
  const {
    console,
    widgetId,
    dashboardId,
    parameters
  } = props;

  // redux
  const dispatch = useAppDispatch();
  const widget = useSelector(selectWidget(widgetId));

  //state
  const [value, setValue] = React.useState(JSON.stringify(widget, undefined, 2));
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const { isOpen, onOpen, onClose } = useDisclosure();

  function handleInputChange(e: { target: { value: string; }; }) {
    let inputValue = e.target.value
    setValue(inputValue)
  };

  async function onSaveClick() {
    setLoading(true);
    setError(undefined);
    try {
      const updatedWidget = await apis.updateWidget(console, widget.id, JSON.parse(value));
      dispatch(updateWidget(updatedWidget));
      const hydratedUpdatedWidget = await apis.getWidget({
        consoleName: console,
        widget,
        dashboardId,
        parameters
      });
      dispatch(updateHydratedWidget(hydratedUpdatedWidget));
    } catch (e) {
      setError(widget.id);
    }
    setLoading(false);
  }

  async function resetAndClose() {
    setError(undefined);
    onClose();
  }

  return (
    <>
      <MenuItem onClick={onOpen}>
        {commonMsg('edit')}
      </MenuItem>

      <Modal isOpen={isOpen} onClose={resetAndClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{widgetMsg('editWidgetTitle', { ...widget })}</ModalHeader>
          <ModalCloseButton />
          <DynamicModalBody
            error={error}
            loading={loading}
            body={
              <Textarea
                value={value}
                onChange={handleInputChange}
                size='sm'
              />
            }
          />
          <ModalFooter>
            <Button mr={3} onClick={resetAndClose}>
              {commonMsg('close')}
            </Button>
            <Button
              onClick={onSaveClick}
              disabled={loading}
              colorScheme='blue'
            >
              {commonMsg('save')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}