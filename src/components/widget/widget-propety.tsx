import { Box, FormControl, FormLabel, Input } from '@chakra-ui/react';

export type WidgetPropertyProps = {
  name: string;
  value: string;
  setter: (key: string, newValue: string) => void;
  isRequired?: boolean;
  isDisabled?: boolean;
};

export default function WidgetProperty (props: WidgetPropertyProps) {
  const {
    name,
    value,
    setter,
    isRequired = false,
    isDisabled = false
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