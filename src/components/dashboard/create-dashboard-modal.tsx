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
  ModalOverlay
} from '@chakra-ui/react';
import { Dashboard } from '@tinystacks/ops-model';
import isEmpty from 'lodash.isempty';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type CreateDashboardModalProps = {
  isOpen: boolean;
  onClose: () => void;
  createDashboard: (dashboard: Dashboard) => void;
  dashboards: { [id: string]: Dashboard }
};

export default function CreateDashboardModal(props: CreateDashboardModalProps) {
  const {
    isOpen,
    onClose,
    createDashboard,
    dashboards
  } = props;
  const { t } = useTranslation('dashboard');
  const { t: tc } = useTranslation('common');

  const [dashboardName, setDashboardName] = useState<string>();
  const [dashboardDescription, setDashboardDescription] = useState<string>();
  const [dashboardRoute, setDashboardRoute] = useState<string>();
  const [dashboardNameIsInvalid, setDashboardNameIsInvalid] = useState<boolean>(false);
  const [dashboardNameError, setDashboardError] = useState<string | undefined>(undefined);
  const [routeIsInvalid, setRouteIsInvalid] = useState<boolean>(false);
  const [routeError, setRouteError] = useState<string | undefined>(undefined);

  function submit () {
    const dashboard: Dashboard = {
      id: dashboardName!,
      route: dashboardRoute!,
      description: dashboardDescription,
      widgetIds: []
    }
    createDashboard(dashboard);
  }

  function updateDashboardName (dashboardName: string) {
    setDashboardName(dashboardName);

    const allowedCharacters = /[^a-zA-Z0-9]+/;
    const nameIsInvalid = allowedCharacters.test(dashboardName);
    if (nameIsInvalid) {
      setDashboardNameIsInvalid(nameIsInvalid);
      const nameCharacterMessage = t('nameCharacterMessage');
      setDashboardError(nameCharacterMessage);
    } else if (dashboards[dashboardName]) {
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
    const existingRoute = Object.values(dashboards).find(d => d.route === route);
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
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t('createDashboard')}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
        <FormControl
          isInvalid={!isEmpty(dashboardNameError)}
          isRequired
        >
          <FormLabel>{t('dashboardName')}</FormLabel>
          <Input
            type='text'
            value={dashboardName}
            onChange={(event) => updateDashboardName(event.target.value)}
            isInvalid={dashboardNameIsInvalid}
          />
          <FormErrorMessage>{dashboardNameError}</FormErrorMessage>
        </FormControl>
        <FormControl
          isInvalid={!isEmpty(routeError)}
          isRequired
        >
          <FormLabel>{t('dashboardRoute')}</FormLabel>
          <Input
            type='text'
            value={dashboardRoute}
            onChange={(event) => updateDashboardRoute(event.target.value)}
            isInvalid={routeIsInvalid}
          />
          <FormErrorMessage>{routeError}</FormErrorMessage>
        </FormControl>
        <FormControl>
          <FormLabel>{t('dashboardDescription')}</FormLabel>
          <Input
            type='text'
            value={dashboardDescription}
            onChange={(event) => setDashboardDescription(event.target.value)}
          />
        </FormControl>
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
              dashboardNameIsInvalid ||
              routeIsInvalid ||
              isEmpty(dashboardName) ||
              isEmpty(dashboardRoute)
            }
          >
            {t('createDashboard')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};