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
import { FlatSchema, Json } from 'ops-frontend/types';
import WidgetProperty from 'ops-frontend/components/widget/widget-propety';
import { doNothing } from 'ops-frontend/utils/do-nothing';
import isPlainObject from 'lodash.isplainobject';

export default function EditWidgetModal(props: {
  console: string;
  widgetId: string;
  widgetProperties?: FlatSchema[];
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
    widgetProperties,
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

  function updateWidgetProperty (key: string, newValue: string) {
    const widgetJson = JSON.parse(value);
    widgetJson[key] = newValue;
    setValue(JSON.stringify(widgetJson));
  }

  let widgetInputs = [
    <Textarea
      key={`widget-input-${widget.id}`}
      value={value}
      onChange={handleInputChange}
      size='sm'
    />
  ];

  if (widgetProperties) {
    const widgetJson = JSON.parse(value);
    widgetInputs = [
      <WidgetProperty
        key={`${widgetJson.id}-id`}
        name='id'
        value={widgetJson.id}
        setter={doNothing}
        isDisabled
        isRequired
      />,
      <WidgetProperty
        key={`${widgetJson.id}-type`}
        name='type'
        value={widgetJson.type}
        setter={doNothing}
        isDisabled
        isRequired
      />
    ]; 
    
    widgetInputs.push(...widgetProperties.map((widgetProperty: FlatSchema) => {
      const {
        name,
        isRequired
      } = widgetProperty;
      const propertyValue = widgetJson[name];
      const inputValue = isPlainObject(propertyValue) || Array.isArray(propertyValue) ?
        JSON.stringify(propertyValue) :
        propertyValue;
      return (
        <WidgetProperty
          key={`widget-input-${name}`}
          name={name}
          value={inputValue}
          setter={updateWidgetProperty}
          isRequired={isRequired}
        />
      );
    }));
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
            body={widgetInputs}
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