import { Parameter } from '@tinystacks/ops-model';
import {
  Checkbox,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper
} from '@chakra-ui/react';

type ParameterInputProps = {
  label: string;
  value: any;
  inputType: Parameter.type;
  sensitive?: boolean;
  helperText?: string;
  propKey: string;
  setter: (key: string, newValue: any) => void,
  isInvalid?: boolean;
  errorMessage?: string;
  rightActionButton?: JSX.Element;
};

type FormType = 'password' | 'text' | 'number' | 'datetime-local' | 'checkbox';

function getFormType (inputType: Parameter.type): FormType {
  switch (inputType) {
    case Parameter.type.STRING:
      return 'text';
    case Parameter.type.NUMBER:
      return 'number';
    case Parameter.type.DATE:
      return 'datetime-local';
    case Parameter.type.BOOLEAN:
      return 'checkbox';
    default:
      return 'text';
  }
}

function NumInput (props: ParameterInputProps) {
  const {
    value,
    propKey,
    setter
  } = props;
  return (
    <NumberInput value={value} onChange={(newValue) => setter(propKey, newValue)} w='full'>
      <NumberInputField />
      <NumberInputStepper>
        <NumberIncrementStepper />
        <NumberDecrementStepper />
      </NumberInputStepper>
    </NumberInput>
  );
}

export default function ParameterInput (props: ParameterInputProps) {
  const {
    label,
    value,
    inputType,
    helperText,
    propKey,
    setter,
    isInvalid,
    errorMessage,
    rightActionButton
  } = props;

  const formType = getFormType(inputType);

  let input = (<></>);
  switch (formType) {
    case 'text':
      input = (
        <Input
          type={formType}
          value={value}
          data-form-type='other'
          onChange={(event) => { setter(propKey, event.target.value)} }
          w='full'
        />
      );
      break;
    case 'number':
      input = (
        <NumInput {...props} />
      );
      break;
    case 'checkbox':
      input = (
        <Checkbox isChecked={value} onChange={(event) => setter(propKey, event.target.checked)} w='full' />
      );
      break;
    case 'datetime-local':
      input = (
        <Input
          type={formType}
          value={value}
          data-form-type='other'
          onChange={(event) => { setter(propKey, event.target.value)} }
          w='full'
        />
      );
      break;
    default:
      break;

  }

  let footer = (<FormHelperText>{helperText || ''}</FormHelperText>);
  if (isInvalid) {
    footer = (<FormErrorMessage>{errorMessage || ''}</FormErrorMessage>)
  }
  return (
    <FormControl
      isInvalid={isInvalid}
    >
      <FormLabel>{label}</FormLabel>
      <Flex>
        {input}
        {rightActionButton}
      </Flex>
      {footer}
    </FormControl>
  );
}