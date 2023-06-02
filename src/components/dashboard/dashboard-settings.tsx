import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Stack,
} from '@chakra-ui/react';
import { Dashboard } from '@tinystacks/ops-model';
import isEmpty from 'lodash.isempty';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

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

  const [dashboardName, setDashboardName] = useState<string>(dashboard.id);
  const [dashboardRoute, setDashboardRoute] = useState<string>(dashboard.route);
  const [dashboardNameIsInvalid, setDashboardNameIsInvalid] = useState<boolean>(false);
  const [dashboardNameError, setDashboardError] = useState<string | undefined>(undefined);
  const [routeIsInvalid, setRouteIsInvalid] = useState<boolean>(false);
  const [routeError, setRouteError] = useState<string | undefined>(undefined);

  const otherDashboards: Record<string, Dashboard> = Object.fromEntries(
    Object.entries(allDashboards)
      .filter(([id]) => id !== dashboard.id)
  );

  function submit () {
    const updatedDashboard: Dashboard = {
      ...dashboard,
      route: dashboardRoute
    }
    updateDashboard(updatedDashboard);
  }

  function updateDashboardName (dashboardName: string) {
    setDashboardName(dashboardName);

    const allowedCharacters = /[^a-zA-Z0-9]+/;
    const nameIsInvalid = allowedCharacters.test(dashboardName);
    if (nameIsInvalid) {
      setDashboardNameIsInvalid(nameIsInvalid);
      const nameCharacterMessage = t('nameCharacterMessage');
      setDashboardError(nameCharacterMessage);
    } else if (otherDashboards[dashboardName]) {
      setDashboardNameIsInvalid(true);
      const uniqueMessage = t('uniqueMessage');
      setDashboardError(uniqueMessage);
    } else {
      setDashboardNameIsInvalid(false);
      setDashboardError(undefined);
    }
  }
  
  function updateDashboardRoute (route: string) {
    setDashboardRoute(route);
    
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

  return (
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
              value={dashboardName}
              onChange={updateDashboardName}
              invalid={dashboardNameIsInvalid}
              error={dashboardNameError}
              disabled
            />
            <ValidatedInput
              label={t('dashboardRoute')}
              value={dashboardRoute}
              onChange={updateDashboardRoute}
              invalid={routeIsInvalid}
              error={routeError}
            />
            <Flex justifyContent='flex-end' alignContent='end' h='full' paddingTop='5'>
              <Button variant='ghost' onClick={onClose}>
                {tc('close')}
              </Button>
              <Button
                colorScheme='blue'
                mr={3}
                onClick={submit}
                isDisabled={
                  dashboardNameIsInvalid ||
                  routeIsInvalid ||
                  isEmpty(dashboardName) ||
                  isEmpty(dashboardRoute)
                }
              >
                {tc('save')}
              </Button>
            </Flex>
          </Box>
        </Box>
      </Stack>
    </Stack>
  );
};