import {
  Box, FormControl, FormLabel, IconButton, MenuButton, Input, Select, NumberInput,
  NumberInputField, NumberInputStepper, NumberDecrementStepper, NumberIncrementStepper
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons'
import React from 'react';

export type WidgetPropertyProps = {
  name: string;
  value: string;
  setter: (key: string, newValue: any) => void;
  isRequired?: boolean;
  isDisabled?: boolean;
};

type WidgetListProperty = Omit<WidgetPropertyProps, 'value'> & {
  value: string[];
}

type WidgetDropdownPropertyProps = Omit<WidgetPropertyProps, 'value'> & {
  value: string[];
  options: string[];
}

export function WidgetProperty(props: WidgetPropertyProps) {
  const {
    name,
    value,
    setter,
    isRequired = false,
    isDisabled = false,
  } = props;

  return (
    <Box p='2' w='full'>
      <FormControl
        isDisabled={isDisabled}
        isRequired={isRequired}
      >
        <FormLabel>{name}</FormLabel>
        <Input
          type='text'
          value={value}
          onChange={(event) => setter(name, event.target.value)}
          data-form-type='other'
          isDisabled={isDisabled}
        />
      </FormControl>
    </Box>
  );
}


export function WidgetListProperty(props: WidgetListProperty) {
  const [listValue, setListValue] = React.useState(props.value);

  const {
    name,
    value,
    setter,
    isRequired = false,
    isDisabled = false,
  } = props;

  const addItem = () => {
    const newValue = [...listValue, ''];
    setListValue(newValue);
    setter(name, newValue);
  }

  const deleteItem = (index: number) => () => {
    const newList = listValue;
    newList.splice(index, 1);
    setListValue(newList);

    setter(name, listValue);
  }

  const onValueChange = (event: any, index: number) => {
    const newList = listValue;
    newList[index] = event.target.value;
    setListValue(newList);

    setter(name, listValue);

  }

  function listItem(item: string, index: number) {

    return (
      <>
        <Input
          type='text'
          value={item}
          key={index}
          onChange={(event) => onValueChange(event, index)}
          data-form-type='other'
        />
        <MenuButton
          as={IconButton}
          aria-label='Delete List Item'
          size='sm'
          icon={<DeleteIcon />}
          variant='outline'
          onClick={deleteItem(index)}
        />
      </>

    );
  }

  const input =
    (
      <>
        {value.map((item: string, index: number) => listItem(item, index))}
        <MenuButton
          as={IconButton}
          aria-label='Add List Item'
          size='sm'
          icon={<AddIcon />}
          variant='outline'
          onClick={addItem}
        />

      </>);

  return (
    <Box p='2' w='full'>
      <FormControl
        isDisabled={isDisabled}
        isRequired={isRequired}
      >
        <FormLabel>{name}</FormLabel>
        {input}
      </FormControl>
    </Box>
  )


}

//for childrenIds and providers
export function WidgetDropdownProperty(props: WidgetDropdownPropertyProps) {

  const [listValue, setListValue] = React.useState(props.value);
  const {
    name,
    value,
    options,
    setter,
    isRequired = false,
    isDisabled = false,
  } = props;

  const addItem = () => {
    const newValue = [...listValue, ''];
    setListValue(newValue);
    setter(name, newValue);
  }

  const deleteItem = (index: number) => () => {
    const newList = listValue;
    newList.splice(index, 1);
    setListValue(newList);

    setter(name, listValue);
  }

  const onValueChange = (event: any, index: number) => {
    const newList = listValue;
    newList[index] = event.target.value;
    setListValue(newList);
    setter(name, listValue);

  }

  const optionItems = options.map(item => {
    return (
      <option value={item} key={item}> {item} </option>
    )
  });

  function listItem(item: string, index: number) {

    return (
      <>
        <Select size='md' onChange={(event) => onValueChange(event, index)} value={item} placeholder='Select option'>
          {optionItems}
        </Select>
        <MenuButton
          as={IconButton}
          aria-label='Delete List Item'
          size='sm'
          icon={<DeleteIcon />}
          variant='outline'
          onClick={deleteItem(index)}
        />
      </>

    );
  }

  const input = (
    <>
      {value.map((item: string, index: number) => listItem(item, index))}
      <MenuButton
        as={IconButton}
        aria-label='Add List Item'
        size='sm'
        icon={<AddIcon />}
        variant='outline'
        onClick={addItem}
      />
    </>

  )

  return (
    <Box p='2' w='full'>
      <FormControl
        isDisabled={isDisabled}
        isRequired={isRequired}
      >
        <FormLabel>{name}</FormLabel>
        {input}
      </FormControl>
    </Box>
  )

}

export function WidgetNumberProperty(props: WidgetPropertyProps) {
  const {
    name,
    value,
    setter,
    isRequired = false,
    isDisabled = false,
  } = props;

  return (
    <FormControl
      isDisabled={isDisabled}
      isRequired={isRequired}
    >
      <NumberInput value={value} onChange={(event) => setter(name, event.target.value)}>
        <NumberInputField />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
    </FormControl>
  );
}

export function WidgetBooleanProperty(props: WidgetPropertyProps) {
  const {
    name,
    value,
    setter,
    isRequired = false,
    isDisabled = false,
  } = props;


  return (
    <Box p='2' w='full'>
      <FormControl
        isDisabled={isDisabled}
        isRequired={isRequired}
      >
        <FormLabel>{name}</FormLabel>
        <Select size='md' placeholder={value} onChange={(event) => setter(name, [event.target.value])}>
          <option value='true'> True </option>
          <option value='false'> False </option>
        </Select>
      </FormControl>
    </Box>
  )
}