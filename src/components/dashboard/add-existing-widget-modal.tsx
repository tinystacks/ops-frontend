import {
  Button,
  FormControl,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select
} from '@chakra-ui/react';
import isEmpty from 'lodash.isempty';
import React from 'react';
import { useState } from 'react';
import {  selectConsoleWidgets, selectDashboardWidgets } from 'ops-frontend/store/consoleSlice';
import { useAppSelector } from 'ops-frontend/store/hooks';
import { useSelector } from 'react-redux';


type AddWidgetModalProps = {
  isOpen: boolean;
  onClose: () => void;
  consoleName: string;
  dashboardId: string;
};

export default function AddExistingWidgetModal(props: AddWidgetModalProps) {
  const {
    isOpen,
    onClose,
    dashboardId
  } = props;

  const [widgetToAdd, setWidgetToAdd] = useState<string>();
  const [error, setError] = React.useState<string | undefined>(undefined);

  const dashboardWidgets = useSelector(selectDashboardWidgets(dashboardId))?.map((widget) => { 
    return widget.id;
  });
  const consoleWidgets = Object.keys(useAppSelector(selectConsoleWidgets));


  const reducedWidgets = consoleWidgets?.filter((consoleWidget: any) => { 
    return !dashboardWidgets.includes(consoleWidget)
  })


  async function resetAndClose() {
    setError(undefined);
    onClose();
  }

  async function onSaveClick() {
    setError(undefined);
    try {
      //placeholder until we have the appropriate apis
    } catch (e) {
      setError(`Error adding widget ${widgetToAdd} to dashboard: ${e}`);
    }
    onClose();
  }

  const widgetOptions = reducedWidgets.map(item => {
    return (
      <option value={item} key={item}> {item} </option>
    )
  });

  return (
    <Modal isOpen={isOpen} onClose={resetAndClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{'Add Existing Widget'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
        <FormControl
         isInvalid={!isEmpty(error)}
        >
          <FormLabel>{'Widget Type'}</FormLabel>
          <Select size='md' onChange={(event) => setWidgetToAdd(event.target.value)} placeholder='Select option'>
            {widgetOptions}
          </Select>
        </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button variant='ghost' onClick={resetAndClose}>
            {'Close'}
          </Button>
          <Button
            colorScheme='blue'
            mr={3}
            onClick={onSaveClick}
            isDisabled={ isEmpty(widgetToAdd) }
          >
            {'Add Widget'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};