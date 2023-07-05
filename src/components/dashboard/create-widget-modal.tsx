import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
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
import apis from 'ops-frontend/utils/apis';
import { useState } from 'react';
import { createWidget, selectConsoleWidgets, selectProviders } from 'ops-frontend/store/consoleSlice';
import { useAppDispatch, useAppSelector } from 'ops-frontend/store/hooks';
import { loadWidgetProperties } from 'ops-frontend/components/dashboard/dashboard';
import { FlatSchema } from 'ops-frontend/types';
import { WidgetDropdownProperty } from 'ops-frontend/components/widget/widget-properties/widget-dropdown-property';
import { WidgetListProperty } from 'ops-frontend/components/widget/widget-properties/widget-list-property';
import { WidgetBooleanProperty } from 'ops-frontend/components/widget/widget-properties/widget-boolean-property';
import { WidgetProperty } from 'ops-frontend/components/widget/widget-properties/widget-propety';

type CreateWidgetModalProps = {
  isOpen: boolean;
  onClose: () => void;
  consoleName: string;
  dashboardId: string;
  widgetTypes: string[];
  dependencies: { [id: string]: string; }//FlatMap
};

export default function CreateWidgetModal(props: CreateWidgetModalProps) {
  const {
    isOpen,
    onClose,
    consoleName,
    widgetTypes,
    dependencies
  } = props;


  const dispatch = useAppDispatch();
  const [value, setValue] = React.useState('{}');
  const [widgetId] = useState<string>('');
  const [widgetType, setWidgetType] = useState<string>('');
  const [widgetFields, setWidgetFields] = useState<FlatSchema[]>([]);
  const [widgetIdIsInvalid, setWidgetIdIsInvalid] = useState<boolean>(false);
  const [widgetError, setWidgetError] = useState<string | undefined>(undefined);
  const [error, setError] = React.useState<string | undefined>(undefined);




  const providers = useAppSelector(selectProviders);
  const widgets = useAppSelector(selectConsoleWidgets);


  async function updateWidgetType(type: string) {
    setWidgetType(type);

    const widgetPropertiesToLoad = await loadWidgetProperties(type, dependencies);
    if (widgetPropertiesToLoad) {
      setWidgetFields(widgetPropertiesToLoad);
    }
  }

  function updateWidgetField(key: string, newValue: any) { 
      const widgetJson = JSON.parse(value);
      widgetJson[key] = newValue;
      setValue(JSON.stringify(widgetJson));
  }

  function updateWidgetId (widgetId: string) {

    updateWidgetField('id', widgetId);

    const allowedCharacters = /[^a-zA-Z0-9]+/;
    const nameIsInvalid = allowedCharacters.test(widgetId);
    if (nameIsInvalid) {
      setWidgetIdIsInvalid(nameIsInvalid);
      const nameCharacterMessage = 'Widget ids must only contain alphanumeric characters';
      setWidgetError(nameCharacterMessage);
    } else if (Object.keys(widgets).find(widget => widget === widgetId)) {
      setWidgetIdIsInvalid(true);
      const uniqueMessage = 'Widget already exists with this id';
      setWidgetError(uniqueMessage);
    } else {
      setWidgetIdIsInvalid(false);
      setWidgetError(undefined);
    }
  }


  async function resetAndClose() {
    setError(undefined);
    onClose();
  }

  async function onSaveClick() {
    setError(undefined);
    try {

     
      const createdWidget = await apis.createWidget(consoleName, JSON.parse(value));

      dispatch(createWidget(createdWidget));
    } catch (e) {
      setError(`Error creating widget: ${e}`);
    }
    onClose();
  }

  const widgetInputs = [];
  const widgetJson = JSON.parse(value);

  if (widgetFields) {
     widgetInputs.push(...widgetFields.map((widgetProperty: FlatSchema) => {
      const {
        name,
        isRequired,
        type
      } = widgetProperty;
      let widgetPropertyItem;
      const propertyValue = widgetJson[name];
      if (name === 'childrenIds') {
        widgetPropertyItem = (
          <WidgetDropdownProperty
            key={`widget-input-${name}`}
            options={Object.keys(widgets)}
            name={name}
            value={propertyValue}
            setter={updateWidgetField}
            isRequired={isRequired}
          />


        );
      }
      else if (name === 'providerIds') {
        widgetPropertyItem = (
          <WidgetDropdownProperty
            key={`widget-input-${name}`}
            options={Object.keys(providers)}
            name={name}
            value={propertyValue}
            setter={updateWidgetField}
            isRequired={isRequired}
          />
        );
      } else if (type === 'array') {
        widgetPropertyItem = (
          <WidgetListProperty
            key={`widget-input-${name}`}
            name={name}
            value={propertyValue}
            setter={updateWidgetField}
            isRequired={isRequired}
          />
        );
      } else if (type === 'boolean') {
        widgetPropertyItem = (
        <WidgetBooleanProperty
          key={`widget-input-${name}`}
          name={name}
          value={propertyValue}
          setter={updateWidgetField}
          isRequired={isRequired}
        />
        );
      } else { 
        widgetPropertyItem = (
          <WidgetProperty
          key={`widget-input-${name}`}
          name={name}
          value={propertyValue}
          setter={updateWidgetField}
          isRequired={isRequired}
        />
        );
      }
      return widgetPropertyItem;
    }));
  }

  const typeOptions = widgetTypes.map(item => {
    return (
      <option value={item} key={item}> {item} </option>
    )
  });


  return (
    <Modal isOpen={isOpen} onClose={resetAndClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{'Create Widget'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl isRequired>
            <FormLabel>{'Widget Type'}</FormLabel>
            <Select size='md' onChange={async (event) => await updateWidgetType(event.target.value)} placeholder='Select option'>
              {typeOptions}
            </Select>
          </FormControl>
          <FormControl
            isInvalid={!isEmpty(error)}
            isRequired
          >
            <FormLabel>{'Widget Id'}</FormLabel>
            <Input
              type='text'
              value={widgetId}
              onChange={(event) => updateWidgetId(event.target.value)}
              isInvalid={widgetIdIsInvalid}
            />
            <FormErrorMessage>{widgetError}</FormErrorMessage>
          </FormControl>
          {widgetInputs}
        </ModalBody>
        <ModalFooter>
          <Button variant='ghost' onClick={resetAndClose}>
            {'Close'}
          </Button>
          <Button
            colorScheme='blue'
            mr={3}
            onClick={onSaveClick}
            isDisabled={
              widgetIdIsInvalid ||
              isEmpty(widgetId) ||
              isEmpty(widgetType)
            }
          >
            {'Create Widget'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};