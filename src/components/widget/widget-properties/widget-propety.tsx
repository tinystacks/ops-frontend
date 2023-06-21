import { Box, FormControl, FormLabel, Input } from '@chakra-ui/react';
import React from 'react';
import { WidgetPropertyProps } from 'ops-frontend/components/widget/widget-properties/widget-property-types';


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
