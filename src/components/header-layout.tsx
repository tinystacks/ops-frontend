import { Box, Container, useColorModeValue } from '@chakra-ui/react';
import React from 'react';

export function HeaderLayout(props: { children?: React.ReactNode }) {
  const boxBg = useColorModeValue('white', 'gray.100');
  return (
    <Box bg={boxBg} py="4" shadow="sm" {...props} className='globalHeader'>
      <Container maxW="7xl">
        {props.children}
      </Container>
    </Box>
  );
}