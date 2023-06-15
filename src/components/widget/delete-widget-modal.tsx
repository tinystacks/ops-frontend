import {
  Button, MenuItem, Modal, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure
} from '@chakra-ui/react';
import { useAppDispatch } from '../../store/hooks.js';
import apis from '../../utils/apis.js';
import React from 'react';
import { useTranslation } from 'react-i18next';
import DynamicModalBody from '../../components/modal/dynamic-modal-body.js';
import { deleteWidget } from '../../store/consoleSlice.js';
import { Widget } from '@tinystacks/ops-model';

export default function DeleteWidgetModal(props: { console: string, widget: Widget}) {
  // i18n
  const { t: commonMsg } = useTranslation('common');
  const { t: widgetMsg } = useTranslation('widget');

  // redux
  const dispatch = useAppDispatch();

  // props
  const { console, widget } = props;
  const { id: widgetId } = widget;

  //state
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [loading, setLoading] = React.useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  async function onConfirmClick() {
    setLoading(true);
    setError(undefined);
    try {
      await apis.deleteWidget(console, widgetId);
      dispatch(deleteWidget(widgetId));
      onClose();
    } catch (e) {
      // TODO: delete error message
      setError(widgetId);
    }
    setLoading(false);
  }
  return (
    <>
      <MenuItem onClick={onOpen}>
        {commonMsg('delete')}
      </MenuItem>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{widgetMsg('deleteWidgetTitle', { ...widget })}</ModalHeader>
          <ModalCloseButton />
          <DynamicModalBody
            loading={loading}
            error={error}
            body={<>{widgetMsg('deleteConfirmation', { ...widget })}</>}
          />
          <ModalFooter>
            <Button mr={3} onClick={onClose}>
              {commonMsg('close')}
            </Button>
            <Button
              onClick={onConfirmClick}
              disabled={loading}
              colorScheme='red'
            >
              {commonMsg('delete')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}