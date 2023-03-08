import {
  Box,
  Flex,
  HStack,
  VisuallyHidden,
} from '@chakra-ui/react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Logo } from 'ops-frontend/components/layout/logo';


export default function Navbar() {
  const { t: cm } = useTranslation('common');

  return (
    <Box position='fixed' w='full' zIndex='9999'>
      <Box as='header' bg='#02001E'>
        <Box maxW='7xl' mx='auto' py='2' px='4'>
          <Flex as='nav' justify='space-between'>
            <HStack spacing='8'>
              <Box as='a' rel='/'>
                <VisuallyHidden>{cm('opsConsole')}</VisuallyHidden>
                <Logo />
              </Box>
            </HStack>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
}
