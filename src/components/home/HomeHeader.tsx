import { ChevronRightIcon } from '@chakra-ui/icons';
import {
  useColorModeValue,
  Flex,
  Heading,
  Text,
  Breadcrumb,
  BreadcrumbItem,
  Link,
  Button,
  HStack,
} from '@chakra-ui/react';
import { HeaderLayout } from 'components/header-layout';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

export const HomeHeader = () => {
  const { t } = useTranslation('isv');
  const { t: tc } = useTranslation('common');
  const blue = useColorModeValue('blue.600', 'blue.200');
  return (
    <HeaderLayout>
      <Breadcrumb
        pb='4'
        spacing='8px'
        separator={<ChevronRightIcon color='gray.500' />}
      >
        <BreadcrumbItem>
          <Text>{tc('opsConsole')}</Text>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <Text>{tc('dashboards')}</Text>
        </BreadcrumbItem>
      </Breadcrumb>
      <Flex justify='space-between'>
        <Heading size='lg' pb='4'>
          {t('yourTemplates')}
        </Heading>
        <HStack>
          <Button
            colorScheme='blue'
          >
            {t('createTemplate')}
          </Button>
        </HStack>
      </Flex>
      <Text color={useColorModeValue('gray.600', 'gray.400')}>
        <Trans i18nKey='yourTemplatesDesc' ns='isv'>
          1
          <Link href={''} target='_blank' color={blue}>
            2
          </Link>
        </Trans>
      </Text>
    </HeaderLayout>
  );
};
