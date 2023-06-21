import {
  Box, FormControl, FormLabel, Select
} from '@chakra-ui/react';
import React from 'react';
import { WidgetPropertyProps } from 'ops-frontend/components/widget/widget-properties/widget-property-types';

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
        <Select size='md' placeholder={value} onChange={(event) => setter(name, event.target.value)}>
          <option value='true'> True </option>
          <option value='false'> False </option>
        </Select>
      </FormControl>
    </Box>
  )
}