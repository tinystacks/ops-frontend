import {
  Box, FormControl, FormLabel, IconButton, MenuButton, Input
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons'
import React from 'react';
import { WidgetListPropertyProps } from 'ops-frontend/components/widget/widget-properties/widget-property-types';

export function WidgetListProperty(props: WidgetListPropertyProps) {
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