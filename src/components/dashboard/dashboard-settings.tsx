import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  IconButton,
  Input,
  Stack,
  useDisclosure,
} from '@chakra-ui/react';
import { Dashboard, Parameter } from '@tinystacks/ops-model';
import isEmpty from 'lodash.isempty';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ParameterInput from 'ops-frontend/components/dashboard/parameter-input';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import CreateParameterModal from 'ops-frontend/components/dashboard/create-parameter-modal';

type ValidatedInputProps = {
  label: string;
  value: string;
  onChange: (newValue: string) => void;
  invalid?: boolean;
  disabled?: boolean;
  error?: string
};

function ValidatedInput (props: ValidatedInputProps) {
  const {
    label,
    value,
    onChange,
    invalid,
    disabled,
    error
  } = props;
  return (
    <Box p='2' maxW='full' minW='md'>
      <FormControl
        isInvalid={!isEmpty(error)}
        isRequired
      >
        <FormLabel>{label}</FormLabel>
        <Input
          type='text'
          value={value}
          onChange={(event) => onChange(event.target.value)}
          isInvalid={invalid}
          isDisabled={disabled}
          data-form-type='other'
        />
        <FormErrorMessage>{error}</FormErrorMessage>
      </FormControl>
    </Box>
  );
}

type DashboardSettingsProps = {
  dashboard: Dashboard;
  allDashboards: { [id: string]: Dashboard };
  onClose: () => void;
  updateDashboard: (dashboard: Dashboard) => void;
};

export default function DashboardSettings(props: DashboardSettingsProps) {
  const {
    dashboard,
    allDashboards,
    onClose,
    updateDashboard
  } = props;
  const { t } = useTranslation('dashboard');
  const { t: tc } = useTranslation('common');

  const [name, setName] = useState<string>(dashboard.id);
  const [nameIsInvalid, setNameIsInvalid] = useState<boolean>(false);
  const [nameError, setNameError] = useState<string | undefined>(undefined);
  
  const [route, setRoute] = useState<string>(dashboard.route);
  const [routeIsInvalid, setRouteIsInvalid] = useState<boolean>(false);
  const [routeError, setRouteError] = useState<string | undefined>(undefined);

  const [description, setDescription] = useState<string>(dashboard.description || '');
  
  const [parameters, setParameters] = useState<Parameter[]>(dashboard.parameters || []);

  const {
    isOpen: createParamIsOpen,
    onOpen: createParamOnOpen,
    onClose: createParamOnClose
  } = useDisclosure();
  
  const otherDashboards: Record<string, Dashboard> = Object.fromEntries(
    Object.entries(allDashboards)
      .filter(([id]) => id !== dashboard.id)
  );

  function submit () {
    const updatedDashboard: Dashboard = {
      ...dashboard,
      route,
      description,
      parameters
    }
    updateDashboard(updatedDashboard);
  }

  function updateName (name: string) {
    setName(name);

    const allowedCharacters = /[^a-zA-Z0-9]+/;
    const nameIsInvalid = allowedCharacters.test(name);
    if (nameIsInvalid) {
      setNameIsInvalid(nameIsInvalid);
      const nameCharacterMessage = t('nameCharacterMessage');
      setNameError(nameCharacterMessage);
    } else if (otherDashboards[name]) {
      setNameIsInvalid(true);
      const uniqueMessage = t('uniqueMessage');
      setNameError(uniqueMessage);
    } else {
      setNameIsInvalid(false);
      setNameError(undefined);
    }
  }
  
  function updateRoute (route: string) {
    setRoute(route);
    
    const allowedCharacters = /[^a-zA-Z0-9-]+/;
    const routeIsInvalid = allowedCharacters.test(route);
    const existingRoute = Object.values(otherDashboards).find(d => d.route === route);
    if (routeIsInvalid) {
      setRouteIsInvalid(routeIsInvalid);
      const routeCharacterMessage = t('routeCharacterMessage');
      setRouteError(routeCharacterMessage);
    } else if (existingRoute) {
      setRouteIsInvalid(true);
      const uniqueMessage = t('uniqueMessage');
      setRouteError(uniqueMessage);
    } else {
      setRouteIsInvalid(false);
      setRouteError(undefined);
    }
  }

  function updateParameter (key: string, value: any) {
    let param = {} as Parameter;
    const paramIndex = parameters.findIndex(p => p.name === key);
    if (paramIndex !== -1) {
      param = parameters.at(paramIndex) || param;
      param = { ...param, default: value };
      const updatedParams = [...parameters];
      updatedParams[paramIndex] = param;
      setParameters(updatedParams); 
    }
  }

  function createParameter (param: Parameter) {
    createParamOnClose();
    const newParams = [...parameters, param];
    setParameters(newParams);
  }

  function deleteParameter (name: string) {
    const params = parameters.filter(p => p.name !== name);
    setParameters(params);
  }

  return (
    <>
      <CreateParameterModal
        createParameter={createParameter}
        isOpen={createParamIsOpen}
        onClose={createParamOnClose}
        parameters={parameters}
      />
      <Stack flex="1" direction={{ base: 'column' }} align="center" bgColor='gray.100'>
        <Stack
          flex="1"
          align="center"
          py="4"
          px={{ base: '4', lg: '8' }}
          w="full"
          spacing={3}
        >
          <Box
            className='widget'
            w="full"
            minW="lg"
          >
            <Box
              className='widgetHeader'
              p='4'
            >
              <Heading as='h4' size='md'>
                {t('dashboardSettings')}
              </Heading>
            </Box>
            <Box p='4'>
              <ValidatedInput
                label={t('dashboardName')}
                value={name}
                onChange={updateName}
                invalid={nameIsInvalid}
                error={nameError}
                disabled
              />
              <ValidatedInput
                label={t('dashboardRoute')}
                value={route}
                onChange={updateRoute}
                invalid={routeIsInvalid}
                error={routeError}
              />
              <ValidatedInput
                label={t('dashboardDescription')}
                value={description}
                onChange={setDescription}
              />
              </Box>
              <Box
                p='4'
                borderBottom='1px'
                borderColor='gray.100'
              >
                <Heading as='h4' size='sm'>
                  {t('dashboardParameters')}
                </Heading>
              </Box>
              <Box p='4'>
                {parameters.map(param => (
                  <Box
                    p='2'
                    maxW='full'
                    minW='md'
                    key={`${name}-param-${param.name}-box`}
                  >
                    <ParameterInput
                      key={`${name}-param-${param.name}`}
                      inputType={param.type || Parameter.type.STRING}
                      label={param.name}
                      propKey={param.name}
                      value={param.default}
                      setter={updateParameter}
                      rightActionButton={<IconButton
                        aria-label={`Delete ${name} parameter`}
                        variant='ghost'
                        icon={<DeleteIcon />}
                        onClick={() => deleteParameter(param.name)}
                      />}
                    />
                  </Box>
                ))}
                  <Button
                    leftIcon={<AddIcon />}
                    variant='outline'
                    onClick={createParamOnOpen}
                  >
                    {t('addParam')}
                  </Button>
                <Flex justifyContent='flex-end' alignContent='end' h='full' paddingTop='5'>
                  <Button variant='ghost' onClick={onClose}>
                    {tc('close')}
                  </Button>
                  <Button
                    colorScheme='blue'
                    mr={3}
                    onClick={submit}
                    isDisabled={
                      nameIsInvalid ||
                      routeIsInvalid ||
                      isEmpty(name) ||
                      isEmpty(route)
                    }
                  >
                    {tc('save')}
                  </Button>
                </Flex>
            </Box>
          </Box>
        </Stack>
      </Stack>
    </>
  );
};