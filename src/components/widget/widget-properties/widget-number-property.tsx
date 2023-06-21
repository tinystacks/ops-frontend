import {
  FormControl, NumberInput, NumberInputField, NumberInputStepper, NumberDecrementStepper, NumberIncrementStepper
} from '@chakra-ui/react';
import React from 'react';
import { WidgetPropertyProps } from 'ops-frontend/components/widget/widget-properties/widget-property-types';

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
      <NumberInput value={value} onChange={(event) => setter(name, event)} >
        <NumberInputField />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
    </FormControl>
  );
}