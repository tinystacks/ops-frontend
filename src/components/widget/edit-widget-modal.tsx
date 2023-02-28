import React from 'react';
import { Widget } from '@tinystacks/ops-model';
import { useAppDispatch } from 'ops-frontend/store/hooks';
import { useTranslation } from 'react-i18next';
import {
  Button, MenuItem, Modal, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Textarea,
  useDisclosure
} from '@chakra-ui/react';
import apis from 'ops-frontend/utils/apis';
import { updateWidget } from 'ops-frontend/store/consoleSlice';
import DynamicModalBody from 'ops-frontend/components/modal/dynamic-modal-body';

export default function EditWidgetModal(props: { console: string, widget: Widget }) {
  // i18n
  const { t: commonMsg } = useTranslation('common');
  const { t: widgetMsg } = useTranslation('widget');

  // redux
  const dispatch = useAppDispatch();

  // props
  const { console, widget } = props;

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
          <ModalHeader>{widgetMsg('editWidgetTitle', { ...props.widget })}</ModalHeader>
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