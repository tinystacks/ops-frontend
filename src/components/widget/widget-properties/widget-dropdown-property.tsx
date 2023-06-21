import {
  Box, FormControl, FormLabel, IconButton, MenuButton, Select
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons'
import React from 'react';
import { WidgetDropdownPropertyProps } from 'ops-frontend/components/widget/widget-properties/widget-property-types';

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