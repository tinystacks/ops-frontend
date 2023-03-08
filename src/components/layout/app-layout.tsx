import { Box, Flex } from '@chakra-ui/react';
// import { Footer } from 'components/common/Footer';
import Navbar from 'ops-frontend/components/layout/navbar';
import Head from 'next/head';
import React from 'react';

interface LayoutProps {
  children?: React.ReactNode;
}

import { Inter } from '@next/font/google';

// If loading a variable font, you don't need to specify the font weight
const inter = Inter({ subsets: ['latin'] })


export function AppLayout (props: LayoutProps) {
  return (
    <Box h="100vh" className={inter.className}>
      <Head>
        <title>TinyStacks</title>
        <meta name="description" content="Code to cloud in minutes" />
        <link rel="icon" href="/iconv2.svg" />
      </Head>
      <Flex flexDirection="column" h="100vh" minWidth="sm" overflow="auto" className='app'>
        <Navbar />
        {props.children}
        {/* <Footer /> */}
      </Flex>
    </Box>
  );
}
