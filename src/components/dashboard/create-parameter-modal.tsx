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
  Select
} from '@chakra-ui/react';
import { Parameter } from '@tinystacks/ops-model';
import isEmpty from 'lodash.isempty';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ParameterInput from 'ops-frontend/components/dashboard/parameter-input';

type CreateParameterModalProps = {
  isOpen: boolean;
  onClose: () => void;
  createParameter: (parameter: Parameter) => void;
  parameters: Parameter[]
};

export default function CreateParameterModal(props: CreateParameterModalProps) {
  const {
    isOpen,
    onClose,
    createParameter,
    parameters
  } = props;
  const { t } = useTranslation('dashboard');
  const { t: tc } = useTranslation('common');

  const [name, setName] = useState<string>('');
  const [nameIsInvalid, setNameIsInvalid] = useState<boolean>(false);
  const [nameError, setNameError] = useState<string | undefined>(undefined);
  
  const [type, setType] = useState<Parameter.type>(Parameter.type.STRING);
  const [typeIsInvalid, setTypeIsInvalid] = useState<boolean>(false);
  const [typeError, setTypeError] = useState<string | undefined>(undefined);

  const [paramDefault, setParamDefault] = useState<string>();
  const [paramDefaultIsInvalid, setParamDefaultIsInvalid] = useState<boolean>(false);
  const [paramDefaultError, setParamDefaultError] = useState<string | undefined>(undefined);

  function clearForm () {
    setName('');
    setNameIsInvalid(false);
    setNameError(undefined);
    
    setType(Parameter.type.STRING);
    setTypeIsInvalid(false);
    setTypeError(undefined);
    
    setParamDefault(undefined);
    setParamDefaultIsInvalid(false);
    setParamDefaultError(undefined);
  }

  function submit () {
    let valid = true;
    if (!name || name?.length === 0) {
      const requiredError = t('paramNameRequired');
      setNameIsInvalid(true);
      setNameError(requiredError);
      valid = false;
    }
    if (!type || type?.length === 0) {
      const requiredError = t('paramTypeRequired');
      setNameIsInvalid(true);
      setNameError(requiredError);
      valid = false;
    }
    if (valid) {
      const parameter: Parameter = {
        name,
        type,
        default: paramDefault
      }
      createParameter(parameter);
      clearForm();
    }
  }

  function updateName (name: string) {
    setName(name);

    const allowedCharacters = /[^a-zA-Z0-9]+/;
    const nameIsInvalid = allowedCharacters.test(name);
    if (nameIsInvalid) {
      setNameIsInvalid(nameIsInvalid);
      const nameCharacterMessage = t('nameCharacterMessage');
      setNameError(nameCharacterMessage);
    } else if (parameters.some(param => param.name === name)) {
      setNameIsInvalid(true);
      const uniqueMessage = t('uniqueMessage');
      setNameError(uniqueMessage);
    } else {
      setNameIsInvalid(false);
      setNameError(undefined);
    }
  }
  
  function updateType (type: Parameter.type) {
    setType(type);
    setTypeIsInvalid(false);
    setTypeError(undefined);
    setParamDefault(undefined);
  }
  
  function updateDefault (_key: string, paramDefault: string) {
    setParamDefault (paramDefault);
    setParamDefaultIsInvalid(false);
    setParamDefaultError(undefined);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t('createParameter')}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
        <FormControl
          isInvalid={nameIsInvalid}
          isRequired
        >
          <FormLabel>{t('paramName')}</FormLabel>
          <Input
            type='text'
            value={name}
            onChange={(event) => updateName(event.target.value)}
            isInvalid={nameIsInvalid}
          />
          <FormErrorMessage>{nameError}</FormErrorMessage>
        </FormControl>
        <FormControl
          isInvalid={typeIsInvalid}
          isRequired
        >
          <FormLabel>{t('parameterType')}</FormLabel>
          <Select
            value={type}
            onChange={(event) => updateType(event.target.value as Parameter.type)}
          >
            <option value={Parameter.type.BOOLEAN}>{Parameter.type.BOOLEAN}</option>
            <option value={Parameter.type.DATE}>{Parameter.type.DATE}</option>
            <option value={Parameter.type.NUMBER}>{Parameter.type.NUMBER}</option>
            <option value={Parameter.type.STRING}>{Parameter.type.STRING}</option>
          </Select>
          <FormErrorMessage>{typeError}</FormErrorMessage>
        </FormControl>
        <ParameterInput
            inputType={type}
            label={t('paramDefault')}
            propKey={name}
            value={paramDefault}
            setter={updateDefault}
            isInvalid={paramDefaultIsInvalid}
            errorMessage={paramDefaultError}
          />
        </ModalBody>
        <ModalFooter>
          <Button variant='ghost' onClick={onClose}>
            {tc('close')}
          </Button>
          <Button
            colorScheme='blue'
            mr={3}
            onClick={submit}
            isDisabled={
              nameIsInvalid ||
              typeIsInvalid ||
              paramDefaultIsInvalid ||
              isEmpty(name) ||
              isEmpty(type)
            }
          >
            {t('createParameter')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};