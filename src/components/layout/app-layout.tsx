import React from 'react';
import { Box, Flex } from '@chakra-ui/react';
import Navbar from '../../components/layout/navbar.js';

interface LayoutProps {
  children?: React.ReactNode;
}

import { Inter } from '@next/font/google';

// If loading a variable font, you don't need to specify the font weight
const inter = Inter({ subsets: ['latin'] })


export function AppLayout (props: LayoutProps) {
  return (
    <Box h="100vh" className={inter.className}>
      <head>
        <title>OpsConsole</title>
        <meta name="description" content="The developer portal for cloud operations" />
        <link rel="icon" href="/iconv2.svg" />
      </head>
      <Flex flexDirection="column" h="100vh" minWidth="sm" overflow="auto" className='app'>
        <Navbar />
        {props.children}
      </Flex>
    </Box>
  );
}
