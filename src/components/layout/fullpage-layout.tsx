import { Box, Container, useColorModeValue } from '@chakra-ui/react';
import React from 'react';

export function FullpageLayout(props: { children?: React.ReactNode }) {
  const boxBg = useColorModeValue('gray.100', 'gray.900');
  return (
    <Box bg={boxBg} py="4" shadow="sm" style={{ width: '100%' }}{...props}>
      <Container maxW="7xl">
        {props.children}
      </Container>
    </Box>
  );
}