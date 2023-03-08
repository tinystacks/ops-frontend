import React from 'react';
import { Box, Container, useColorModeValue } from '@chakra-ui/react';
import Breadcrumbs from 'ops-frontend/components/layout/breadcrumbs';


export function HeaderLayout(props: { children?: React.ReactNode }) {
  const boxBg = useColorModeValue('white', 'gray.100');
  const textColor = useColorModeValue('gray.900', 'gray.900');

  return (
    <Box bg={boxBg} py="4" shadow="sm" {...props} className='globalHeader' textColor={textColor} color={textColor}>
      <Container maxW="7xl">
        <Breadcrumbs />
        {props.children}
      </Container>
    </Box>
  );
}