import { Box, Flex } from '@chakra-ui/react';
// import { Footer } from 'components/common/Footer';
// import Navbar from 'components/navbar/Navbar';
import Head from 'next/head';
import React from 'react';

interface LayoutProps {
  children?: React.ReactNode;
}

export function AppLayout (props: LayoutProps) {
  return (
    <Box h="100vh">
      <Head>
        <title>TinyStacks</title>
        <meta name="description" content="Code to cloud in minutes" />
        <link rel="icon" href="/iconv2.svg" />
      </Head>
      <Flex flexDirection="column" h="100vh" minWidth="sm" overflow="auto" className='app'>
        {/* <Navbar /> */}
        {props.children}
        {/* <Footer /> */}
      </Flex>
    </Box>
  );
}
