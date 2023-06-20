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
  SimpleGrid,
  GridItem,
  IconButton,
  Select
} from '@chakra-ui/react';
import isEmpty from 'lodash.isempty';
import React from 'react';
import apis from 'ops-frontend/utils/apis';
import { useState } from 'react';
import { t } from 'i18next';
import { createWidget, selectDashboardWidgets } from 'ops-frontend/store/consoleSlice';
import { useAppDispatch } from 'ops-frontend/store/hooks';
import { useSelector } from 'react-redux';
import { AddIcon } from '@chakra-ui/icons'

type CreateWidgetModalProps = {
  isOpen: boolean;
  onClose: () => void;
  consoleName: string;
  dashboardId: string;
  widgetTypes: string[];
};

export default function CreateWidgetModal(props: CreateWidgetModalProps) {
  const {
    isOpen,
    onClose,
    consoleName,
    dashboardId, 
    widgetTypes
  } = props;


  const dispatch = useAppDispatch();

  const [widgetId, setWidgetId] = useState<string>(); //required
  const [widgetDisplayName, setWidgetDisplayName] = useState<string>(); //required
  const [widgetRegion, setWidgetRegion] = useState<string>(); 
  const [widgetProviders, setWidgetProviders] =  useState<string[]>(); 
  const [widgetChildren, setWidgetChildren] =  useState<string[]>(); 
  const [widgetType, setWidgetType] =  useState<string>(); //required
  const [widgetProperties, setWidgetProperties] = useState<{key: string, value: any}[]>([]);
  //need a way to add tyep location to dep list
  const [widgetIdIsInvalid, setWidgetIdIsInvalid] = useState<boolean>(false);
  const [widgetIdError, setWidgetError] = useState<string | undefined>(undefined);
  const [error, setError] = React.useState<string | undefined>(undefined);



  const widgets = useSelector(selectDashboardWidgets(dashboardId));

  function updateWidgetId (widgetId: string) {
    setWidgetId(widgetId);

    const allowedCharacters = /[^a-zA-Z0-9]+/;
    const nameIsInvalid = allowedCharacters.test(widgetId);
    if (nameIsInvalid) {
      setWidgetIdIsInvalid(nameIsInvalid);
      const nameCharacterMessage = t('nameCharacterMessage');
      setWidgetError(nameCharacterMessage);
    } else if (widgets[widgetId]) {
      setWidgetIdIsInvalid(true);
      const uniqueMessage = t('uniqueMessage');
      setWidgetError(uniqueMessage);
    } else {
      setWidgetIdIsInvalid(false);
      setWidgetError(undefined);
    }
  }

  function updateWidgetRegion(region: string){ 
    setWidgetRegion(region); 
  }


  const addProperty = () => {
    const properties = [...widgetProperties];
    properties.push({key: '', value: ''})
    setWidgetProperties(properties);
  }

  const onChangePropertyKey = (index: number) => (event: any) => {
    const properties = [...widgetProperties];
    properties[index].key = event.target.value;
    setWidgetProperties(properties);
  }

  const onChangePropertyValue = (index: number) => (event: any) => {
    const properties = [...widgetProperties];
    properties[index].value = event.target.value;
    setWidgetProperties(properties);
  }

  const widgetKeyValues = (item: {key: string, value: string}, index: number) => {
    return (
      <>
      <SimpleGrid columns={2} columnGap={3} rowGap={6} w="full">
      <GridItem colSpan={1}>
        <FormControl>
          <FormLabel>Key</FormLabel>
          <Input placeholder="key" type="text" value={item.key} onChange={onChangePropertyKey(index)}></Input>
        </FormControl>
      </GridItem>
      <GridItem colSpan={1}>
        <FormControl>
          <FormLabel>Value</FormLabel>
          <Input placeholder="value" type="text" value={item.value} onChange={onChangePropertyValue(index)}></Input>
        </FormControl>
      </GridItem>
    </SimpleGrid>
      </>
    );
  }


  async function resetAndClose() {
    setError(undefined);
    onClose();
  }

  async function onSaveClick() {
    setError(undefined);
    try {
      const widget = { 
        id: widgetId,
        displayName: widgetDisplayName,
        type: widgetType, 
        region: widgetRegion, 
        providerIds: widgetProviders || [], 
        childrenIds: widgetChildren || []
      };

      widgetProperties.forEach(item => {
        widget[item.key as keyof typeof widget] = item.value;
      });
      const createdWidget = await apis.createWidget(consoleName, widget);
      
      dispatch(createWidget(createdWidget));
    } catch (e) {
      setError(`Error creating widget: ${e}`);
    }
    onClose();
  }

  const extraProperties = widgetProperties.map((item, index) => widgetKeyValues(item, index));

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
          <FormErrorMessage>{widgetIdError}</FormErrorMessage>
        </FormControl>
        <FormControl>
          <FormLabel>{'Widget Display Name'}</FormLabel>
          <Input
            type='text'
            value={widgetDisplayName}
            onChange={(event) => setWidgetDisplayName(event.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel>{'Widget Region'}</FormLabel>
          <Input
            type='text'
            value={widgetRegion}
            onChange={(event) => updateWidgetRegion(event.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel>{'Widget Providers'}</FormLabel>
          <Input
            type='text'
            value={widgetProviders}
            onChange={(event) => setWidgetProviders(event.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel>{'Widget Children'}</FormLabel>
          <Input
            type='text'
            value={widgetChildren}
            onChange={(event) => setWidgetChildren(event.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel>{'Widget Type'}</FormLabel>
          <Select size='md' onChange={(event) => setWidgetType(event.target.value)} placeholder='Select option'>
          {typeOptions}
          </Select>
        </FormControl>
        {extraProperties}
        <Button
        as={IconButton}
        aria-label='Add Widget Property'
        size='sm'
        icon={<AddIcon />}
        variant='outline'
        onClick={addProperty}
        />
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
              isEmpty(widgetDisplayName) ||
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